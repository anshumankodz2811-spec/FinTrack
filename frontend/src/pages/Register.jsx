
import { useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

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

        if (formData.name.trim().length < 2) {
            setIsError(true);
            setMessage("Name must contain at least 2 characters.");
            return;
        }

        if (formData.password.length < 8) {
            setIsError(true);
            setMessage("Password must contain at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(
                "/auth/register",
                {
                    ...formData,
                    name: formData.name.trim(),
                    email: formData.email.trim()
                }
            );

            setIsError(false);
            setMessage(
                response.data.message ||
                "Account created successfully!"
            );

            setTimeout(() => navigate("/login"), 1000);
        } catch (error) {
            setIsError(true);
            setMessage(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="register-page">
            <section className="register-showcase">
                <Link to="/" className="register-brand">
                    <span className="register-brand-icon">F</span>
                    <span>FinTrack<span className="brand-dot">.</span></span>
                </Link>

                <div className="showcase-content">
                    <span className="showcase-badge">
                        YOUR MONEY. YOUR FUTURE.
                    </span>

                    <h1>
                        Build better
                        <br />
                        habits.
                        <br />
                        <span>Grow your wealth.</span>
                    </h1>

                    <p className="showcase-description">
                        Take control of your finances with a clearer view
                        of your spending, savings and financial goals.
                    </p>

                    <div className="finance-visual" aria-hidden="true">
                        <div className="visual-orbit orbit-one" />
                        <div className="visual-orbit orbit-two" />

                        <div className="visual-card">
                            <div className="visual-card-top">
                                <span>Financial growth</span>
                                <span className="visual-status">↗ +24.8%</span>
                            </div>

                            <div className="visual-chart">
                                <svg
                                    viewBox="0 0 320 120"
                                    role="presentation"
                                >
                                    <defs>
                                        <linearGradient
                                            id="growthFill"
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
                                        fill="url(#growthFill)"
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

                            <div className="visual-card-footer">
                                <span>Plan today</span>
                                <span>Grow tomorrow ↗</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="showcase-footer">
                    <span className="footer-check">✓</span>
                    Simple tracking. Smarter decisions.
                </div>
            </section>

            <section className="register-form-section">
                <div className="mobile-brand">
                    <span className="register-brand-icon">F</span>
                    <span>FinTrack<span className="brand-dot">.</span></span>
                </div>

                <div className="register-form-wrapper">
                    <div className="form-heading">
                        <span className="form-eyebrow">GET STARTED — IT'S FREE</span>
                        <h2>Create your account</h2>
                        <p>
                            Start your journey towards smarter money management.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="form-field">
                            <label htmlFor="register-name">Full name</label>
                            <input
                                id="register-name"
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                autoComplete="name"
                                minLength={2}
                                maxLength={100}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="register-email">Email address</label>
                            <input
                                id="register-email"
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="register-password">Password</label>

                            <div className="password-input-wrapper">
                                <input
                                    id="register-password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
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

                            <span className="field-hint">
                                Use at least 8 characters.
                            </span>
                        </div>

                        {message && (
                            <div
                                className={`register-message ${
                                    isError ? "message-error" : "message-success"
                                }`}
                                role="status"
                            >
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="register-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="button-spinner" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create account
                                    <span aria-hidden="true">→</span>
                                </>
                            )}
                        </button>
                    </form>

                    <p className="login-prompt">
                        Already have an account?{" "}
                        <Link to="/login">Sign in</Link>
                    </p>

                    <p className="register-legal">
                        By creating an account, you agree to use FinTrack
                        responsibly and keep your login credentials secure.
                    </p>
                </div>

                <div className="form-bottom-note">
                    <span>© {new Date().getFullYear()} FinTrack</span>
                    <span>Made for a smarter financial future.</span>
                </div>
            </section>
        </main>
    );
}

export default Register;
