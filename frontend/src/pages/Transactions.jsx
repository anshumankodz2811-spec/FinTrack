
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Dashboard.css";
import "./Transactions.css";

function Transactions() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [editingId, setEditingId] = useState(null);

    const initialForm = {
        type: "expense",
        amount: "",
        category: "",
        description: "",
        date: new Date().toLocaleDateString("en-CA")
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/login");
            return;
        }

        fetchTransactions();
    }, [navigate]);

    const fetchTransactions = async () => {
        try {
            const response = await api.get("/transactions");
            setTransactions(response.data.transactions);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load transactions."
            );
        } finally {
            setLoading(false);
        }
    };

    const money = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: user?.currency || "INR",
            maximumFractionDigits: 2
        }).format(amount);

    const filteredTransactions = useMemo(() => {
        return [...transactions]
            .filter((t) => filter === "all" || t.type === filter)
            .filter((t) => {
                const term = search.toLowerCase();
                return (
                    t.category.toLowerCase().includes(term) ||
                    (t.description || "").toLowerCase().includes(term)
                );
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [transactions, filter, search]);

    const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const payload = {
                ...formData,
                amount: Number(formData.amount)
            };

            if (editingId) {
                await api.put(`/transactions/${editingId}`, payload);
                setSuccess("Transaction updated successfully!");
            } else {
                await api.post("/transactions", payload);
                setSuccess("Transaction added successfully!");
            }

            setFormData({
                ...initialForm,
                date: new Date().toLocaleDateString("en-CA")
            });
            setEditingId(null);
            await fetchTransactions();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save transaction."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (t) => {
        setEditingId(t._id);
        setFormData({
            type: t.type,
            amount: String(t.amount),
            category: t.category,
            description: t.description || "",
            date: new Date(t.date).toISOString().slice(0, 10)
        });
        setError("");
        setSuccess("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this transaction permanently?")) return;

        setError("");
        setSuccess("");

        try {
            await api.delete(`/transactions/${id}`);
            setSuccess("Transaction deleted successfully!");
            await fetchTransactions();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete transaction."
            );
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({
            ...initialForm,
            date: new Date().toLocaleDateString("en-CA")
        });
        setError("");
        setSuccess("");
    };

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

                <button className="nav-item active">
                    <span>↔</span> Transactions
                </button>

                <button
                    className="nav-item"
                    onClick={() => navigate("/budgets")}
                >
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
                        <p className="eyebrow">YOUR FINANCES</p>
                        <h1>Transactions</h1>
                    </div>
                    <button
                        className="primary-button"
                        onClick={() => {
                            setEditingId(null);
                            setFormData({
                                ...initialForm,
                                date: new Date().toLocaleDateString("en-CA")
                            });
                            document.getElementById("transaction-form")
                                ?.scrollIntoView({ behavior: "smooth" });
                        }}
                    >
                        + Add transaction
                    </button>
                </header>

                <section className="transaction-stats">
                    <div className="transaction-stat-card">
                        <span>Total income</span>
                        <strong className="amount-income">{money(totalIncome)}</strong>
                    </div>
                    <div className="transaction-stat-card">
                        <span>Total expenses</span>
                        <strong className="amount-expense">{money(totalExpenses)}</strong>
                    </div>
                    <div className="transaction-stat-card">
                        <span>All transactions</span>
                        <strong>{transactions.length}</strong>
                    </div>
                </section>

                <section className="transactions-panel form-panel" id="transaction-form">
                    <div className="panel-header">
                        <div>
                            <h2>{editingId ? "Edit transaction" : "Add a transaction"}</h2>
                            <p>Record where your money comes from or goes.</p>
                        </div>
                    </div>

                    <form className="transaction-form" onSubmit={handleSubmit}>
                        <label>
                            Type
                            <select name="type" value={formData.type} onChange={handleChange}>
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </label>

                        <label>
                            Amount (₹)
                            <input
                                type="number"
                                name="amount"
                                min="0.01"
                                step="0.01"
                                placeholder="e.g. 1200"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label>
                            Category
                            <input
                                name="category"
                                placeholder="e.g. Food"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label>
                            Date
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label className="full-field">
                            Description
                            <input
                                name="description"
                                placeholder="Add a note (optional)"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </label>

                        <div className="form-actions full-field">
                            <button className="primary-button" disabled={saving}>
                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update transaction"
                                        : "Save transaction"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={cancelEdit}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    {error && <p className="feedback-error">{error}</p>}
                    {success && <p className="feedback-success">{success}</p>}
                </section>

                <section className="transactions-panel all-transactions-panel">
                    <div className="panel-header">
                        <div>
                            <h2>All transactions</h2>
                            <p>Search and manage your financial activity.</p>
                        </div>
                        <span className="results-count">
                            {filteredTransactions.length} results
                        </span>
                    </div>

                    <div className="transaction-toolbar">
                        <input
                            type="search"
                            placeholder="Search category or description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            aria-label="Search transactions"
                        />

                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            aria-label="Filter transactions by type"
                        >
                            <option value="all">All types</option>
                            <option value="income">Income only</option>
                            <option value="expense">Expenses only</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="loading-card">Loading transactions...</div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">↔</div>
                            <h3>No matching transactions</h3>
                            <p>Try another search or add a transaction.</p>
                        </div>
                    ) : (
                        <div className="transaction-list">
                            {filteredTransactions.map((t) => (
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
                                        {new Date(t.date).toLocaleDateString("en-IN")}
                                    </span>

                                    <strong className={
                                        t.type === "income" ? "amount-income" : "amount-expense"
                                    }>
                                        {t.type === "income" ? "+" : "−"}
                                        {money(Number(t.amount))}
                                    </strong>

                                    <div className="transaction-actions">
                                        <button
                                            className="secondary-button"
                                            onClick={() => handleEdit(t)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDelete(t._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default Transactions;
