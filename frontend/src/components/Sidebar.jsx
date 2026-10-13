
import { useLocation, useNavigate } from "react-router-dom";

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    let user = {};

    try {
        user = JSON.parse(localStorage.getItem("user") || "{}") || {};
    } catch {
        user = {};
    }

    const items = [
        { label: "Dashboard", path: "/dashboard", icon: "▦" },
        { label: "Transactions", path: "/transactions", icon: "↔" },
        { label: "Budgets", path: "/budgets", icon: "◎" },
        { label: "Savings Goals", path: "/savings-goals", icon: "🎯" },
    ];

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <aside className="sidebar">
            <div className="brand">
                <div className="brand-icon">F</div>
                <span>FinTrack</span>
            </div>

            <p className="nav-heading">MENU</p>

            {items.map((item) => (
                <button
                    key={item.path}
                    type="button"
                    className={`nav-item ${
                        location.pathname === item.path ? "active" : ""
                    }`}
                    onClick={() => navigate(item.path)}
                >
                    <span>{item.icon}</span> {item.label}
                </button>
            ))}

            <button
                type="button"
                className={`nav-item ai-nav-item ${
                    location.pathname === "/ai-assistant" ? "active" : ""
                }`}
                onClick={() => navigate("/ai-assistant")}
            >
                <span>✦</span> AI Assistant
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
                    type="button"
                    className="logout-button"
                    title="Log out"
                    onClick={logout}
                >
                    ↪
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
