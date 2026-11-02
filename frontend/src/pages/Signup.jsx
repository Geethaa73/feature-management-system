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

import "../styles/signup.css";

function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [role, setRole] = useState("Developer");

  const [loading, setLoading] = useState(false);

  const signup = async (e) => {
    e.preventDefault();

    // ============================================================
    // VALIDATION
    // ============================================================

    if (
      !username.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      error("Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      error("Passwords do not match");
      return;
    }

    // ============================================================
    // SIGNUP API
    // ============================================================

    try {
      setLoading(true);

      await api.post("/auth/signup", {
        username: username.trim(),
        email: email.trim(),
        password,
        role,
      });

      success("Account created successfully");

      navigate("/");
    } catch (err) {
      console.error(
        "Signup error:",
        err.response?.data || err
      );

      error(
        err.response?.data?.detail ||
          "Failed to create account"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="featureops-signup-page">

      {/* =====================================================
          LEFT BRANDING PANEL
      ===================================================== */}

      <div className="featureops-signup-brand">

        <div className="featureops-signup-brand-content">

          {/* LOGO */}

          <div className="featureops-signup-brand-logo">
            <img
              src="/favicon.svg"
              alt="FeatureOps Logo"
            />
          </div>

          {/* BRAND NAME */}

          <h1>
            Feature<span>Ops</span>
          </h1>

          <p className="featureops-signup-brand-subtitle">
            Enterprise Feature Management
            <br />
            &amp; Release Control System
          </p>

          <div className="featureops-signup-brand-line" />

          <p className="featureops-signup-brand-description">
            Create your FeatureOps account and start
            managing feature releases, environments,
            targeting rules, and application controls.
          </p>

          {/* FEATURES */}

          <div className="featureops-signup-features">

            <div className="featureops-signup-feature">

              <div className="featureops-signup-feature-icon">
                <MdFlashOn />
              </div>

              <div>
                <strong>
                  Feature Management
                </strong>

                <span>
                  Control application features easily
                </span>
              </div>

            </div>


            <div className="featureops-signup-feature">

              <div className="featureops-signup-feature-icon">
                <MdSettingsSuggest />
              </div>

              <div>
                <strong>
                  Release Control
                </strong>

                <span>
                  Manage rollouts and targeting rules
                </span>
              </div>

            </div>


            <div className="featureops-signup-feature">

              <div className="featureops-signup-feature-icon">
                <MdSecurity />
              </div>

              <div>
                <strong>
                  Secure Access
                </strong>

                <span>
                  Role-based access and audit tracking
                </span>
              </div>

            </div>

          </div>

        </div>


        {/* BRAND FOOTER */}

        <div className="featureops-signup-brand-footer">
          Feature Management · Release Control · Better Software
        </div>

      </div>


      {/* =====================================================
          RIGHT SIGNUP PANEL
      ===================================================== */}

      <div className="featureops-signup-form-section">

        <div className="featureops-signup-card">

          {/* MOBILE BRAND */}

          <div className="featureops-mobile-signup-brand">

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


          {/* HEADER */}

          <div className="featureops-signup-header">

            <h2>
              Create your account
            </h2>

            <p>
              Get started with FeatureOps
            </p>

          </div>


          {/* SIGNUP FORM */}

          <form onSubmit={signup}>

            {/* USERNAME */}

            <div className="featureops-signup-form-group">

              <label htmlFor="signup-username">
                Username
              </label>

              <input
                id="signup-username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                disabled={loading}
                autoComplete="username"
              />

            </div>


            {/* EMAIL */}

            <div className="featureops-signup-form-group">

              <label htmlFor="signup-email">
                Email
              </label>

              <input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                disabled={loading}
                autoComplete="email"
              />

            </div>


            {/* CREATE PASSWORD */}

            <div className="featureops-signup-form-group">

              <label htmlFor="signup-password">
                Create Password
              </label>

              <div className="featureops-signup-password-wrapper">

                <input
                  id="signup-password"
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
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="featureops-signup-password-toggle"
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

              <small className="featureops-password-hint">
                Password must be at least 6 characters.
              </small>

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="featureops-signup-form-group">

              <label htmlFor="signup-confirm-password">
                Confirm Password
              </label>

              <div className="featureops-signup-password-wrapper">

                <input
                  id="signup-confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="featureops-signup-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) => !current
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  title={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <MdVisibilityOff />
                  ) : (
                    <MdVisibility />
                  )}
                </button>

              </div>

              {/* PASSWORD MATCH MESSAGE */}

              {confirmPassword && (
                <small
                  className={
                    password === confirmPassword
                      ? "featureops-password-match"
                      : "featureops-password-error"
                  }
                >
                  {password === confirmPassword
                    ? "✓ Passwords match"
                    : "✕ Passwords do not match"}
                </small>
              )}

            </div>


            {/* ROLE */}

            <div className="featureops-signup-form-group featureops-role-group">

              <label htmlFor="signup-role">
                Role
              </label>

              <select
                id="signup-role"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
                disabled={loading}
              >
                <option value="Developer">
                  Developer
                </option>

                <option value="Product Manager">
                  Product Manager
                </option>

                <option value="QA">
                  QA
                </option>

                <option value="Admin">
                  Admin
                </option>
              </select>

            </div>


            {/* CREATE ACCOUNT BUTTON */}

            <button
              type="submit"
              className="featureops-create-account-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="featureops-signup-spinner" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}

            </button>

          </form>


          {/* LOGIN LINK */}

          <div className="featureops-signin-link">

            <span>
              Already have an account?
            </span>

            <button
              type="button"
              onClick={() => navigate("/")}
            >
              Sign In
            </button>

          </div>


          {/* SECURITY NOTE */}

          <div className="featureops-signup-security-note">

            <MdSecurity />

            <span>
              Your account is protected with secure
              authentication.
            </span>

          </div>


          {/* FOOTER */}

          <p className="featureops-signup-footer">
            Secure Release Control Platform
          </p>

        </div>

      </div>

    </div>
  );
}

export default Signup;