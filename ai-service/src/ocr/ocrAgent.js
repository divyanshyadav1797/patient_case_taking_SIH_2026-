import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

import {
    createPartFromUri,
    createUserContent
} from '@google/genai';

import ai from '../ai/geminiClient.js';

import {
    OCR_SYSTEM_PROMPT
} from './ocrPrompt.js';

import {
    ocrResponseSchema
} from './ocrSchema.js';

const rawModel = (process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite').trim().toLowerCase().replace(/\s+/g, '-');
const MODEL = rawModel.includes('gemini') ? rawModel : 'gemini-3.5-flash-lite';

export async function analyzeDocument({
    buffer,
    mimeType,
    originalName
}) {
    const extension =
        path.extname(originalName) ||
        extensionFromMime(mimeType);

    const tempPath =
        path.join(
            os.tmpdir(),
            `qc-ocr-${crypto.randomUUID()}${extension}`
        );

    try {
        await fs.writeFile(
            tempPath,
            buffer
        );

        const file =
            await ai.files.upload({
                file: tempPath,

                config: {
                    mimeType,
                    displayName: originalName
                }
            });

        let fileInfo =
            await ai.files.get({
                name: file.name
            });

        while (
            fileInfo.state === 'PROCESSING'
        ) {
            await new Promise(
                resolve =>
                    setTimeout(resolve, 1500)
            );

            fileInfo =
                await ai.files.get({
                    name: file.name
                });
        }

        if (
            fileInfo.state === 'FAILED'
        ) {
            throw new Error(
                'Gemini failed to process the uploaded document.'
            );
        }

        const prompt = `
${OCR_SYSTEM_PROMPT}

Original file:
${originalName}

Please analyze the supplied document.
`;

        const response =
            await ai.models.generateContent({
                model: MODEL,

                contents:
                    createUserContent([
                        createPartFromUri(
                            file.uri,
                            file.mimeType
                        ),
                        prompt
                    ]),

                config: {
                    responseMimeType:
                        'application/json',

                    responseSchema:
                        ocrResponseSchema,

                    temperature: 0.1
                }
            });

        if (!response.text) {
            throw new Error(
                'Gemini returned an empty OCR response.'
            );
        }

        return JSON.parse(
            response.text
        );

    } finally {
        await fs.rm(
            tempPath,
            { force: true }
        );
    }
}

function extensionFromMime(mimeType) {
    const extensions = {
        'application/pdf': '.pdf',
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp'
    };

    return (
        extensions[mimeType] ||
        '.bin'
    );
}