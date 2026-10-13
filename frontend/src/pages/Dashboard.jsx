
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Dashboard.css";
import Analytics from "../components/Analytics";
import "../components/Analytics.css";
import Sidebar from "../components/Sidebar";

function Dashboard() {

    const navigate = useNavigate();
const [transactions, setTransactions] = useState([]);
const [budgets, setBudgets] = useState([]);
const [goals, setGoals] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [budgetError, setBudgetError] = useState("");
const [goalsError, setGoalsError] = useState("");


    const user = JSON.parse(localStorage.getItem("user") || "null");


useEffect(() => {
    if (!localStorage.getItem("token")) {
        navigate("/login");
        return;
    }

    const fetchDashboardData = async () => {
        const currentMonth = new Date().toISOString().slice(0, 7);

        const results = await Promise.allSettled([
            api.get("/transactions"),
            api.get("/budgets", { params: { month: currentMonth } }),
            api.get("/savings-goals")
        ]);

        const [transactionResult, budgetResult, goalsResult] = results;

        if (transactionResult.status === "fulfilled") {
            const data = transactionResult.value.data;
            setTransactions(
                Array.isArray(data.transactions) ? data.transactions : []
            );
        } else {
            setError(
                transactionResult.reason?.response?.data?.message ||
                "Unable to load transactions."
            );
        }

        if (budgetResult.status === "fulfilled") {
            const data = budgetResult.value.data;
            setBudgets(Array.isArray(data) ? data : data.budgets || []);
        } else {
            setBudgetError("Unable to load budget alerts.");
        }

        if (goalsResult.status === "fulfilled") {
            const data = goalsResult.value.data;
            setGoals(Array.isArray(data) ? data : data.goals || []);
        } else {
            setGoalsError("Unable to load savings goals.");
        }

        setLoading(false);
    };

    fetchDashboardData();
}, [navigate]);


    const income = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = income - expenses;


const totalGoalTarget = goals.reduce(
    (sum, goal) => sum + Number(goal.targetAmount || 0),
    0
);

const totalSaved = goals.reduce(
    (sum, goal) => sum + Number(goal.savedAmount || 0),
    0
);

const totalRemaining = goals.reduce(
    (sum, goal) => sum + Math.max(
        0,
        Number(goal.targetAmount || 0) - Number(goal.savedAmount || 0)
    ),
    0
);

const overallGoalProgress = totalGoalTarget > 0
    ? Math.min(100, (totalSaved / totalGoalTarget) * 100)
    : 0;

const budgetAlerts = budgets.filter((budget) => {
    const percentage = Number(
        budget.percentage ??
        (Number(budget.limit) > 0
            ? (Number(budget.spent || 0) / Number(budget.limit)) * 100
            : 0)
    );

    return budget.exceeded || percentage >= 80;
});


    const money = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: user?.currency || "INR",
            maximumFractionDigits: 2
        }).format(amount);

    const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    return (
        <div className="app-layout">
            <Sidebar />

            <main className="main-content">
                <header className="topbar">
                    <div>
                        <p className="eyebrow">OVERVIEW</p>
                        <h1>Dashboard</h1>
                    </div>
                    <button
                        className="primary-button"
                        onClick={() => navigate("/transactions")}
                    >
                        + Add transaction
                    </button>
                </header>

                <section className="welcome-section">
                    <div>
                        <h2>Welcome back, {user?.name || "there"} 👋</h2>
                        <p>Here's what's happening with your money.</p>
                    </div>
                    <div className="welcome-decoration">₹</div>
                </section>

                {error && <div className="error-message">{error}</div>}

                {loading ? (
                    <div className="loading-card">Loading your finances...</div>
                ) : (
                    <>
                        <section className="summary-grid">
                            <article className="summary-card balance-card">
                                <div className="card-top">
                                    <span className="card-label">Total balance</span>
                                    <span className="card-icon">₹</span>
                                </div>
                                <h2>{money(balance)}</h2>
                                <p className="card-note">Income minus expenses</p>
                            </article>

                            <article className="summary-card">
                                <div className="card-top">
                                    <span className="card-label">Total income</span>
                                    <span className="metric-icon income-icon">↗</span>
                                </div>
                                <h2>{money(income)}</h2>
                                <p className="card-note">Across recorded transactions</p>
                            </article>

                            <article className="summary-card">
                                <div className="card-top">
                                    <span className="card-label">Total expenses</span>
                                    <span className="metric-icon expense-icon">↘</span>
                                </div>
                                <h2>{money(expenses)}</h2>
                                <p className="card-note">Across recorded transactions</p>
                            </article>

                            <article className="summary-card">
                                <div className="card-top">
                                    <span className="card-label">Transactions</span>
                                    <span className="metric-icon count-icon">#</span>
                                </div>
                                <h2>{transactions.length}</h2>
                                <p className="card-note">Total recorded entries</p>
                            </article>
                        </section>
                        <Analytics
                            transactions={transactions}
                            currency={user?.currency || "INR"}
                        />

{/* Savings Overview */}
<section className="dashboard-widgets">
    <article className="widget-panel savings-widget">
        <div className="panel-header">
            <div>
                <h2>Savings overview</h2>
                <p>Track your progress toward your goals</p>
            </div>
            <button
                className="text-button"
                onClick={() => navigate("/savings-goals")}
            >
                View goals →
            </button>
        </div>

        {goalsError ? (
            <div className="widget-message error-message">
                {goalsError}
            </div>
        ) : goals.length === 0 ? (
            <div className="widget-empty">
                <h3>Start saving for something you love</h3>
                <p>Create a goal and track your progress here.</p>
                <button
                    className="primary-button"
                    onClick={() => navigate("/savings-goals")}
                >
                    Create a savings goal
                </button>
            </div>
        ) : (
            <>
                <div className="savings-metrics">
                    <div>
                        <span>Total saved</span>
                        <strong>{money(totalSaved)}</strong>
                    </div>
                    <div>
                        <span>Total target</span>
                        <strong>{money(totalGoalTarget)}</strong>
                    </div>
                    <div>
                        <span>Remaining</span>
                        <strong>{money(totalRemaining)}</strong>
                    </div>
                </div>

                <div className="overall-progress">
                    <div className="progress-label">
                        <span>Overall progress</span>
                        <strong>
                            {Math.round(overallGoalProgress)}%
                        </strong>
                    </div>
                    <div
                        className="widget-progress-track"
                        role="progressbar"
                        aria-label="Overall savings goal progress"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(overallGoalProgress)}
                    >
                        <div
                            className="widget-progress-fill savings-fill"
                            style={{
                                width: `${overallGoalProgress}%`
                            }}
                        />
                    </div>
                </div>

                <div className="goal-preview-list">
                    {goals.slice(0, 3).map((goal) => {
                        const progress = Number(
                            goal.progress ??
                            (Number(goal.targetAmount) > 0
                                ? Number(goal.savedAmount || 0) /
                                  Number(goal.targetAmount) * 100
                                : 0)
                        );

                        return (
                            <div
                                className="goal-preview"
                                key={goal._id}
                            >
                                <div className="goal-preview-heading">
                                    <strong>{goal.title}</strong>
                                    <span>
                                        {Math.round(
                                            Math.min(100, progress)
                                        )}%
                                    </span>
                                </div>
                                <div className="widget-progress-track">
                                    <div
                                        className="widget-progress-fill savings-fill"
                                        style={{
                                            width: `${Math.min(
                                                100,
                                                Math.max(0, progress)
                                            )}%`
                                        }}
                                    />
                                </div>
                                <p>
                                    {money(Number(goal.savedAmount || 0))}
                                    {" of "}
                                    {money(Number(goal.targetAmount || 0))}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </>
        )}
    </article>

    {/* Budget Alerts */}
    <article className="widget-panel budget-widget">
        <div className="panel-header">
            <div>
                <h2>Budget alerts</h2>
                <p>Keep your monthly spending in check</p>
            </div>
            <button
                className="text-button"
                onClick={() => navigate("/budgets")}
            >
                Manage →
            </button>
        </div>

        {budgetError ? (
            <div className="widget-message error-message">
                {budgetError}
            </div>
        ) : budgets.length === 0 ? (
            <div className="widget-empty">
                <h3>No monthly budgets yet</h3>
                <p>Set category limits to monitor your spending.</p>
                <button
                    className="primary-button"
                    onClick={() => navigate("/budgets")}
                >
                    Create a budget
                </button>
            </div>
        ) : budgetAlerts.length === 0 ? (
            <div className="widget-empty budget-success">
                <span className="status-icon">✓</span>
                <h3>You're within your budgets!</h3>
                <p>
                    All {budgets.length} budget
                    {budgets.length === 1 ? "" : "s"} are below
                    80% usage this month.
                </p>
            </div>
        ) : (
            <div className="budget-alert-list">
                {budgetAlerts.slice(0, 4).map((budget) => {
                    const percentage = Number(
                        budget.percentage ??
                        (Number(budget.limit) > 0
                            ? Number(budget.spent || 0) /
                              Number(budget.limit) * 100
                            : 0)
                    );

                    const exceeded = Boolean(budget.exceeded) ||
                        Number(budget.spent || 0) >
                        Number(budget.limit || 0);

                    return (
                        <div
                            className={`budget-alert-item ${
                                exceeded ? "budget-exceeded" : ""
                            }`}
                            key={budget._id}
                        >
                            <div className="budget-alert-heading">
                                <div>
                                    <strong>{budget.category}</strong>
                                    <span>
                                        {money(Number(budget.spent || 0))}
                                        {" / "}
                                        {money(Number(budget.limit || 0))}
                                    </span>
                                </div>
                                <span
                                    className={`budget-status ${
                                        exceeded
                                            ? "status-danger"
                                            : "status-warning"
                                    }`}
                                >
                                    {exceeded
                                        ? "Limit exceeded"
                                        : `${Math.round(percentage)}% used`}
                                </span>
                            </div>

                            <div className="widget-progress-track">
                                <div
                                    className={`widget-progress-fill ${
                                        exceeded
                                            ? "budget-fill-danger"
                                            : "budget-fill-warning"
                                    }`}
                                    style={{
                                        width: `${Math.min(
                                            100,
                                            Math.max(0, percentage)
                                        )}%`
                                    }}
                                />
                            </div>

                            <p>
                                {exceeded
                                    ? `${money(
                                        Number(budget.spent || 0) -
                                        Number(budget.limit || 0)
                                    )} over budget`
                                    : `${money(
                                        Math.max(
                                            0,
                                            Number(budget.limit || 0) -
                                            Number(budget.spent || 0)
                                        )
                                    )} remaining`}
                            </p>
                        </div>
                    );
                })}

                {budgetAlerts.length > 4 && (
                    <button
                        className="text-button"
                        onClick={() => navigate("/budgets")}
                    >
                        View {budgetAlerts.length - 4} more alerts →
                    </button>
                )}
            </div>
        )}
    </article>
</section>

                        <section className="transactions-panel">
                            <div className="panel-header">
                                <div>
                                    <h2>Recent transactions</h2>
                                    <p>Your latest financial activity</p>
                                </div>
                                <button
                                    className="text-button"
                                    onClick={() => navigate("/transactions")}
                                >
                                    View all →
                                </button>
                            </div>

                            {recentTransactions.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">↔</div>
                                    <h3>No transactions yet</h3>
                                    <p>Add your first income or expense to get started.</p>
                                    <button
                                        className="primary-button"
                                        onClick={() => navigate("/transactions")}
                                    >
                                        Add transaction
                                    </button>
                                </div>
                            ) : (
                                <div className="transaction-list">
                                    {recentTransactions.map((t) => (
                                        <div className="transaction-row" key={t._id}>
                                            <div className={`category-icon ${
                                                t.type === "income" ? "income-bg" : "expense-bg"
                                            }`}>
                                                {t.type === "income" ? "↙" : "↗"}
                                            </div>

                                            <div className="transaction-details">
                                                <strong>{t.category}</strong>
                                                <span>{t.description || t.type}</span>
                                            </div>

                                            <span className="transaction-date">
                                                {new Date(t.date).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </span>

                                            <strong className={
                                                t.type === "income" ? "amount-income" : "amount-expense"
                                            }>
                                                {t.type === "income" ? "+" : "−"}
                                                {money(Number(t.amount))}
                                            </strong>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

export default Dashboard;
