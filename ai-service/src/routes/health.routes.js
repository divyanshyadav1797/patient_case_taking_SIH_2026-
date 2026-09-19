import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
    res.json({
        service: "quantum-care-ai",
        status: "ok"
    });
});

export default router;