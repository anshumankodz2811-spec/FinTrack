
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        setMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
                {
                    email: formData.email.trim(),
                    password: formData.password
                }
            );

            const { token, user } = response.data;

            if (!token || !user) {
                throw new Error("Invalid login response. Please try again.");
            }

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            navigate("/dashboard");
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                error.message ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-page">
            <section className="login-showcase">
                <Link to="/" className="login-brand">
                    <span className="login-brand-icon">F</span>
                    <span>FinTrack<span className="login-brand-dot">.</span></span>
                </Link>

                <div className="login-showcase-content">
                    <span className="login-showcase-badge">
                        YOUR MONEY. YOUR FUTURE.
                    </span>

                    <h1>
                        Welcome back.
                        <br />
                        <span>Your money,</span>
                        <br />
                        your momentum.
                    </h1>

                    <p className="login-showcase-description">
                        Pick up where you left off. Keep your spending
                        in check, make progress on your goals, and stay
                        in control of your financial future.
                    </p>

                    <div className="login-finance-visual" aria-hidden="true">
                        <div className="login-orbit login-orbit-one" />
                        <div className="login-orbit login-orbit-two" />

                        <div className="login-visual-card">
                            <div className="login-visual-card-top">
                                <span>Your financial journey</span>
                                <span className="login-visual-status">
                                    ↗ Keep growing
                                </span>
                            </div>

                            <div className="login-visual-chart">
                                <svg viewBox="0 0 320 120" role="presentation">
                                    <defs>
                                        <linearGradient
                                            id="loginGrowthFill"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="#35e69b"
                                                stopOpacity="0.3"
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="#35e69b"
                                                stopOpacity="0"
                                            />
                                        </linearGradient>
                                    </defs>

                                    <path
                                        d="M0 100 L35 85 L70 91 L108 58 L145 68 L185 38 L220 49 L260 20 L320 8 L320 120 L0 120 Z"
                                        fill="url(#loginGrowthFill)"
                                    />

                                    <path
                                        d="M0 100 L35 85 L70 91 L108 58 L145 68 L185 38 L220 49 L260 20 L320 8"
                                        fill="none"
                                        stroke="#35e69b"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>

                            <div className="login-visual-card-footer">
                                <span>Stay consistent</span>
                                <span>Progress adds up ↗</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="login-showcase-footer">
                    <span className="login-footer-check">✓</span>
                    Your financial journey continues here.
                </div>
            </section>

            <section className="login-form-section">
                <div className="login-mobile-brand">
                    <span className="login-brand-icon">F</span>
                    <span>FinTrack<span className="login-brand-dot">.</span></span>
                </div>

                <div className="login-form-wrapper">
                    <div className="login-form-heading">
                        <span className="login-form-eyebrow">
                            YOUR FINANCES, ONE PLACE
                        </span>

                        <h2>Welcome back</h2>

                        <p>
                            Sign in to continue managing your money smarter.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="login-form-field">
                            <label htmlFor="login-email">Email address</label>

                            <input
                                id="login-email"
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="login-form-field">
                            <div className="login-password-label">
                                <label htmlFor="login-password">Password</label>
                            </div>

                            <div className="login-password-wrapper">
                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="login-password-toggle"
                                    onClick={() =>
                                        setShowPassword((previous) => !previous)
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        {message && (
                            <div className="login-error-message" role="alert">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="login-spinner" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in to FinTrack
                                    <span aria-hidden="true">→</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-divider">
                        <span>YOUR FINANCIAL FUTURE STARTS HERE</span>
                    </div>

                    <p className="login-register-prompt">
                        New to FinTrack?{" "}
                        <Link to="/register">Create an account</Link>
                    </p>

                    <p className="login-security-note">
                        Your account is personal. Never share your password
                        or authentication token with anyone.
                    </p>
                </div>

                <div className="login-bottom-note">
                    <span>© {new Date().getFullYear()} FinTrack</span>
                    <span>Built for smarter money management.</span>
                </div>
            </section>
        </main>
    );
}

export default Login;
