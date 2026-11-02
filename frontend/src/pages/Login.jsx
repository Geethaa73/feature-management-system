import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdVisibility,
  MdVisibilityOff,
  MdSecurity,
  MdFlashOn,
  MdSettingsSuggest,
} from "react-icons/md";

import api from "../services/api";
import { success, error } from "../utils/toast";

import "../styles/login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const login = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      // ==========================================================
      // LOGIN
      // ==========================================================

      const response = await api.post(
        "/auth/login",
        {
          email: email.trim(),
          password,
        }
      );

      const token =
        response.data.access_token;

      // ==========================================================
      // SAVE TOKEN
      // ==========================================================

      localStorage.setItem(
        "token",
        token
      );

      // ==========================================================
      // GET LOGGED-IN USER
      // ==========================================================

      try {
        const userResponse =
          await api.get(
            "/users/me"
          );

        const user =
          userResponse.data;

        // Save complete user object
        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );

        // Save username separately
        if (user?.username) {
          localStorage.setItem(
            "username",
            user.username
          );
        }

      } catch (userError) {
        console.warn(
          "Unable to load user profile:",
          userError.response?.data ||
            userError
        );

        /*
          Login is still successful even if
          the profile request fails.
        */

        localStorage.setItem(
          "username",
          email.trim()
        );
      }

      // ==========================================================
      // SUCCESS
      // ==========================================================

      success("Login successful");

      navigate("/dashboard");

    } catch (err) {
      console.error(
        "Login error:",
        err.response?.data || err
      );

      const message =
        err.response?.data?.detail ||
        "Invalid email or password";

      error(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="featureops-login-page">

      {/* =====================================================
          LEFT BRANDING PANEL
      ===================================================== */}

      <div className="featureops-login-brand">

        <div className="featureops-brand-content">

          <div className="featureops-brand-logo">
            <img
              src="/favicon.svg"
              alt="FeatureOps Logo"
            />
          </div>

          <h1>
            Feature<span>Ops</span>
          </h1>

          <p className="featureops-brand-subtitle">
            Enterprise Feature Management
            <br />
            &amp; Release Control System
          </p>

          <div className="featureops-brand-line" />

          <p className="featureops-brand-description">
            Control feature releases, manage environments,
            configure targeting rules, and monitor your
            application with confidence.
          </p>

          <div className="featureops-login-features">

            <div className="featureops-login-feature">

              <div className="featureops-login-feature-icon">
                <MdFlashOn />
              </div>

              <div>
                <strong>
                  Fast Feature Control
                </strong>

                <span>
                  Manage feature releases with ease
                </span>
              </div>

            </div>

            <div className="featureops-login-feature">

              <div className="featureops-login-feature-icon">
                <MdSettingsSuggest />
              </div>

              <div>
                <strong>
                  Smart Release Management
                </strong>

                <span>
                  Control rollouts and targeting rules
                </span>
              </div>

            </div>

            <div className="featureops-login-feature">

              <div className="featureops-login-feature-icon">
                <MdSecurity />
              </div>

              <div>
                <strong>
                  Secure &amp; Reliable
                </strong>

                <span>
                  Role-based access and audit tracking
                </span>
              </div>

            </div>

          </div>

        </div>

        <div className="featureops-brand-footer">
          Feature Management · Release Control · Better Software
        </div>

      </div>

      {/* =====================================================
          RIGHT LOGIN PANEL
      ===================================================== */}

      <div className="featureops-login-form-section">

        <div className="featureops-login-card">

          {/* MOBILE BRAND */}

          <div className="featureops-mobile-brand">

            <img
              src="/favicon.svg"
              alt="FeatureOps Logo"
            />

            <div>

              <h2>
                Feature<span>Ops</span>
              </h2>

              <p>
                Release Control System
              </p>

            </div>

          </div>

          {/* LOGIN HEADER */}

          <div className="featureops-login-header">

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to your FeatureOps account
            </p>

          </div>

          {/* LOGIN FORM */}

          <form onSubmit={login}>

            {/* EMAIL */}

            <div className="featureops-form-group">

              <label htmlFor="login-email">
                Email
              </label>

              <input
                id="login-email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                disabled={loading}
                autoComplete="email"
              />

            </div>

            {/* PASSWORD */}

            <div className="featureops-form-group">

              <label htmlFor="login-password">
                Password
              </label>

              <div className="featureops-password-wrapper">

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  disabled={loading}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="featureops-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  title={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <MdVisibilityOff />
                  ) : (
                    <MdVisibility />
                  )}
                </button>

              </div>

            </div>

            {/* SIGN IN BUTTON */}

            <button
              type="submit"
              className="featureops-signin-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="featureops-button-spinner" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}

            </button>

          </form>

          {/* SIGNUP */}

          <div className="featureops-signup">

            <span>
              Don't have an account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/signup")
              }
            >
              Create Account
            </button>

          </div>

          {/* SECURITY MESSAGE */}

          <div className="featureops-security-note">

            <MdSecurity />

            <span>
              Your account is protected with secure
              authentication.
            </span>

          </div>

          {/* FOOTER */}

          <p className="featureops-login-footer">
            Secure Release Control Platform
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;