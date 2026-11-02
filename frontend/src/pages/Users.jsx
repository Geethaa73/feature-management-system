import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { error } from "../utils/toast";

import PageHeader from "../components/PageHeader";

import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaSearch,
  FaSyncAlt,
  FaUserCircle,
  FaTimes,
} from "react-icons/fa";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // ==================================================
  // LOAD USERS
  // ==================================================

  const loadUsers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/users/");

      setUsers(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Users loading error:",
        err.response?.data || err
      );

      error(
        err.response?.data?.detail ||
          "Failed to load users"
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    loadUsers();
  }, []);

  // ==================================================
  // REFRESH
  // ==================================================

  const refreshUsers = async () => {
    try {
      setRefreshing(true);

      await loadUsers();
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // ==================================================
  // STATISTICS
  // ==================================================

  const activeUsers = useMemo(
    () =>
      users.filter(
        (user) => user.is_active === true
      ).length,
    [users]
  );

  const inactiveUsers = useMemo(
    () => users.length - activeUsers,
    [users, activeUsers]
  );

  // ==================================================
  // SEARCH
  // ==================================================

  const filteredUsers = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => {
      const username =
        user.username?.toLowerCase() || "";

      const email =
        user.email?.toLowerCase() || "";

      const role =
        user.role?.toLowerCase() || "";

      return (
        username.includes(query) ||
        email.includes(query) ||
        role.includes(query)
      );
    });
  }, [users, search]);

  // ==================================================
  // CLEAR SEARCH
  // ==================================================

  const clearSearch = () => {
    setSearch("");
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div>

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <PageHeader
        title="Users"
        description="View registered users, roles, and account access status."
        icon={<FaUsers />}
      />

      {/* ==================================================
          STATISTICS
      ================================================== */}

      <div className="row g-4 mb-4">

        {/* TOTAL USERS */}

        <div className="col-md-4">

          <div
            className="card border-0 h-100"
            style={{
              borderRadius: "16px",
              boxShadow:
                "0 5px 18px rgba(15, 23, 42, 0.06)",
            }}
          >

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <p
                    className="mb-2"
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Total Users
                  </p>

                  <h2
                    className="mb-1"
                    style={{
                      fontSize: "30px",
                      fontWeight: "700",
                      color: "#0F172A",
                    }}
                  >
                    {users.length}
                  </h2>

                  <small
                    style={{
                      color: "#64748B",
                    }}
                  >
                    Registered users
                  </small>

                </div>

                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    background: "#E0F2FE",
                    color: "#0284C7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaUsers size={21} />
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ACTIVE USERS */}

        <div className="col-md-4">

          <div
            className="card border-0 h-100"
            style={{
              borderRadius: "16px",
              boxShadow:
                "0 5px 18px rgba(15, 23, 42, 0.06)",
            }}
          >

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <p
                    className="mb-2"
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Active Users
                  </p>

                  <h2
                    className="mb-1"
                    style={{
                      fontSize: "30px",
                      fontWeight: "700",
                      color: "#0F172A",
                    }}
                  >
                    {activeUsers}
                  </h2>

                  <small
                    style={{
                      color: "#16A34A",
                    }}
                  >
                    Currently active
                  </small>

                </div>

                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    background: "#DCFCE7",
                    color: "#16A34A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaUserCheck size={21} />
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* INACTIVE USERS */}

        <div className="col-md-4">

          <div
            className="card border-0 h-100"
            style={{
              borderRadius: "16px",
              boxShadow:
                "0 5px 18px rgba(15, 23, 42, 0.06)",
            }}
          >

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <p
                    className="mb-2"
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Inactive Users
                  </p>

                  <h2
                    className="mb-1"
                    style={{
                      fontSize: "30px",
                      fontWeight: "700",
                      color: "#0F172A",
                    }}
                  >
                    {inactiveUsers}
                  </h2>

                  <small
                    style={{
                      color: "#64748B",
                    }}
                  >
                    Disabled accounts
                  </small>

                </div>

                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    background: "#F1F5F9",
                    color: "#64748B",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaUserTimes size={21} />
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ==================================================
          USER MANAGEMENT
      ================================================== */}

      <div
        className="card border-0"
        style={{
          borderRadius: "16px",
          boxShadow:
            "0 5px 18px rgba(15, 23, 42, 0.06)",
        }}
      >

        <div className="card-body p-4">

          {/* HEADER */}

          <div
            className="d-flex justify-content-between align-items-center mb-4"
            style={{
              gap: "15px",
              flexWrap: "wrap",
            }}
          >

            <div>

              <h4
                className="mb-1"
                style={{
                  fontSize: "19px",
                  fontWeight: "700",
                  color: "#0F172A",
                }}
              >
                User Management
              </h4>

              <p
                className="mb-0"
                style={{
                  color: "#64748B",
                  fontSize: "13px",
                }}
              >
                View registered users and their access status.
              </p>

            </div>

            {/* REFRESH */}

            <button
              type="button"
              className="btn btn-light"
              onClick={refreshUsers}
              disabled={loading || refreshing}
              style={{
                border: "1px solid #E2E8F0",
                borderRadius: "9px",
                fontSize: "13px",
                fontWeight: "600",
                color: "#475569",
                padding: "9px 14px",
              }}
            >

              <FaSyncAlt
                size={12}
                className={
                  loading || refreshing
                    ? "fa-spin"
                    : ""
                }
                style={{
                  marginRight: "7px",
                }}
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}

            </button>

          </div>

          {/* ==================================================
              SEARCH BAR
          ================================================== */}

          <div
            className="d-flex align-items-center mb-4"
            style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "10px",
              padding: "0 12px 0 14px",
              height: "44px",
              maxWidth: "450px",
            }}
          >

            <FaSearch
              size={13}
              color="#64748B"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by username, email or role..."
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                marginLeft: "10px",
                width: "100%",
                fontSize: "13px",
                color: "#0F172A",
              }}
            />

            {search && (

              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#64748B",
                  padding: "4px",
                  cursor: "pointer",
                }}
              >
                <FaTimes size={13} />
              </button>

            )}

          </div>

          {/* SEARCH RESULT COUNT */}

          {!loading && users.length > 0 && (

            <div
              className="mb-3"
              style={{
                color: "#64748B",
                fontSize: "12px",
              }}
            >
              Showing{" "}
              <strong
                style={{
                  color: "#334155",
                }}
              >
                {filteredUsers.length}
              </strong>{" "}
              of{" "}
              <strong
                style={{
                  color: "#334155",
                }}
              >
                {users.length}
              </strong>{" "}
              users
            </div>

          )}

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading ? (

            <div
              className="text-center"
              style={{
                padding: "70px 20px",
              }}
            >

              <div
                className="spinner-border"
                role="status"
                style={{
                  color: "#14B8A6",
                  width: "32px",
                  height: "32px",
                }}
              >

                <span className="visually-hidden">
                  Loading...
                </span>

              </div>

              <p
                className="mt-3 mb-0"
                style={{
                  color: "#64748B",
                  fontSize: "14px",
                }}
              >
                Loading users...
              </p>

            </div>

          ) : filteredUsers.length === 0 ? (

            /* ==================================================
               EMPTY / NO SEARCH RESULTS
            ================================================== */

            <div
              className="text-center"
              style={{
                padding: "70px 20px",
                background: "#F8FAFC",
                borderRadius: "12px",
                border: "1px dashed #CBD5E1",
              }}
            >

              <div
                style={{
                  width: "58px",
                  height: "58px",
                  borderRadius: "50%",
                  background: "#E0F2FE",
                  color: "#0284C7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <FaUsers size={23} />
              </div>

              <h5
                style={{
                  color: "#0F172A",
                  fontWeight: "700",
                  marginBottom: "7px",
                }}
              >
                {search
                  ? "No matching users"
                  : "No users found"}
              </h5>

              <p
                className="mb-3"
                style={{
                  color: "#64748B",
                  fontSize: "13px",
                }}
              >
                {search
                  ? "Try searching with a different username, email or role."
                  : "There are no registered users yet."}
              </p>

              {search && (

                <button
                  type="button"
                  className="btn btn-light btn-sm"
                  onClick={clearSearch}
                  style={{
                    border:
                      "1px solid #CBD5E1",
                    borderRadius: "8px",
                  }}
                >
                  Clear Search
                </button>

              )}

            </div>

          ) : (

            /* ==================================================
               USER TABLE
            ================================================== */

            <div className="table-responsive">

              <table
                className="table table-hover align-middle mb-0"
                style={{
                  minWidth: "780px",
                }}
              >

                <thead>

                  <tr
                    style={{
                      background: "#F8FAFC",
                      borderBottom:
                        "1px solid #E2E8F0",
                    }}
                  >

                    <th
                      style={{
                        color: "#64748B",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontWeight: "700",
                        padding: "14px 12px",
                      }}
                    >
                      ID
                    </th>

                    <th
                      style={{
                        color: "#64748B",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontWeight: "700",
                        padding: "14px 12px",
                      }}
                    >
                      User
                    </th>

                    <th
                      style={{
                        color: "#64748B",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontWeight: "700",
                        padding: "14px 12px",
                      }}
                    >
                      Email
                    </th>

                    <th
                      style={{
                        color: "#64748B",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontWeight: "700",
                        padding: "14px 12px",
                      }}
                    >
                      Role
                    </th>

                    <th
                      style={{
                        color: "#64748B",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontWeight: "700",
                        padding: "14px 12px",
                      }}
                    >
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredUsers.map(
                    (user) => (

                      <tr
                        key={user.id}
                        style={{
                          borderBottom:
                            "1px solid #F1F5F9",
                        }}
                      >

                        {/* ID */}

                        <td
                          style={{
                            padding:
                              "15px 12px",
                            color: "#64748B",
                            fontSize: "13px",
                            fontWeight: "600",
                          }}
                        >
                          #{user.id}
                        </td>

                        {/* USER */}

                        <td
                          style={{
                            padding:
                              "15px 12px",
                          }}
                        >

                          <div
                            className="d-flex align-items-center"
                            style={{
                              gap: "11px",
                            }}
                          >

                            <div
                              style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "10px",
                                background:
                                  "#CCFBF1",
                                color:
                                  "#0F766E",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                flexShrink: 0,
                              }}
                            >
                              <FaUserCircle
                                size={22}
                              />
                            </div>

                            <div>

                              <div
                                style={{
                                  fontWeight:
                                    "700",
                                  color:
                                    "#0F172A",
                                  fontSize:
                                    "13px",
                                }}
                              >
                                {user.username ||
                                  "Unknown User"}
                              </div>

                              <small
                                style={{
                                  color:
                                    "#94A3B8",
                                  fontSize:
                                    "11px",
                                }}
                              >
                                User #{user.id}
                              </small>

                            </div>

                          </div>

                        </td>

                        {/* EMAIL */}

                        <td
                          style={{
                            padding:
                              "15px 12px",
                            color: "#475569",
                            fontSize: "13px",
                          }}
                        >
                          {user.email || "—"}
                        </td>

                        {/* ROLE */}

                        <td
                          style={{
                            padding:
                              "15px 12px",
                          }}
                        >

                          <span
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              padding:
                                "6px 11px",
                              borderRadius:
                                "20px",
                              background:
                                "#EFF6FF",
                              color:
                                "#2563EB",
                              fontSize:
                                "11px",
                              fontWeight:
                                "700",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {user.role ||
                              "User"}
                          </span>

                        </td>

                        {/* STATUS */}

                        <td
                          style={{
                            padding:
                              "15px 12px",
                          }}
                        >

                          {user.is_active ? (

                            <span
                              style={{
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                gap: "6px",
                                padding:
                                  "6px 11px",
                                borderRadius:
                                  "20px",
                                background:
                                  "#DCFCE7",
                                color:
                                  "#15803D",
                                fontSize:
                                  "11px",
                                fontWeight:
                                  "700",
                              }}
                            >

                              <span
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius:
                                    "50%",
                                  background:
                                    "#16A34A",
                                }}
                              />

                              Active

                            </span>

                          ) : (

                            <span
                              style={{
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                gap: "6px",
                                padding:
                                  "6px 11px",
                                borderRadius:
                                  "20px",
                                background:
                                  "#F1F5F9",
                                color:
                                  "#64748B",
                                fontSize:
                                  "11px",
                                fontWeight:
                                  "700",
                              }}
                            >

                              <span
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius:
                                    "50%",
                                  background:
                                    "#94A3B8",
                                }}
                              />

                              Inactive

                            </span>

                          )}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Users;