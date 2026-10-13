
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

const isValidId = (id) => mongoose.isValidObjectId(id);

const validateTransactionFields = (body, isUpdate = false) => {
    const allowedFields = [
        "type",
        "amount",
        "category",
        "description",
        "date"
    ];

    const unknownFields = Object.keys(body).filter(
        (field) => !allowedFields.includes(field)
    );

    if (unknownFields.length) {
        return "Unexpected field(s): " + unknownFields.join(", ");
    }

    if (!isUpdate && (!body.type || body.amount === undefined ||
        body.amount === null || body.amount === "" ||
        body.category === undefined)) {
        return "Type, amount and category are required.";
    }

    if (body.type !== undefined &&
        !["income", "expense"].includes(body.type)) {
        return "Type must be income or expense.";
    }

    if (body.amount !== undefined) {
        if (
            body.amount === "" ||
            !Number.isFinite(Number(body.amount)) ||
            Number(body.amount) <= 0
        ) {
            return "Amount must be a positive number.";
        }
    }

    if (body.category !== undefined) {
        if (
            typeof body.category !== "string" ||
            !body.category.trim() ||
            body.category.trim().length > 100
        ) {
            return "Category must be between 1 and 100 characters.";
        }
    }

    if (body.description !== undefined &&
        (typeof body.description !== "string" ||
            body.description.length > 500)) {
        return "Description must be 500 characters or fewer.";
    }

    if (body.date !== undefined) {
        const date = new Date(body.date);

        if (
            body.date === null ||
            body.date === "" ||
            Number.isNaN(date.getTime())
        ) {
            return "Please provide a valid transaction date.";
        }
    }

    return null;
};

const addTransaction = async (req, res) => {
    try {
        const validationError = validateTransactionFields(req.body);

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const { type, amount, category, description, date } = req.body;

        const transaction = await Transaction.create({
            userId: req.userId,
            type,
            amount: Number(amount),
            category: category.trim(),
            description: description?.trim() || "",
            date: date ? new Date(date) : new Date()
        });

        return res.status(201).json({
            message: "Transaction added successfully",
            transaction
        });
    } catch (error) {
        console.error("Add transaction error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            userId: req.userId
        }).sort({ date: -1 });

        return res.status(200).json({
            count: transactions.length,
            transactions
        });
    } catch (error) {
        console.error("Get transactions error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                message: "Invalid transaction ID."
            });
        }

        const validationError = validateTransactionFields(req.body, true);

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                message: "At least one field must be provided."
            });
        }

        const transaction = await Transaction.findOne({
            _id: id,
            userId: req.userId
        });

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        const { type, amount, category, description, date } = req.body;

        if (type !== undefined) transaction.type = type;
        if (amount !== undefined) transaction.amount = Number(amount);
        if (category !== undefined) transaction.category = category.trim();
        if (description !== undefined) {
            transaction.description = description.trim();
        }
        if (date !== undefined) transaction.date = new Date(date);

        const updatedTransaction = await transaction.save();

        return res.status(200).json({
            message: "Transaction updated successfully",
            transaction: updatedTransaction
        });
    } catch (error) {
        console.error("Update transaction error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                message: "Invalid transaction ID."
            });
        }

        const transaction = await Transaction.findOneAndDelete({
            _id: id,
            userId: req.userId
        });

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        return res.status(200).json({
            message: "Transaction deleted successfully"
        });
    } catch (error) {
        console.error("Delete transaction error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    addTransaction,
    getTransactions,
    updateTransaction,
    deleteTransaction
};
