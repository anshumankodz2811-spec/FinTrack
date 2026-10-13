
const express = require("express");

const {
    createGoal,
    getGoals,
    updateGoal,
    contributeToGoal,
    deleteGoal
} = require("../controllers/savingsGoalController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", createGoal);
router.get("/", getGoals);
router.put("/:id", updateGoal);
router.patch("/:id/contribute", contributeToGoal);
router.delete("/:id", deleteGoal);

module.exports = router;
