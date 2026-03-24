require("dotenv").config();

module.exports = {
    port: process.env.PORT || 3001,
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret:
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh",
    dbUrl: process.env.DB_URL || "http://localhost:3002",
    accessTokenExpiry: "15m",
    refreshTokenExpiry: "7d",
    resetTokenExpiry: "1h",
    binID: process.env.BIN_ID,
    xMasterKey: process.env.X_MASTER_KEY,
    xAccessKey: process.env.X_ACCESS_KEY,
    FRONTEND_URL: process.env.FRONTEND_URL,
    email: {
        host: process.env.EMAIL_HOST || "smtp.ethereal.email",
        port: process.env.EMAIL_PORT || 587,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    jwtResetSecret:
        process.env.JWT_RESET_SECRET || process.env.JWT_SECRET + "_reset",
};
