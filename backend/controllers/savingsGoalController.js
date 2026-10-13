
const SavingsGoal = require("../models/SavingsGoal");

// Create a savings goal
const createGoal = async (req, res) => {
    try {
        const {
            title,
            targetAmount,
            deadline,
            description
        } = req.body;

        if (
            typeof title !== "string" ||
            !title.trim() ||
            title.trim().length > 100 ||
            targetAmount === undefined ||
            targetAmount === null ||
            targetAmount === "" ||
            !Number.isFinite(Number(targetAmount)) ||
            Number(targetAmount) <= 0
        ) {
            return res.status(400).json({
                message: "A valid title and positive target amount are required."
            });
        }

        if (deadline && Number.isNaN(Date.parse(deadline))) {
            return res.status(400).json({
                message: "Please provide a valid deadline."
            });
        }

        const goal = await SavingsGoal.create({
            userId: req.userId,
            title: title.trim(),
            targetAmount: Number(targetAmount),
            deadline: deadline || null,
            description: description || ""
        });

        return res.status(201).json({
            message: "Savings goal created successfully",
            goal
        });
    } catch (error) {
        console.error("Create savings goal error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Get all savings goals for the logged-in user
const getGoals = async (req, res) => {
    try {
        const goals = await SavingsGoal.find({
            userId: req.userId
        }).sort({ createdAt: -1 });

        const result = goals.map((goal) => {
            const progress = (goal.savedAmount / goal.targetAmount) * 100;

            return {
                ...goal.toObject(),
                progress: Math.round(progress),
                remainingAmount: Math.max(
                    0,
                    goal.targetAmount - goal.savedAmount
                ),
                completed: goal.savedAmount >= goal.targetAmount
            };
        });

        return res.status(200).json({
            count: result.length,
            goals: result
        });
    } catch (error) {
        console.error("Get savings goals error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Update goal details
const updateGoal = async (req, res) => {
    try {
        const { title, targetAmount, deadline, description } = req.body;

        if (
            title !== undefined &&
            (typeof title !== "string" ||
                !title.trim() ||
                title.trim().length > 100)
        ) {
            return res.status(400).json({
                message: "Title must be between 1 and 100 characters."
            });
        }

        if (
            targetAmount !== undefined &&
            (targetAmount === "" ||
                !Number.isFinite(Number(targetAmount)) ||
                Number(targetAmount) <= 0)
        ) {
            return res.status(400).json({
                message: "Target amount must be a positive number."
            });
        }

        if (
            deadline !== undefined &&
            deadline !== null &&
            deadline !== "" &&
            Number.isNaN(Date.parse(deadline))
        ) {
            return res.status(400).json({
                message: "Please provide a valid deadline."
            });
        }

        const goal = await SavingsGoal.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!goal) {
            return res.status(404).json({ message: "Savings goal not found" });
        }

        if (title !== undefined) goal.title = title.trim();
        if (targetAmount !== undefined) {
            goal.targetAmount = Number(targetAmount);
        }
        if (deadline !== undefined) goal.deadline = deadline || null;
        if (description !== undefined) goal.description = description;

        await goal.save();

        return res.status(200).json({
            message: "Savings goal updated successfully",
            goal
        });
    } catch (error) {
        console.error("Update savings goal error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Add money to a goal
const contributeToGoal = async (req, res) => {
    try {
        const { amount } = req.body;

        if (
            amount === undefined ||
            amount === null ||
            amount === "" ||
            !Number.isFinite(Number(amount)) ||
            Number(amount) <= 0
        ) {
            return res.status(400).json({
                message: "Contribution amount must be a positive number."
            });
        }

        const goal = await SavingsGoal.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!goal) {
            return res.status(404).json({ message: "Savings goal not found" });
        }

        goal.savedAmount += Number(amount);
        await goal.save();

        const progress = Math.round(
            (goal.savedAmount / goal.targetAmount) * 100
        );

        return res.status(200).json({
            message: "Contribution added successfully",
            goal: {
                ...goal.toObject(),
                progress,
                remainingAmount: Math.max(
                    0,
                    goal.targetAmount - goal.savedAmount
                ),
                completed: goal.savedAmount >= goal.targetAmount
            }
        });
    } catch (error) {
        console.error("Savings contribution error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Delete a goal
const deleteGoal = async (req, res) => {
    try {
        const goal = await SavingsGoal.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        if (!goal) {
            return res.status(404).json({ message: "Savings goal not found" });
        }

        return res.status(200).json({
            message: "Savings goal deleted successfully"
        });
    } catch (error) {
        console.error("Delete savings goal error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    createGoal,
    getGoals,
    updateGoal,
    contributeToGoal,
    deleteGoal
};
