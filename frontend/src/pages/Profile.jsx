import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  MdPerson,
  MdEmail,
  MdSecurity,
  MdBadge,
  MdCalendarToday,
  MdLogout,
} from "react-icons/md";

import api from "../services/api";
import { error } from "../utils/toast";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================================
  // LOAD CURRENT USER
  // ==========================================================

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);

      const response = await api.get("/users/me");

      const userData = response.data;

      setUser(userData);

      // Keep localStorage synchronized
      localStorage.setItem(
        "user",
        JSON.stringify(userData)
      );

      if (userData?.username) {
        localStorage.setItem(
          "username",
          userData.username
        );
      }
    } catch (err) {
      console.error(
        "Profile loading error:",
        err.response?.data || err
      );

      error(
        err.response?.data?.detail ||
          "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("user");

    navigate("/");
  };

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // ==========================================================
  // GET INITIALS
  // ==========================================================

  const getInitials = (name) => {
    if (!name) {
      return "U";
    }

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="profile-page">

        <div className="profile-loading">

          <div
            className="spinner-border"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p>
            Loading profile...
          </p>

        </div>

      </div>
    );
  }

  // ==========================================================
  // PROFILE PAGE
  // ==========================================================

  return (
    <div className="profile-page">

      {/* ====================================================
          PAGE HEADER
      ==================================================== */}

      <div className="profile-header">

        <div>

          <h1>
            My Profile
          </h1>

          <p>
            View your FeatureOps account information.
          </p>

        </div>

      </div>


      {/* ====================================================
          PROFILE OVERVIEW
      ==================================================== */}

      <div className="profile-card profile-overview-card">

        <div className="profile-overview">

          <div className="profile-avatar">

            {getInitials(
              user?.username
            )}

          </div>


          <div className="profile-name-section">

            <h2>
              {user?.username || "User"}
            </h2>

            <p>
              {user?.role || "User"}
            </p>


            <span
              className={`profile-account-badge ${
                user?.is_active
                  ? "active"
                  : "inactive"
              }`}
            >

              <span className="profile-status-dot" />

              {user?.is_active
                ? "Active Account"
                : "Inactive Account"}

            </span>

          </div>

        </div>

      </div>


      {/* ====================================================
          INFORMATION GRID
      ==================================================== */}

      <div className="profile-grid">


        {/* ==================================================
            ACCOUNT INFORMATION
        ================================================== */}

        <div className="profile-card profile-info-card">

          <div className="profile-card-title">

            <div className="profile-card-title-icon">

              <MdSecurity />

            </div>


            <div>

              <h3>
                Account Information
              </h3>

              <p>
                Your registered FeatureOps account details.
              </p>

            </div>

          </div>


          <div className="profile-info-list">


            {/* USERNAME */}

            <div className="profile-info-row">

              <div className="profile-info-label">

                <MdPerson />

                <span>
                  Username
                </span>

              </div>


              <strong>
                {user?.username || "—"}
              </strong>

            </div>


            {/* EMAIL */}

            <div className="profile-info-row">

              <div className="profile-info-label">

                <MdEmail />

                <span>
                  Email
                </span>

              </div>


              <strong>
                {user?.email || "—"}
              </strong>

            </div>


            {/* ROLE */}

            <div className="profile-info-row">

              <div className="profile-info-label">

                <MdBadge />

                <span>
                  Role
                </span>

              </div>


              <strong>
                {user?.role || "—"}
              </strong>

            </div>


            {/* USER ID */}

            <div className="profile-info-row">

              <div className="profile-info-label">

                <MdSecurity />

                <span>
                  User ID
                </span>

              </div>


              <strong>
                #{user?.id ?? "—"}
              </strong>

            </div>


            {/* CREATED DATE */}

            <div className="profile-info-row">

              <div className="profile-info-label">

                <MdCalendarToday />

                <span>
                  Account Created
                </span>

              </div>


              <strong>
                {formatDate(
                  user?.created_at
                )}
              </strong>

            </div>


            {/* ACCOUNT STATUS */}

            <div className="profile-info-row">

              <div className="profile-info-label">

                <MdSecurity />

                <span>
                  Account Status
                </span>

              </div>


              <strong
                className={
                  user?.is_active
                    ? "profile-status-active"
                    : "profile-status-inactive"
                }
              >
                {user?.is_active
                  ? "Active"
                  : "Inactive"}
              </strong>

            </div>

          </div>

        </div>


        {/* ==================================================
            PROFILE SUMMARY
        ================================================== */}

        <div className="profile-card profile-summary-card">

          <div className="profile-card-title">

            <div className="profile-card-title-icon">

              <MdPerson />

            </div>


            <div>

              <h3>
                Profile Summary
              </h3>

              <p>
                Your current FeatureOps access profile.
              </p>

            </div>

          </div>


          <div className="profile-summary-content">


            {/* USER ID */}

            <div className="profile-summary-item">

              <span className="profile-summary-number">

                {user?.id ?? "—"}

              </span>

              <span className="profile-summary-label">

                User ID

              </span>

            </div>


            {/* ROLE */}

            <div className="profile-summary-item">

              <span className="profile-summary-number">

                {user?.role || "—"}

              </span>

              <span className="profile-summary-label">

                Assigned Role

              </span>

            </div>


            {/* STATUS */}

            <div className="profile-summary-item">

              <span
                className={`profile-summary-status ${
                  user?.is_active
                    ? "active"
                    : "inactive"
                }`}
              >

                {user?.is_active
                  ? "ACTIVE"
                  : "INACTIVE"}

              </span>

              <span className="profile-summary-label">

                Account Status

              </span>

            </div>

          </div>


          <div className="profile-summary-note">

            <MdSecurity />

            <span>

              Your account information is managed by
              the FeatureOps authentication system.

            </span>

          </div>

        </div>

      </div>


      {/* ====================================================
          LOGOUT
      ==================================================== */}

      <div className="profile-danger-card">

        <div>

          <h3>
            Sign out of FeatureOps
          </h3>

          <p>
            You will need to sign in again to access
            your FeatureOps workspace.
          </p>

        </div>


        <button
          type="button"
          onClick={logout}
          className="profile-logout-button"
        >

          <MdLogout />

          Logout

        </button>

      </div>

    </div>
  );
}

export default Profile;