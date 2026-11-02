
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaBell,
  FaSearch,
  FaUserCircle,
} from "react-icons/fa";

import {
  MdKeyboardArrowDown,
  MdClose,
  MdCheckCircle,
  MdInfo,
  MdWarning,
} from "react-icons/md";

import { useTranslation } from "react-i18next";

/* =========================================================
   GET LOGGED-IN USERNAME
========================================================= */

function getLoggedInUsername() {
  const username = localStorage.getItem("username");

  if (
    username &&
    username.trim() !== "" &&
    username !== "Admin"
  ) {
    return username;
  }

  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);

      const possibleName =
        user?.username ||
        user?.name ||
        user?.full_name ||
        user?.fullName;

      if (
        possibleName &&
        String(possibleName).trim() !== ""
      ) {
        return String(possibleName);
      }
    } catch {
      console.warn("Unable to read stored user information.");
    }
  }

  const token = localStorage.getItem("token");

  if (token) {
    try {
      const payload = token.split(".")[1];

      const decodedPayload = JSON.parse(
        atob(
          payload
            .replace(/-/g, "+")
            .replace(/_/g, "/")
        )
      );

      const tokenUsername =
        decodedPayload?.username ||
        decodedPayload?.name;

      if (
        tokenUsername &&
        String(tokenUsername).trim() !== ""
      ) {
        return String(tokenUsername);
      }
    } catch {
      console.warn("Unable to read username from token.");
    }
  }

  return "Admin";
}

function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationRef = useRef(null);

  const username = getLoggedInUsername();
  const today = new Date();

  /* =========================================================
     LANGUAGES
  ========================================================= */

  const languages = [
    { value: "en", label: "English", flag: "🇬🇧" },
    { value: "ta", label: "தமிழ்", flag: "🇮🇳" },
    { value: "hi", label: "हिन्दी", flag: "🇮🇳" },
    { value: "te", label: "తెలుగు", flag: "🇮🇳" },
    { value: "ml", label: "മലയാളം", flag: "🇮🇳" },
    { value: "kn", label: "ಕನ್ನಡ", flag: "🇮🇳" },
    { value: "bn", label: "বাংলা", flag: "🇮🇳" },
    { value: "fr", label: "Français", flag: "🇫🇷" },
    { value: "de", label: "Deutsch", flag: "🇩🇪" },
    { value: "es", label: "Español", flag: "🇪🇸" },
  ];

  /* =========================================================
     SEARCHABLE PAGES
  ========================================================= */

  const searchablePages = [
    {
      name: t("navigation.dashboard"),
      keywords: ["dashboard", "home", "overview"],
      path: "/dashboard",
    },
    {
      name: t("navigation.features"),
      keywords: ["features", "feature flags", "flags"],
      path: "/features",
    },
    {
      name: t("navigation.environments"),
      keywords: ["environment", "environments", "development", "production"],
      path: "/environments",
    },
    {
      name: t("navigation.groups"),
      keywords: ["groups", "group"],
      path: "/groups",
    },
    {
      name: t("navigation.userGroups"),
      keywords: ["user groups", "groups"],
      path: "/user-groups",
    },
    {
      name: "Targeting Rules",
      keywords: ["targeting", "rules", "targeting rules"],
      path: "/targeting-rules",
    },
    {
      name: t("navigation.overrides"),
      keywords: ["override", "overrides"],
      path: "/overrides",
    },
    {
      name: t("navigation.users"),
      keywords: ["users", "user", "user management"],
      path: "/users",
    },
    {
      name: t("navigation.auditLogs"),
      keywords: ["audit", "logs", "audit logs"],
      path: "/audit-logs",
    },
    {
      name: t("navigation.evaluate"),
      keywords: ["evaluate", "evaluation", "flag evaluation"],
      path: "/evaluate",
    },
    {
      name: t("navigation.analysis"),
      keywords: ["analysis", "analytics", "statistics"],
      path: "/analysis",
    },
    {
      name: "Python SDK",
      keywords: ["sdk", "python", "developer"],
      path: "/sdk",
    },
    {
      name: "Profile",
      keywords: [
        "profile",
        "account",
        "my profile",
        "user profile",
        "account information",
      ],
      path: "/profile",
    },
  ];

  /* =========================================================
     SEARCH RESULTS
  ========================================================= */

  const filteredPages = searchQuery.trim().length > 0
    ? searchablePages.filter((page) => {
        const query = searchQuery.trim().toLowerCase();

        return (
          page.name.toLowerCase().includes(query) ||
          page.keywords.some((keyword) =>
            keyword.toLowerCase().includes(query)
          )
        );
      })
    : [];

  /* =========================================================
     LANGUAGE
  ========================================================= */

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSelect = (path) => {
    navigate(path);
    setSearchQuery("");
  };

  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  const notifications = [
    {
      id: 1,
      type: "success",
      icon: <MdCheckCircle />,
      title: "FeatureOps is running",
      message: "Your feature management system is online.",
    },
    {
      id: 2,
      type: "info",
      icon: <MdInfo />,
      title: "Feature management",
      message: "Review your active feature flags regularly.",
    },
    {
      id: 3,
      type: "warning",
      icon: <MdWarning />,
      title: "Release review",
      message: "Check rollout status before a full release.",
    },
  ];

  /* =========================================================
     CLOSE NOTIFICATIONS WHEN CLICKING OUTSIDE
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* =========================================================
     OPEN PROFILE
  ========================================================= */

  const openProfile = () => {
    navigate("/profile");
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <header className="top-navbar">

      {/* WELCOME */}

      <div className="navbar-welcome">
        <div className="navbar-welcome-title">
          Welcome back,
          <strong>{username}</strong>
        </div>

        <div className="navbar-welcome-date">
          {today.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* ACTIONS */}

      <div className="navbar-actions">

        {/* SEARCH */}

        <div className="navbar-search">
          <FaSearch className="navbar-search-icon" />

          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder={
              t("common.search") ||
              "Search pages, features..."
            }
            aria-label="Search"
          />

          {searchQuery.trim() && (
            <button
              type="button"
              className="navbar-search-clear"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <MdClose />
            </button>
          )}

          {searchQuery.trim() && (
            <div className="navbar-search-results">
              {filteredPages.length > 0 ? (
                filteredPages.map((page) => (
                  <button
                    key={page.path}
                    type="button"
                    className="navbar-search-result"
                    onClick={() => handleSearchSelect(page.path)}
                  >
                    <span className="navbar-search-result-icon">
                      <FaSearch />
                    </span>

                    <span className="navbar-search-result-content">
                      <span className="navbar-search-result-title">
                        {page.name}
                      </span>

                      <span className="navbar-search-result-path">
                        {page.path}
                      </span>
                    </span>
                  </button>
                ))
              ) : (
                <div className="navbar-search-no-results">
                  <span className="navbar-search-no-results-icon">
                    <FaSearch />
                  </span>

                  <span>
                    <strong>No matching page found</strong>
                    <small>Try another keyword.</small>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* LANGUAGE */}

        <div className="language-wrapper">
          <select
            value={
              i18n.resolvedLanguage ||
              localStorage.getItem("language") ||
              "en"
            }
            onChange={(event) =>
              changeLanguage(event.target.value)
            }
            aria-label="Language"
          >
            {languages.map((language) => (
              <option
                key={language.value}
                value={language.value}
              >
                {language.flag} {language.label}
              </option>
            ))}
          </select>

          <MdKeyboardArrowDown />
        </div>

        {/* NOTIFICATIONS */}

        <div
          ref={notificationRef}
          className="notification-wrapper"
        >
          <button
            type="button"
            className={`navbar-icon-button ${
              showNotifications ? "notification-active" : ""
            }`}
            aria-label="Notifications"
            onClick={() =>
              setShowNotifications((previous) => !previous)
            }
          >
            <FaBell />
            <span className="notification-dot" />
          </button>

          {showNotifications && (
            <div className="notification-dropdown">

              <div className="notification-header">
                <div>
                  <strong>Notifications</strong>
                  <span>Recent system activity</span>
                </div>

                <div className="notification-header-actions">
                  <span className="notification-count">
                    {notifications.length}
                  </span>

                  <button
                    type="button"
                    className="notification-close"
                    aria-label="Close notifications"
                    onClick={() => setShowNotifications(false)}
                  >
                    <MdClose size={19} />
                  </button>
                </div>
              </div>

              <div className="notification-list">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="notification-item"
                  >
                    <div
                      className={`notification-item-icon ${notification.type}`}
                    >
                      {notification.icon}
                    </div>

                    <div className="notification-item-content">
                      <strong>{notification.title}</strong>
                      <span>{notification.message}</span>
                      <small>Just now</small>
                    </div>
                  </div>
                ))}
              </div>

              <div className="notification-footer">
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                >
                  Close notifications
                </button>
              </div>

            </div>
          )}
        </div>

        {/* USER / PROFILE */}

        <button
          type="button"
          className="navbar-user"
          onClick={openProfile}
          title="Open Profile"
          aria-label="Open Profile"
        >
          <FaUserCircle className="navbar-user-icon" />

          <div className="navbar-user-info">
            <strong>{username}</strong>

            <span>
              <i />
              Online
            </span>
          </div>
        </button>

      </div>
    </header>
  );
}

export default Navbar;
