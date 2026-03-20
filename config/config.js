require("dotenv").config();

module.exports = {
    port: process.env.PORT || 3001,
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret:
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh",
    dbUrl: process.env.DB_URL || "http://localhost:3002",
    accessTokenExpiry: "15m", // Short-lived access tokens
    refreshTokenExpiry: "7d", // Long-lived refresh tokens
    binID: process.env.BIN_ID,
    xMasterKey: process.env.X_MASTER_KEY,
    xAccessKey: process.env.X_ACCESS_KEY,
};
