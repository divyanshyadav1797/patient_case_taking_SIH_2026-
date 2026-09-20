import crypto from "crypto";

const sessions = new Map();

export function createSession(data) {
    const sessionId = crypto.randomUUID();

    const session = {
        sessionId,
        patientId: data.patientId,
        language: data.language || "English",

        patientProfile: data.patientProfile || {},

        chiefComplaint: data.chiefComplaint,

        conversation: [],

        currentQuestion: null,

        questionCount: 0,

        status: "active",

        report: null,

        createdAt: new Date().toISOString()
    };

    sessions.set(sessionId, session);

    return session;
}

export function getSession(sessionId) {
    return sessions.get(sessionId);
}

export function saveSession(session) {
    sessions.set(session.sessionId, session);

    return session;
}