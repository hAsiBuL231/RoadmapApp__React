import { useState } from "react";
// import axios from "axios";
import "./Register.css";
import { authService } from "../../utils/apiService";

function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      //const response = await axios.post("http://127.0.0.1:5000/auth/register", { "email": email, "password": password }, {headers: {'Content-Type': 'application/json'}} );
      await authService.register({ email, password });
      setMessage("Registration successful! Redirecting to RoadMap App...");

      await authService.getCurrentUser();

      setTimeout(() => window.location.href = "/roadmap", 1500);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Create Account</h2>

        {message && (
          <div className={`register-message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form className="register-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
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
              placeholder="Create a password"
              required
            />
            <div className="password-hint">
              Use at least 8 characters with a mix of letters and numbers
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="register-button"
          >
            {isLoading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <div className="login-link">
          Already have an account? <a href="/login">Sign in</a>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;