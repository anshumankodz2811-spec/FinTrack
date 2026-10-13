
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Dashboard.css";
import "./Transactions.css";
import "./Budgets.css";
import "./SavingsGoals.css";

function SavingsGoals() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [contributionId, setContributionId] = useState(null);
    const [contributionAmount, setContributionAmount] = useState("");

    const [form, setForm] = useState({
        title: "",
        targetAmount: "",
        savedAmount: "",
        deadline: "",
        description: ""
    });

    const money = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: user?.currency || "INR",
            maximumFractionDigits: 2
        }).format(amount);

    const loadGoals = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/savings-goals");
            setGoals(response.data.goals);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load savings goals."
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

        loadGoals();
    }, [navigate]);

    const resetForm = () => {
        setForm({
            title: "",
            targetAmount: "",
            savedAmount: "",
            deadline: "",
            description: ""
        });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const payload = {
                title: form.title.trim(),
                targetAmount: Number(form.targetAmount),
                description: form.description.trim(),
                deadline: form.deadline || null
            };

            if (editingId) {
                await api.put(`/savings-goals/${editingId}`, payload);
                setSuccess("Savings goal updated successfully!");
            } else {
                await api.post("/savings-goals", {
                    ...payload,
                    savedAmount: Number(form.savedAmount || 0)
                });
                setSuccess("Savings goal created successfully!");
            }

            resetForm();
            await loadGoals();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save savings goal."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (goal) => {
        setEditingId(goal._id);
        setForm({
            title: goal.title,
            targetAmount: String(goal.targetAmount),
            savedAmount: String(goal.savedAmount),
            deadline: goal.deadline
                ? new Date(goal.deadline).toISOString().slice(0, 10)
                : "",
            description: goal.description || ""
        });

        setError("");
        setSuccess("");
        document.getElementById("goal-form")
            ?.scrollIntoView({ behavior: "smooth" });
    };

    const handleContribution = async (e, id) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!Number.isFinite(Number(contributionAmount)) ||
            Number(contributionAmount) <= 0) {
            setError("Enter a contribution greater than zero.");
            return;
        }

        setSaving(true);

        try {
            await api.patch(`/savings-goals/${id}/contribute`, {
                amount: Number(contributionAmount)
            });

            setContributionId(null);
            setContributionAmount("");
            setSuccess("Contribution added successfully!");
            await loadGoals();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to add contribution."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this savings goal permanently?")) return;

        setError("");
        setSuccess("");

        try {
            await api.delete(`/savings-goals/${id}`);
            setSuccess("Savings goal deleted successfully!");
            await loadGoals();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete savings goal."
            );
        }
    };

    const totalTarget = goals.reduce(
        (sum, goal) => sum + Number(goal.targetAmount),
        0
    );

    const totalSaved = goals.reduce(
        (sum, goal) => sum + Number(goal.savedAmount),
        0
    );

    const totalRemaining = Math.max(0, totalTarget - totalSaved);

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

                <button className="nav-item" onClick={() => navigate("/dashboard")}>
                    <span>▦</span> Dashboard
                </button>

                <button className="nav-item" onClick={() => navigate("/transactions")}>
                    <span>↔</span> Transactions
                </button>

                <button className="nav-item" onClick={() => navigate("/budgets")}>
                    <span>◎</span> Budgets
                </button>

                <button className="nav-item active">
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
                        <p className="eyebrow">SAVE FOR WHAT MATTERS</p>
                        <h1>Savings Goals</h1>
                    </div>

                    <button
                        className="primary-button"
                        onClick={() => {
                            resetForm();
                            document.getElementById("goal-form")
                                ?.scrollIntoView({ behavior: "smooth" });
                        }}
                    >
                        + New goal
                    </button>
                </header>

                <section className="welcome-section">
                    <div>
                        <h2>Small steps, big goals 🎯</h2>
                        <p>Make a plan today and watch your savings grow.</p>
                    </div>
                    <div className="welcome-decoration">₹</div>
                </section>

                {error && <p className="feedback-error">{error}</p>}
                {success && <p className="feedback-success">{success}</p>}

                <section className="budget-summary-grid">
                    <article className="transaction-stat-card">
                        <span>Total targets</span>
                        <strong>{money(totalTarget)}</strong>
                    </article>
                    <article className="transaction-stat-card">
                        <span>Total saved</span>
                        <strong className="amount-income">{money(totalSaved)}</strong>
                    </article>
                    <article className="transaction-stat-card">
                        <span>Still to save</span>
                        <strong>{money(totalRemaining)}</strong>
                    </article>
                </section>

                <section className="transactions-panel goal-form-panel" id="goal-form">
                    <div className="panel-header">
                        <div>
                            <h2>{editingId ? "Edit savings goal" : "Create a savings goal"}</h2>
                            <p>Set a target and a deadline for your goal.</p>
                        </div>
                    </div>

                    <form className="transaction-form" onSubmit={handleSubmit}>
                        <label>
                            Goal name
                            <input
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                maxLength={100}
                                placeholder="e.g. Laptop Fund"
                                required
                            />
                        </label>

                        <label>
                            Target amount (₹)
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.targetAmount}
                                onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                                placeholder="e.g. 60000"
                                required
                            />
                        </label>

                        {!editingId && (
                            <label>
                                Already saved (₹)
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.savedAmount}
                                    onChange={(e) => setForm({ ...form, savedAmount: e.target.value })}
                                    placeholder="0"
                                />
                            </label>
                        )}

                        <label>
                            Target date (optional)
                            <input
                                type="date"
                                value={form.deadline}
                                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                            />
                        </label>

                        <label className="full-field">
                            Description (optional)
                            <input
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                maxLength={300}
                                placeholder="What are you saving for?"
                            />
                        </label>

                        <div className="form-actions full-field">
                            <button className="primary-button" disabled={saving}>
                                {saving ? "Saving..." : editingId ? "Update goal" : "Create goal"}
                            </button>

                            {editingId && (
                                <button type="button" className="secondary-button" onClick={resetForm}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="transactions-panel goal-list-panel">
                    <div className="panel-header">
                        <div>
                            <h2>Your goals</h2>
                            <p>Track your progress one contribution at a time.</p>
                        </div>
                        <span className="results-count">{goals.length} goals</span>
                    </div>

                    {loading ? (
                        <div className="loading-card">Loading savings goals...</div>
                    ) : goals.length === 0 ? (
                        <div className="empty-state">
                            <h3>No savings goals yet</h3>
                            <p>Create your first goal to get started.</p>
                        </div>
                    ) : (
                        <div className="goal-list">
                            {goals.map((goal) => {
                                const target = Number(goal.targetAmount);
                                const saved = Number(goal.savedAmount);
                                const remaining = Math.max(0, target - saved);
                                const percentage = target > 0 ? (saved / target) * 100 : 0;
                                const completed = saved >= target;

                                return (
                                    <article className="goal-card" key={goal._id}>
                                        <div className="goal-card-header">
                                            <div className="goal-title-wrap">
                                                <div className="goal-icon">🎯</div>
                                                <div>
                                                    <h3>{goal.title}</h3>
                                                    <p>{goal.description || "Keep working toward your goal!"}</p>
                                                </div>
                                            </div>

                                            <div className="budget-actions">
                                                <button className="secondary-button" onClick={() => handleEdit(goal)}>
                                                    Edit
                                                </button>
                                                <button className="delete-button" onClick={() => handleDelete(goal._id)}>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        <div className="goal-amounts">
                                            <strong>{money(saved)}</strong>
                                            <span>of {money(target)}</span>
                                            {completed && <span className="goal-complete">Goal reached!</span>}
                                        </div>

                                        <div className="budget-progress-track">
                                            <div
                                                className={`budget-progress-fill ${completed ? "" : ""}`}
                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                            />
                                        </div>

                                        <div className="goal-progress-footer">
                                            <span>{Math.round(percentage)}% saved</span>
                                            <span>{money(remaining)} to go</span>
                                        </div>

                                        {goal.deadline && (
                                            <p className="goal-deadline">
                                                Target date: {new Date(goal.deadline).toLocaleDateString("en-IN")}
                                            </p>
                                        )}

                                        {!completed && (
                                            <div className="goal-contribution-area">
                                                {contributionId === goal._id ? (
                                                    <form
                                                        className="contribution-form"
                                                        onSubmit={(e) => handleContribution(e, goal._id)}
                                                    >
                                                        <input
                                                            type="number"
                                                            min="0.01"
                                                            step="0.01"
                                                            placeholder="Contribution amount"
                                                            value={contributionAmount}
                                                            onChange={(e) => setContributionAmount(e.target.value)}
                                                            required
                                                        />
                                                        <button className="primary-button" disabled={saving}>
                                                            Add funds
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="secondary-button"
                                                            onClick={() => {
                                                                setContributionId(null);
                                                                setContributionAmount("");
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </form>
                                                ) : (
                                                    <button
                                                        className="primary-button"
                                                        onClick={() => {
                                                            setContributionId(goal._id);
                                                            setContributionAmount("");
                                                            setError("");
                                                            setSuccess("");
                                                        }}
                                                    >
                                                        + Add contribution
                                                    </button>
                                                )}
                                            </div>
                                        )}
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

export default SavingsGoals;
