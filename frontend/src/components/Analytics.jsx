
import { useMemo, useState } from "react";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";
import "./Analytics.css";

const COLORS = [
    "#16a34a",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#64748b"
];

function Analytics({ transactions, currency = "INR" }) {
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().toLocaleDateString("en-CA").slice(0, 7)
    );

    const money = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency,
            maximumFractionDigits: 0
        }).format(amount);

    const availableMonths = useMemo(() => {
        const months = transactions.map((t) => {
            const date = new Date(t.date);
            if (Number.isNaN(date.getTime())) return null;

            return date.getFullYear() + "-" +
                String(date.getMonth() + 1).padStart(2, "0");
        });

        return [...new Set(months.filter(Boolean))].sort().reverse();
    }, [transactions]);

    const monthlyTransactions = useMemo(
        () =>
            transactions.filter((t) => {
                const date = new Date(t.date);
                if (Number.isNaN(date.getTime())) return false;

                const month =
                    date.getFullYear() + "-" +
                    String(date.getMonth() + 1).padStart(2, "0");

                return month === selectedMonth;
            }),
        [transactions, selectedMonth]
    );

    const expenseData = useMemo(() => {
        const categories = {};

        monthlyTransactions
            .filter((t) => t.type === "expense")
            .forEach((t) => {
                categories[t.category] =
                    (categories[t.category] || 0) + Number(t.amount);
            });

        return Object.entries(categories)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [monthlyTransactions]);

    const monthlyTotals = useMemo(() => {
        const income = monthlyTransactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const expenses = monthlyTransactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        return {
            income,
            expenses,
            balance: income - expenses
        };
    }, [monthlyTransactions]);

    const monthlyData = useMemo(() => {
        const months = {};

        transactions.forEach((t) => {
            const date = new Date(t.date);
            if (Number.isNaN(date.getTime())) return;

            const key = `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;

            if (!months[key]) {
                months[key] = {
                    month: date.toLocaleDateString("en-IN", {
                        month: "short",
                        year: "2-digit"
                    }),
                    income: 0,
                    expenses: 0,
                    sortKey: key
                };
            }

            if (t.type === "income") {
                months[key].income += Number(t.amount);
            } else if (t.type === "expense") {
                months[key].expenses += Number(t.amount);
            }
        });

        return Object.values(months)
            .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
            .slice(-6);
    }, [transactions]);

    const monthLabel = selectedMonth
        ? new Date(`${selectedMonth}-15T12:00:00`).toLocaleDateString(
            "en-IN",
            { month: "long", year: "numeric" }
        )
        : "Selected month";

    const tooltipStyle = {
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
        fontSize: "12px"
    };

    return (
        <div className="analytics-section">
            <div className="analytics-toolbar">
                <div>
                    <h2>Financial analytics</h2>
                    <p>Understand your spending patterns.</p>
                </div>

                <label className="month-filter">
                    <span>Monthly report</span>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                </label>
            </div>

            <div className="monthly-summary">
                <article className="monthly-summary-card">
                    <span>Monthly income</span>
                    <strong className="amount-income">
                        {money(monthlyTotals.income)}
                    </strong>
                </article>

                <article className="monthly-summary-card">
                    <span>Monthly expenses</span>
                    <strong className="amount-expense">
                        {money(monthlyTotals.expenses)}
                    </strong>
                </article>

                <article className="monthly-summary-card">
                    <span>Monthly balance</span>
                    <strong>{money(monthlyTotals.balance)}</strong>
                </article>
            </div>

            <section className="analytics-grid">
                <article className="transactions-panel analytics-panel">
                    <div className="panel-header">
                        <div>
                            <h2>Expense breakdown</h2>
                            <p>Spending by category · {monthLabel}</p>
                        </div>
                    </div>

                    {expenseData.length === 0 ? (
                        <div className="chart-empty">
                            <p>No expenses for this month.</p>
                            <span>Choose another month or record an expense.</span>
                        </div>
                    ) : (
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expenseData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={60}
                                        outerRadius={95}
                                        paddingAngle={3}
                                    >
                                        {expenseData.map((entry, index) => (
                                            <Cell
                                                key={entry.name}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => money(Number(value))}
                                        contentStyle={tooltipStyle}
                                    />
                                    <Legend verticalAlign="bottom" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </article>

                <article className="transactions-panel analytics-panel">
                    <div className="panel-header">
                        <div>
                            <h2>Monthly cash flow</h2>
                            <p>Last six active months</p>
                        </div>
                    </div>

                    {monthlyData.length === 0 ? (
                        <div className="chart-empty">
                            <p>No transaction history available.</p>
                            <span>Add transactions to build your report.</span>
                        </div>
                    ) : (
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={monthlyData}
                                    margin={{ top: 15, right: 8, left: 8, bottom: 5 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#e8ecf3"
                                    />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 11, fill: "#7a879b" }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tickFormatter={(value) =>
                                            value >= 1000
                                                ? `₹${(value / 1000).toFixed(0)}k`
                                                : `₹${value}`
                                        }
                                        tick={{ fontSize: 10, fill: "#7a879b" }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={55}
                                    />
                                    <Tooltip
                                        formatter={(value) => money(Number(value))}
                                        contentStyle={tooltipStyle}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="income"
                                        name="Income"
                                        fill="#16a34a"
                                        radius={[5, 5, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="expenses"
                                        name="Expenses"
                                        fill="#f87171"
                                        radius={[5, 5, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </article>
            </section>

            <section className="transactions-panel spending-insights">
                <div className="panel-header">
                    <div>
                        <h2>Spending insights</h2>
                        <p>Category-wise expenses for {monthLabel}</p>
                    </div>
                </div>

                {expenseData.length === 0 ? (
                    <p className="insight-empty">
                        No spending data is available for this month yet.
                    </p>
                ) : (
                    <>
                        {expenseData.map((item, index) => {
                            const percentage =
                                monthlyTotals.expenses > 0
                                    ? (item.value / monthlyTotals.expenses) * 100
                                    : 0;

                            return (
                                <div className="insight-row" key={item.name}>
                                    <div className="insight-label">
                                        <span
                                            className="insight-dot"
                                            style={{
                                                backgroundColor:
                                                    COLORS[index % COLORS.length]
                                            }}
                                        />
                                        <strong>{item.name}</strong>
                                        <span>{percentage.toFixed(1)}%</span>
                                        <strong>{money(item.value)}</strong>
                                    </div>

                                    <div className="insight-track">
                                        <div
                                            className="insight-fill"
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor:
                                                    COLORS[index % COLORS.length]
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        <p className="insight-total">
                            Total spending: <strong>{money(monthlyTotals.expenses)}</strong>
                        </p>
                    </>
                )}
            </section>
        </div>
    );
}

export default Analytics;
