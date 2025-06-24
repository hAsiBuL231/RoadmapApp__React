import { useState } from "react";
// import axios from "axios";
import "./Login.css";
import { authService } from "../../utils/apiService";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            //const response = await axios.post("http://127.0.0.1:5000/auth/login", { "email": email, "password": password }, { headers: { 'Content-Type': 'application/json' } });
            await authService.login({ email, password });
            setMessage("Login successful! Redirecting to RoadMap App...");
            
            await authService.getCurrentUser();

            // Redirect after short delay to show success message
            setTimeout(() => window.location.href = "/roadmap", 1000);
        } catch (error) {
            setMessage(error.response?.data?.message || "Invalid credentials!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Welcome Back</h1>

                {message && (
                    <div className={`login-message ${message.includes('successful') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {/* <div className="form-options">
                        <div className="remember-me">
                            <input id="remember" type="checkbox" />
                            <label htmlFor="remember">Remember me</label>
                        </div>
                        <a href="#" className="forgot-password">Forgot password?</a>
                    </div> */}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="login-button"
                    >
                        {isLoading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <div className="signup-link">
                    Don't have an account? <a href="/register">Sign up</a>
                </div>
            </div>
        </div>
    );
}

export default LoginForm;