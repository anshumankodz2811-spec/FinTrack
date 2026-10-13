
const mongoose = require("mongoose");

const savingsGoalSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        targetAmount: {
            type: Number,
            required: true,
            min: 0.01
        },

        savedAmount: {
            type: Number,
            default: 0,
            min: 0
        },

        deadline: {
            type: Date,
            default: null
        },

        description: {
            type: String,
            trim: true,
            maxlength: 300,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("SavingsGoal", savingsGoalSchema);
