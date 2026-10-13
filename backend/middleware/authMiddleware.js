
const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Not authorized, token missing"
        });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
        return res.status(401).json({
            message: "Not authorized, token missing"
        });
    }

    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not configured.");

        return res.status(500).json({
            message: "Authentication service is not configured"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (
            !decoded ||
            typeof decoded.userId !== "string" ||
            !decoded.userId.trim()
        ) {
            return res.status(401).json({
                message: "Not authorized, invalid token"
            });
        }

        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Not authorized, invalid token"
        });
    }
};

module.exports = protect;
