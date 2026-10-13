
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Dashboard.css";
import "./Transactions.css";
import "./Budgets.css";

function Budgets() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const currentMonth = new Date().toLocaleDateString("en-CA").slice(0, 7);

    const [month, setMonth] = useState(currentMonth);
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        category: "",
        limit: ""
    });

    const money = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: user?.currency || "INR",
            maximumFractionDigits: 2
        }).format(amount);

    const loadBudgets = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/budgets", {
                params: { month }
            });
            setBudgets(response.data.budgets);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load budgets."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/login");
            return;
        }

        loadBudgets();
    }, [month, navigate]);

    const resetForm = () => {
        setForm({ category: "", limit: "" });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const payload = {
                category: form.category.trim(),
                limit: Number(form.limit),
                month
            };

            if (editingId) {
                await api.put(`/budgets/${editingId}`, {
                    category: payload.category,
                    limit: payload.limit
                });
                setSuccess("Budget updated successfully!");
            } else {
                await api.post("/budgets", payload);
                setSuccess("Budget created successfully!");
            }

            resetForm();
            await loadBudgets();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save budget."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (budget) => {
        setEditingId(budget._id);
        setForm({
            category: budget.category,
            limit: String(budget.limit)
        });
        setError("");
        setSuccess("");
        document.getElementById("budget-form")
            ?.scrollIntoView({ behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this budget?")) return;

        setError("");
        setSuccess("");

        try {
            await api.delete(`/budgets/${id}`);
            setSuccess("Budget deleted successfully!");
            await loadBudgets();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete budget."
            );
        }
    };

    const totalLimit = budgets.reduce(
        (sum, budget) => sum + Number(budget.limit),
        0
    );

    const totalSpent = budgets.reduce(
        (sum, budget) => sum + Number(budget.spent),
        0
    );

    const totalRemaining = totalLimit - totalSpent;

    if (!localStorage.getItem("token")) {
        return <p>Please log in to continue.</p>;
    }

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-icon">F</div>
                    <span>FinTrack</span>
                </div>

                <p className="nav-heading">MENU</p>

                <button
                    className="nav-item"
                    onClick={() => navigate("/dashboard")}
                >
                    <span>▦</span> Dashboard
                </button>

                <button
                    className="nav-item"
                    onClick={() => navigate("/transactions")}
                >
                    <span>↔</span> Transactions
                </button>

                <button className="nav-item active">
                    <span>◎</span> Budgets
                </button>

                <button
                    className="nav-item"
                    onClick={() => navigate("/savings-goals")}
                >
                    <span>🎯</span> Savings Goals
                </button>

                <div className="sidebar-bottom">
                    <div className="profile-avatar">
                        {(user?.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-info">
                        <strong>{user?.name || "User"}</strong>
                        <span>Personal Account</span>
                    </div>
                    <button
                        className="logout-button"
                        title="Log out"
                        onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("user");
                            navigate("/login");
                        }}
                    >
                        ↪
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <div>
                        <p className="eyebrow">PLAN YOUR SPENDING</p>
                        <h1>Budgets</h1>
                    </div>

                    <label className="budget-month-picker">
                        <span>Month</span>
                        <input
                            type="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            required
                        />
                    </label>
                </header>

                <section className="welcome-section">
                    <div>
                        <h2>Stay in control of your money 🎯</h2>
                        <p>Set spending limits and monitor your progress.</p>
                    </div>
                    <div className="welcome-decoration">₹</div>
                </section>

                {error && <p className="feedback-error">{error}</p>}
                {success && <p className="feedback-success">{success}</p>}

                <section className="budget-summary-grid">
                    <article className="transaction-stat-card">
                        <span>Total budget</span>
                        <strong>{money(totalLimit)}</strong>
                    </article>

                    <article className="transaction-stat-card">
                        <span>Total spent in budgeted categories</span>
                        <strong className="amount-expense">
                            {money(totalSpent)}
                        </strong>
                    </article>

                    <article className="transaction-stat-card">
                        <span>Budget remaining</span>
                        <strong className={totalRemaining < 0 ? "amount-expense" : "amount-income"}>
                            {money(totalRemaining)}
                        </strong>
                    </article>
                </section>

                <section className="transactions-panel budget-form-panel" id="budget-form">
                    <div className="panel-header">
                        <div>
                            <h2>{editingId ? "Edit budget" : "Create a budget"}</h2>
                            <p>Choose a category and monthly spending limit.</p>
                        </div>
                    </div>

                    <form className="transaction-form" onSubmit={handleSubmit}>
                        <label>
                            Category
                            <input
                                type="text"
                                value={form.category}
                                onChange={(e) =>
                                    setForm({ ...form, category: e.target.value })
                                }
                                placeholder="e.g. Food, Shopping, Travel"
                                required
                            />
                        </label>

                        <label>
                            Monthly limit (₹)
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.limit}
                                onChange={(e) =>
                                    setForm({ ...form, limit: e.target.value })
                                }
                                placeholder="e.g. 5000"
                                required
                            />
                        </label>

                        <div className="form-actions full-field">
                            <button
                                className="primary-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update budget"
                                        : "Create budget"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="transactions-panel budget-list-panel">
                    <div className="panel-header">
                        <div>
                            <h2>Monthly budgets</h2>
                            <p>Spending progress for {month}</p>
                        </div>
                        <span className="results-count">
                            {budgets.length} budgets
                        </span>
                    </div>

                    {loading ? (
                        <div className="loading-card">Loading budgets...</div>
                    ) : budgets.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">◎</div>
                            <h3>No budgets for this month</h3>
                            <p>Create a budget above to start tracking spending.</p>
                        </div>
                    ) : (
                        <div className="budget-list">
                            {budgets.map((budget) => {
                                const spent = Number(budget.spent);
                                const limit = Number(budget.limit);
                                const percentage = limit > 0
                                    ? (spent / limit) * 100
                                    : 0;
                                const exceeded = spent > limit;

                                return (
                                    <article className="budget-card" key={budget._id}>
                                        <div className="budget-card-header">
                                            <div>
                                                <h3>{budget.category}</h3>
                                                <p>
                                                    {money(spent)} spent of {money(limit)}
                                                </p>
                                            </div>

                                            <div className="budget-actions">
                                                <button
                                                    className="secondary-button"
                                                    onClick={() => handleEdit(budget)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={() => handleDelete(budget._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        <div className="budget-progress-track">
                                            <div
                                                className={`budget-progress-fill ${
                                                    exceeded ? "budget-over" : ""
                                                }`}
                                                style={{
                                                    width: `${Math.min(percentage, 100)}%`
                                                }}
                                            />
                                        </div>

                                        <div className="budget-card-footer">
                                            <span>
                                                {Math.round(percentage)}% used
                                            </span>
                                            <strong className={
                                                exceeded ? "amount-expense" : ""
                                            }>
                                                {exceeded
                                                    ? `${money(spent - limit)} over budget`
                                                    : `${money(limit - spent)} remaining`}
                                            </strong>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default Budgets;
