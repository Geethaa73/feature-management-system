import {
  MdDashboard,
  MdOutlineFlag,
  MdPublic,
  MdPeople,
  MdGroup,
  MdGroups,
  MdTune,
  MdHistory,
  MdManageSearch,
  MdAnalytics,
  MdRule,
  MdCode,
  MdPerson,
  MdLogout,
  MdClose,
} from "react-icons/md";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useTranslation } from "react-i18next";

function Sidebar({
  mobileOpen = false,
  onClose = () => {},
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  /*
  ==========================================================
  SIDEBAR MENU GROUPS
  ==========================================================
  */

  const menuGroups = [
    {
      title: "CORE",
      items: [
        {
          path: "/dashboard",
          label: t("navigation.dashboard"),
          icon: <MdDashboard />,
        },
        {
          path: "/features",
          label: t("navigation.features"),
          icon: <MdOutlineFlag />,
        },
        {
          path: "/environments",
          label: t("navigation.environments"),
          icon: <MdPublic />,
        },
        {
          path: "/overrides",
          label: t("navigation.overrides"),
          icon: <MdTune />,
        },
      ],
    },

    {
      title: "MANAGEMENT",
      items: [
        {
          path: "/groups",
          label: t("navigation.groups"),
          icon: <MdGroup />,
        },
        {
          path: "/user-groups",
          label: t("navigation.userGroups"),
          icon: <MdGroups />,
        },
        {
          path: "/users",
          label: t("navigation.users"),
          icon: <MdPeople />,
        },
        {
          path: "/targeting-rules",
          label: "Targeting Rules",
          icon: <MdRule />,
        },
      ],
    },

    {
      title: "DEVELOPER",
      items: [
        {
          path: "/evaluate",
          label: t("navigation.evaluate"),
          icon: <MdManageSearch />,
        },
        {
          path: "/analysis",
          label: t("navigation.analysis"),
          icon: <MdAnalytics />,
        },
        {
          path: "/sdk",
          label: "Python SDK",
          icon: <MdCode />,
        },
      ],
    },

    {
      title: "ACCOUNT & SYSTEM",
      items: [
        {
          path: "/profile",
          label: "Profile",
          icon: <MdPerson />,
        },
        {
          path: "/audit-logs",
          label: t("navigation.auditLogs"),
          icon: <MdHistory />,
        },
      ],
    },
  ];

  /*
  ==========================================================
  LOGOUT
  ==========================================================
  */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("user");

    navigate("/");
  };

  /*
  ==========================================================
  ACTIVE ROUTE
  ==========================================================
  */

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return location.pathname.startsWith(path);
  };

  /*
  ==========================================================
  SIDEBAR
  ==========================================================
  */

  return (
    <>
      {/* ==================================================
          MOBILE OVERLAY
      ================================================== */}

      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={`feature-sidebar ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >

        {/* ==================================================
            BRAND
        ================================================== */}

        <div className="sidebar-brand">

          <div className="brand-logo">
            <img
              src="/favicon.svg"
              alt="FeatureOps"
            />
          </div>

          <div className="brand-text">

            <div className="brand-name">
              FeatureOps
            </div>

            <div className="brand-subtitle">
              Release Control System
            </div>

          </div>

          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <MdClose />
          </button>

        </div>


        {/* ==================================================
            GROUPED NAVIGATION
        ================================================== */}

        <nav className="sidebar-nav">

          {menuGroups.map((group) => (
            <div
              className="sidebar-menu-group"
              key={group.title}
            >

              {/* SECTION TITLE */}

              <div className="sidebar-section-title">
                {group.title}
              </div>


              {/* SECTION ITEMS */}

              {group.items.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  className={`sidebar-item ${
                    isActive(item.path)
                      ? "active"
                      : ""
                  }`}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                >

                  <span className="sidebar-icon">
                    {item.icon}
                  </span>

                  <span className="sidebar-label">
                    {item.label}
                  </span>

                </button>
              ))}

            </div>
          ))}

        </nav>


        {/* ==================================================
            BOTTOM
        ================================================== */}

        <div className="sidebar-bottom">

          {/* SYSTEM STATUS */}

          <div className="sidebar-status">

            <span className="status-dot" />

            <div>

              <div className="status-title">
                System Online
              </div>

              <div className="status-text">
                All Systems Operational
              </div>

            </div>

          </div>


          {/* LOGOUT */}

          <button
            type="button"
            className="sidebar-logout"
            onClick={logout}
          >

            <MdLogout />

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;