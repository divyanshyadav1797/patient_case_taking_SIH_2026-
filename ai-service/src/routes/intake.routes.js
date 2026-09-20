import { Router } from "express";

import {
    createSession,
    getSession,
    saveSession
} from "../intake/sessionStore.js";

import { generateNextQuestion } from "../ai/intakeAgent.js";
import { generateClinicalReport } from "../ai/reportAgent.js";

const router = Router();

const MAX_QUESTIONS =
    Number(process.env.MAX_QUESTIONS) || 6;

router.post("/start", async (req, res) => {
    try {
        const {
            patientId,
            chiefComplaint,
            language,
            patientProfile
        } = req.body;

        if (!chiefComplaint?.trim()) {
            return res.status(400).json({
                error: "chiefComplaint is required."
            });
        }

        const session = createSession({
            patientId,
            chiefComplaint: chiefComplaint.trim(),
            language,
            patientProfile
        });

        const question = await generateNextQuestion({
            patientProfile: session.patientProfile,
            chiefComplaint: session.chiefComplaint,
            conversation: [],
            questionCount: 0,
            maxQuestions: MAX_QUESTIONS
        });

        session.currentQuestion = question;
        session.questionCount = 1;

        saveSession(session);

        return res.json({
            sessionId: session.sessionId,
            question
        });

    } catch (error) {
        console.error("INTAKE START ERROR:", error);

        return res.status(500).json({
            error: "Unable to start intake."
        });
    }
});

router.post("/:sessionId/answer", async (req, res) => {
    try {
        const { sessionId } = req.params;

        const {
            answer,
            answerMethod = "choice"
        } = req.body;

        const session = getSession(sessionId);

        if (!session) {
            return res.status(404).json({
                error: "Intake session not found."
            });
        }

        if (session.status !== "active") {
            return res.status(400).json({
                error: "This intake session is no longer active."
            });
        }

        if (!answer?.trim()) {
            return res.status(400).json({
                error: "Answer is required."
            });
        }

        session.conversation.push({
            question: session.currentQuestion.question,
            options: session.currentQuestion.options,
            answer: answer.trim(),
            answerMethod,
            timestamp: new Date().toISOString()
        });

        if (session.questionCount >= MAX_QUESTIONS) {
            session.status = "completed";

            session.report = await generateClinicalReport(session);

            saveSession(session);

            return res.json({
                complete: true,
                report: session.report
            });
        }

        const nextQuestion = await generateNextQuestion({
            patientProfile: session.patientProfile,
            chiefComplaint: session.chiefComplaint,
            conversation: session.conversation,
            questionCount: session.questionCount,
            maxQuestions: MAX_QUESTIONS
        });

        if (nextQuestion.complete) {
            session.status = "completed";
            session.currentQuestion = null;

            session.report = await generateClinicalReport(session);

            saveSession(session);

            return res.json({
                complete: true,
                report: session.report
            });
        }

        session.questionCount += 1;
        session.currentQuestion = nextQuestion;

        saveSession(session);

        return res.json({
            complete: false,
            question: nextQuestion
        });

    } catch (error) {
        console.error("========== INTAKE START ERROR ==========");
        console.error("Name:", error?.name);
        console.error("Message:", error?.message);
        console.error("Status:", error?.status);
        console.error("Code:", error?.code);
        console.error("Stack:", error?.stack);
        console.error("Full error:", error);
        console.error("========================================");

        return res.status(500).json({
            error: "Unable to start intake.",
            details: error?.message || "Unknown error"
        });
    }
});

router.get("/:sessionId", (req, res) => {
    const session = getSession(req.params.sessionId);

    if (!session) {
        return res.status(404).json({
            error: "Session not found."
        });
    }

    return res.json({
        sessionId: session.sessionId,
        status: session.status,
        questionCount: session.questionCount,
        currentQuestion: session.currentQuestion,
        report: session.report
    });
});

export default router;