import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes.js";
import intakeRoutes from "./routes/intake.routes.js";
import ocrRoutes from "./routes/ocr.routes.js";
import voiceRoutes
    from "./routes/voice.routes.js";

const app = express();

app.use(cors());

app.use(
    express.json({
        limit: "1mb"
    })
);

app.get("/", (req, res) => {
    res.json({
        name: "Quantum Care AI Service",
        status: "running"
    });
});

app.use("/health", healthRoutes);

app.use("/api/v1/intake", intakeRoutes);

app.use((err, req, res, next) => {
    console.error("SERVER ERROR:", err);

    res.status(500).json({
        error: "Internal server error."
    });
});

app.use(
    "/internal/ai/v1/ocr",
    ocrRoutes
);

app.use(
    "/api/v1/voice",
    voiceRoutes
);

export default app;