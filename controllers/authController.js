const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const config = require("../config/config");

// Signup Controller
const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validation
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Get all users from json-server
        const response = await axios.get(`${config.dbUrl}/users`);
        const users = response.data;

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

        // Save to json-server
        const saveResponse = await axios.post(`${config.dbUrl}/users`, newUser);

        // Generate JWT
        const expiresIn = "24h";
        const token = jwt.sign(
            { userId: saveResponse.data.id, email: saveResponse.data.email },
            config.jwtSecret,
            { expiresIn },
        );

        // Calculate expiry time in milliseconds
        const expiryMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const expiryTime = new Date(Date.now() + expiryMs);

        const { password: _, ...userWithoutPassword } = saveResponse.data;

        res.status(201).json({
            message: "User registered successfully",
            accessToken: token,
            expiresIn: expiresIn,
            expiresAt: expiryTime.toISOString(),
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
        const response = await axios.get(`${config.dbUrl}/users`);
        const users = response.data;

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

        // Generate JWT token
        const expiresIn = "30s";
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            config.jwtSecret,
            { expiresIn },
        );

        // Calculate expiry time in milliseconds
        const expiryMs = 30 * 1000; // 30 seconds in milliseconds
        const expiryTime = new Date(Date.now() + expiryMs);

        // Return user info and token (without password)
        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json({
            message: "Login successful",
            accessToken: token,
            expiresIn: expiresIn,
            expiresAt: expiryTime.toISOString(),
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

module.exports = {
    signup,
    login,
};
