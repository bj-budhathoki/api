const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const config = require("../config/config");
const emailService = require("../services/emailService");

// Signup Controller
const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validation
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Get all users from json-server
        const response = await axios.get(`${config.dbUrl}/${config.binID}`, {
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": `${config.xMasterKey}`,
                "X-Access-Key": `${config.xAccessKey}`,
            },
        });
        const users = response?.data?.record?.users;

        // Check if user already exists
        const userExists = users.find((u) => u.email === email);
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Build new user object
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
            role,
            createdAt: new Date().toISOString(),
        };
        const allUsers = [...users, newUser];
        // Save to json-server
        const saveResponse = await axios.put(
            `${config.dbUrl}/${config.binID}`,
            { users: allUsers },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Master-Key": `${config.xMasterKey}`,
                    "X-Access-Key": `${config.xAccessKey}`,
                },
            },
        );
        console.log({ saveResponse });
        // Generate JWT tokens
        const accessToken = jwt.sign(
            { userId: saveResponse.data.id, email: saveResponse.data.email },
            config.jwtSecret,
            { expiresIn: config.accessTokenExpiry },
        );

        const refreshToken = jwt.sign(
            { userId: saveResponse.data.id, email: saveResponse.data.email },
            config.jwtRefreshSecret,
            { expiresIn: config.refreshTokenExpiry },
        );

        // Calculate expiry times
        const accessExpiryTime = new Date(
            Date.now() + config.accessTokenExpiryMs,
        );
        const refreshExpiryTime = new Date(
            Date.now() + config.refreshTokenExpiryMs,
        );

        const { password: _, ...userWithoutPassword } = saveResponse.data;

        res.status(201).json({
            message: "User registered successfully",
            accessToken: accessToken,
            refreshToken: refreshToken,
            accessTokenExpiresAt: accessExpiryTime.toISOString(),
            refreshTokenExpiresAt: refreshExpiryTime.toISOString(),
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error("Signup error:", error.message);
        res.status(500).json({
            message: "Error during signup",
            error: error.message,
        });
    }
};

// Login Controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }

        // Get all users from json-server
        const response = await axios.get(`${config.dbUrl}/${config.binID}`, {
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": `${config.xMasterKey}`,
                "X-Access-Key": `${config.xAccessKey}`,
            },
        });
        const users = response?.data?.record?.users;

        // Find user by email
        const user = users.find((u) => u.email === email);
        if (!user) {
            return res
                .status(400)
                .json({ message: "Invalid email or password" });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res
                .status(400)
                .json({ message: "Invalid email or password" });
        }

        // Generate JWT tokens
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email },
            config.jwtSecret,
            { expiresIn: config.accessTokenExpiry },
        );

        const refreshToken = jwt.sign(
            { userId: user.id, email: user.email },
            config.jwtRefreshSecret,
            { expiresIn: config.refreshTokenExpiry },
        );

        // Calculate expiry times
        const accessExpiryTime = new Date(
            Date.now() + config.accessTokenExpiryMs,
        );
        const refreshExpiryTime = new Date(
            Date.now() + config.refreshTokenExpiryMs,
        );

        // Return user info and tokens (without password)
        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json({
            message: "Login successful",
            accessToken: accessToken,
            refreshToken: refreshToken,
            accessTokenExpiresAt: accessExpiryTime.toISOString(),
            refreshTokenExpiresAt: refreshExpiryTime.toISOString(),
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({
            message: "Error during login",
            error: error.message,
        });
    }
};

// Refresh Token Handler
const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;

        // Validation
        if (!token) {
            return res
                .status(400)
                .json({ message: "Refresh token is required" });
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = jwt.verify(token, config.jwtRefreshSecret);
        } catch (error) {
            return res
                .status(401)
                .json({ message: "Invalid or expired refresh token" });
        }

        // Get user from database to ensure they still exist
        const response = await axios.get(`${config.dbUrl}/${config.binID}`, {
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": `${config.xMasterKey}`,
                "X-Access-Key": `${config.xAccessKey}`,
            },
        });
        const users = response?.data?.record?.users;
        const user = users.find((u) => u.id === decoded.userId);

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // Generate new access token
        const newAccessToken = jwt.sign(
            { userId: user.id, email: user.email },
            config.jwtSecret,
            { expiresIn: config.accessTokenExpiry },
        );

        // Optionally generate new refresh token (token rotation)
        const newRefreshToken = jwt.sign(
            { userId: user.id, email: user.email },
            config.jwtRefreshSecret,
            { expiresIn: config.refreshTokenExpiry },
        );

        // Calculate expiry times
        const accessExpiryTime = new Date(
            Date.now() + config.accessTokenExpiryMs,
        );
        const refreshExpiryTime = new Date(
            Date.now() + config.refreshTokenExpiryMs,
        );

        // Return new tokens
        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json({
            message: "Token refreshed successfully",
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            accessTokenExpiresAt: accessExpiryTime.toISOString(),
            refreshTokenExpiresAt: refreshExpiryTime.toISOString(),
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error("Refresh token error:", error.message);
        res.status(500).json({
            message: "Error refreshing token",
            error: error.message,
        });
    }
};

//reset password
const resetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Find user by email
        const response = await axios.get(`${config.dbUrl}/${config.binID}`, {
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": `${config.xMasterKey}`,
                "X-Access-Key": `${config.xAccessKey}`,
            },
        });
        const users = response?.data?.record?.users;
        const user = users.find((u) => u.email === email);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Generate reset token
        const resetToken = jwt.sign(
            { userId: user.id, email: user.email },
            config.jwtResetSecret,
            { expiresIn: config.resetTokenExpiry },
        );

        // Send reset token via email
        await emailService.sendPasswordResetEmail(user.email, resetToken);

        res.status(200).json({
            message: "Password reset email sent successfully",
        });
    } catch (error) {
        console.error("Reset password error:", error.message);
        res.status(500).json({
            message: "Error resetting password",
            error: error.message,
        });
    }
};
// Update password after reset
const updatePassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res
                .status(400)
                .json({ message: "Token and new password are required" });
        }

        // Verify reset token
        let decoded;
        try {
            decoded = jwt.verify(token, config.jwtResetSecret);
        } catch (error) {
            return res
                .status(401)
                .json({ message: "Invalid or expired reset token" });
        }

        // Get all users
        const response = await axios.get(`${config.dbUrl}/${config.binID}`, {
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": `${config.xMasterKey}`,
                "X-Access-Key": `${config.xAccessKey}`,
            },
        });
        const users = response?.data?.record?.users;
        const userIndex = users.findIndex((u) => u.id === decoded.userId);

        if (userIndex === -1) {
            return res.status(404).json({ message: "User not found" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        users[userIndex].password = hashedPassword;

        // Save back to json-server
        await axios.put(
            `${config.dbUrl}/${config.binID}`,
            { users },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Master-Key": `${config.xMasterKey}`,
                    "X-Access-Key": `${config.xAccessKey}`,
                },
            },
        );

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Update password error:", error.message);
        res.status(500).json({
            message: "Error updating password",
            error: error.message,
        });
    }
};

module.exports = {
    signup,
    login,
    refreshToken,
    resetPassword,
    updatePassword,
};
