export function internalAuth(req, res, next) {
    const auth =
        req.headers.authorization;

    const expected =
        `Bearer ${process.env.AI_SERVICE_KEY}`;

    if (
        !auth ||
        auth !== expected
    ) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED_AI_SERVICE_REQUEST',
                message: 'Unauthorized'
            }
        });
    }

    next();
}