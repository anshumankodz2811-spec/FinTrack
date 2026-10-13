const mongoose = require("mongoose");
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

const isValidId = (id) => mongoose.isValidObjectId(id);

// Create a budget
const createBudget = async (req, res) => {
    try {
        const { category, limit, month } = req.body;

        if (
            typeof category !== "string" ||
            !category.trim() ||
            category.trim().length > 100 ||
            limit === undefined ||
            limit === null ||
            limit === "" ||
            !Number.isFinite(Number(limit)) ||
            Number(limit) <= 0 ||
            !/^\d{4}-(0[1-9]|1[0-2])$/.test(month || "")
        ) {
            return res.status(400).json({
                message: "Valid category, positive limit, and month (YYYY-MM) are required."
            });
        }

        const budget = await Budget.create({
            userId: req.userId,
            category: category.trim(),
            limit: Number(limit),
            month
        });

        return res.status(201).json({
            message: "Budget created successfully",
            budget
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "A budget already exists for this category and month."
            });
        }

        console.error("Create budget error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Get budgets for a month, including spending progress
const getBudgets = async (req, res) => {
    try {
        const month = req.query.month;

        if (month && !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
            return res.status(400).json({
                message: "Month must use YYYY-MM format."
            });
        }

        const currentMonth = new Date().toISOString().slice(0, 7);

        const budgets = await Budget.find({
            userId: req.userId,
            month: month || currentMonth
        }).sort({ category: 1 });

        const start = new Date(`${month || currentMonth}-01T00:00:00.000Z`);
        const end = new Date(start);
        end.setUTCMonth(end.getUTCMonth() + 1);

        const spending = await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.userId),
                    type: "expense",
                    date: { $gte: start, $lt: end }
                }
            },
            {
                $group: {
                    _id: { $toLower: { $trim: { input: "$category" } } },
                    spent: { $sum: "$amount" }
                }
            }
        ]);

        const spendingMap = new Map(
            spending.map((item) => [item._id, item.spent])
        );

        const result = budgets.map((budget) => {
            const spent = spendingMap.get(budget.category.toLowerCase().trim()) || 0;
            const remaining = Number(budget.limit) - spent;

            return {
                ...budget.toObject(),
                spent,
                remaining,
                percentage: Math.round((spent / budget.limit) * 100),
                exceeded: spent > budget.limit
            };
        });

        return res.status(200).json({
            month: month || currentMonth,
            count: result.length,
            budgets: result
        });
    } catch (error) {
        console.error("Get budgets error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Update a budget's category or limit
const updateBudget = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid budget ID."
            });
        }
        if (
            category !== undefined &&
                (
                    typeof category !== "string" ||
                    !category.trim() ||
                    category.trim().length > 100
                )
        ) {
            return res.status(400).json({
                message: "Category must be a non-empty string."
            });
        }

        if (
            limit !== undefined &&
            (limit === "" ||
                !Number.isFinite(Number(limit)) ||
                Number(limit) <= 0)
        ) {
            return res.status(400).json({
                message: "Limit must be a positive number."
            });
        }
            const budget = await Budget.findOne({
                _id: id,
                userId: req.userId
            });

        if (!budget) {
            return res.status(404).json({ message: "Budget not found" });
        }

        if (category !== undefined) budget.category = category.trim();
        if (limit !== undefined) budget.limit = Number(limit);

        await budget.save();

        return res.status(200).json({
            message: "Budget updated successfully",
            budget
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "A budget already exists for this category and month."
            });
        }

        console.error("Update budget error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Delete a budget
const deleteBudget = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid budget ID."
            });
        }

        const budget = await Budget.findOneAndDelete({
            _id: id,
            userId: req.userId
        });

        if (!budget) {
            return res.status(404).json({ message: "Budget not found" });
        }

        return res.status(200).json({
            message: "Budget deleted successfully"
        });
    } catch (error) {
        console.error("Delete budget error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    createBudget,
    getBudgets,
    updateBudget,
    deleteBudget
};
