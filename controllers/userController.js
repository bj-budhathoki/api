const axios = require("axios");
const bcrypt = require("bcryptjs");
const config = require("../config/config");

// Get all users with optional search parameters
const getUsers = async (req, res) => {
    try {
        const { name, role, page = 1, limit = 10 } = req.query;
        // Get all users from json-server
        const response = await axios.get(`${config.dbUrl}/${config.binID}`, {
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": `${config.xMasterKey}`,
                "X-Access-Key": `${config.xAccessKey}`,
            },
        });
        let users = response?.data?.record?.users;

        // Apply search filter
        if (name) {
            const nameLower = name.toLowerCase();
            users = users.filter(
                (user) => user.name.toLowerCase() === nameLower,
            );
        }

        // Apply role filter
        if (role) {
            users = users.filter((user) => user.role === role);
        }

        // Remove passwords from response
        users = users.map((user) => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedUsers = users.slice(startIndex, endIndex);

        res.status(200).json({
            message: "Users retrieved successfully",
            data: paginatedUsers,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(users.length / limit),
                totalUsers: users.length,
                limit: parseInt(limit),
            },
        });
    } catch (error) {
        console.error("Get users error:", error.message);
        res.status(500).json({
            message: "Error retrieving users",
            error: error.message,
        });
    }
};

// Update user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role } = req.body;

        // Get user by ID
        const userResponse = await axios.get(`${config.dbUrl}/users/${id}`);
        if (!userResponse.data) {
            return res.status(404).json({ message: "User not found" });
        }

        const existingUser = userResponse.data;

        // Check if email is being changed and if it already exists
        if (email && email !== existingUser.email) {
            const allUsersResponse = await axios.get(`${config.dbUrl}/users`);
            const users = allUsersResponse.data;
            const emailExists = users.find(
                (user) => user.email === email && user.id !== id,
            );
            if (emailExists) {
                return res
                    .status(400)
                    .json({ message: "Email already exists" });
            }
        }

        // Prepare update data
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Update user
        const updateResponse = await axios.patch(
            `${config.dbUrl}/users/${id}`,
            updateData,
        );

        // Return user without password
        const { password: _, ...userWithoutPassword } = updateResponse.data;

        res.status(200).json({
            message: "User updated successfully",
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error("Update user error:", error.message);
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(500).json({
            message: "Error updating user",
            error: error.message,
        });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const userResponse = await axios.get(`${config.dbUrl}/users/${id}`);
        if (!userResponse.data) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete user
        await axios.delete(`${config.dbUrl}/users/${id}`);

        res.status(200).json({
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Delete user error:", error.message);
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(500).json({
            message: "Error deleting user",
            error: error.message,
        });
    }
};

module.exports = {
    getUsers,
    updateUser,
    deleteUser,
};
