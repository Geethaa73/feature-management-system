import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { error } from "../utils/toast";

import PageHeader from "../components/PageHeader";

import {
  FaClipboardList,
  FaSearch,
  FaSyncAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaExchangeAlt,
  FaHistory,
  FaTimes,
  FaEye,
  FaCalendarAlt,
  FaUser,
  FaFlag,
  FaServer,
} from "react-icons/fa";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [actionFilter, setActionFilter] =
    useState("ALL");

  const [flagFilter, setFlagFilter] =
    useState("ALL");

  const [userFilter, setUserFilter] =
    useState("ALL");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [selectedLog, setSelectedLog] =
    useState(null);

  // ==================================================
  // LOAD AUDIT LOGS
  // ==================================================

  const loadLogs = async () => {
    try {
      setLoading(true);

      const params = {};

      if (flagFilter !== "ALL") {
        params.flag_id = Number(flagFilter);
      }

      if (userFilter !== "ALL") {
        params.performed_by = userFilter;
      }

      if (actionFilter !== "ALL") {
        params.action = actionFilter;
      }

      if (startDate) {
        params.start_date =
          `${startDate}T00:00:00`;
      }

      if (endDate) {
        params.end_date =
          `${endDate}T23:59:59`;
      }

      const response = await api.get(
        "/audit-logs/",
        { params }
      );

      setLogs(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Audit logs loading error:",
        err.response?.data || err
      );

      error(
        err.response?.data?.detail ||
          "Failed to load audit logs"
      );

      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    loadLogs();
  }, []);

  // ==================================================
  // SERVER FILTER LOAD
  // ==================================================

  useEffect(() => {
    if (!loading) {
      loadLogs();
    }
  }, [
    flagFilter,
    userFilter,
    actionFilter,
    startDate,
    endDate,
  ]);

  // ==================================================
  // REFRESH
  // ==================================================

  const refreshLogs = async () => {
    try {
      setRefreshing(true);
      await loadLogs();
    } finally {
      setRefreshing(false);
    }
  };

  // ==================================================
  // UNIQUE FILTER OPTIONS
  // ==================================================

  const flagOptions = useMemo(() => {
    const values = logs
      .map((log) => log.flag_id)
      .filter(
        (value) =>
          value !== null &&
          value !== undefined
      );

    return [...new Set(values)].sort(
      (a, b) => a - b
    );
  }, [logs]);

  const userOptions = useMemo(() => {
    const values = logs
      .map((log) => log.performed_by)
      .filter(Boolean);

    return [...new Set(values)].sort();
  }, [logs]);

  // ==================================================
  // STATISTICS
  // ==================================================

  const statistics = useMemo(() => {
    const createCount = logs.filter((log) =>
      log.action?.toUpperCase().includes("CREATE")
    ).length;

    const updateCount = logs.filter((log) =>
      log.action?.toUpperCase().includes("UPDATE")
    ).length;

    const deleteCount = logs.filter((log) =>
      log.action?.toUpperCase().includes("DELETE")
    ).length;

    const toggleCount = logs.filter((log) =>
      log.action?.toUpperCase().includes("TOGGLE")
    ).length;

    return {
      createCount,
      updateCount,
      deleteCount,
      toggleCount,
    };
  }, [logs]);

  // ==================================================
  // LOCAL SEARCH
  // ==================================================

  const filteredLogs = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return logs.filter((log) => {
      const action =
        log.action?.toLowerCase() || "";

      const performedBy =
        String(log.performed_by || "")
          .toLowerCase();

      const oldValue =
        String(log.old_value || "")
          .toLowerCase();

      const newValue =
        String(log.new_value || "")
          .toLowerCase();

      const flagId =
        String(log.flag_id || "")
          .toLowerCase();

      const environmentId =
        String(log.environment_id || "")
          .toLowerCase();

      return (
        !query ||
        action.includes(query) ||
        performedBy.includes(query) ||
        oldValue.includes(query) ||
        newValue.includes(query) ||
        flagId.includes(query) ||
        environmentId.includes(query)
      );
    });
  }, [logs, search]);

  // ==================================================
  // ACTION BADGE
  // ==================================================

  const getActionStyle = (action) => {
    const normalized =
      action?.toUpperCase() || "";

    if (normalized.includes("CREATE")) {
      return {
        background: "#DCFCE7",
        color: "#15803D",
        icon: <FaPlus size={9} />,
      };
    }

    if (normalized.includes("UPDATE")) {
      return {
        background: "#DBEAFE",
        color: "#2563EB",
        icon: <FaEdit size={9} />,
      };
    }

    if (normalized.includes("DELETE")) {
      return {
        background: "#FEE2E2",
        color: "#DC2626",
        icon: <FaTrash size={9} />,
      };
    }

    if (
      normalized.includes("TOGGLE") ||
      normalized.includes("ROLLOUT")
    ) {
      return {
        background: "#FEF3C7",
        color: "#B45309",
        icon: <FaExchangeAlt size={9} />,
      };
    }

    if (
      normalized.includes("TARGET") ||
      normalized.includes("OVERRIDE") ||
      normalized.includes("RELEASE")
    ) {
      return {
        background: "#EDE9FE",
        color: "#7C3AED",
        icon: <FaExchangeAlt size={9} />,
      };
    }

    return {
      background: "#F1F5F9",
      color: "#475569",
      icon: <FaHistory size={9} />,
    };
  };

  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatDate = (timestamp) => {
    if (!timestamp) {
      return "—";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString();
  };

  // ==================================================
  // CLEAR FILTERS
  // ==================================================

  const clearFilters = () => {
    setSearch("");
    setActionFilter("ALL");
    setFlagFilter("ALL");
    setUserFilter("ALL");
    setStartDate("");
    setEndDate("");
  };

  const hasFilters =
    search.trim() !== "" ||
    actionFilter !== "ALL" ||
    flagFilter !== "ALL" ||
    userFilter !== "ALL" ||
    startDate !== "" ||
    endDate !== "";

  // ==================================================
  // OPEN DETAILS
  // ==================================================

  const openDetails = (log) => {
    setSelectedLog(log);
  };

  // ==================================================
  // CLOSE DETAILS
  // ==================================================

  const closeDetails = () => {
    setSelectedLog(null);
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
        title="Audit Logs"
        description="Track important changes and actions performed across the system."
        icon={<FaClipboardList />}
      />

      {/* ==================================================
          SUMMARY CARDS
      ================================================== */}

      <div className="row g-4 mb-4">

        {/* TOTAL */}

        <div className="col-md-3">

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
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Total Activity
                  </p>

                  <h2
                    className="mb-1"
                    style={{
                      fontSize: "28px",
                      fontWeight: "700",
                      color: "#0F172A",
                    }}
                  >
                    {logs.length}
                  </h2>

                  <small
                    style={{
                      color: "#64748B",
                    }}
                  >
                    Recorded actions
                  </small>

                </div>

                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "13px",
                    background: "#E0F2FE",
                    color: "#0284C7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaClipboardList size={19} />
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* CREATE */}

        <div className="col-md-3">

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
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Create
                  </p>

                  <h2
                    className="mb-1"
                    style={{
                      fontSize: "28px",
                      fontWeight: "700",
                      color: "#0F172A",
                    }}
                  >
                    {statistics.createCount}
                  </h2>

                  <small
                    style={{
                      color: "#64748B",
                    }}
                  >
                    Creation actions
                  </small>

                </div>

                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "13px",
                    background: "#DCFCE7",
                    color: "#16A34A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaPlus size={17} />
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* UPDATE */}

        <div className="col-md-3">

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
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Updates
                  </p>

                  <h2
                    className="mb-1"
                    style={{
                      fontSize: "28px",
                      fontWeight: "700",
                      color: "#0F172A",
                    }}
                  >
                    {statistics.updateCount}
                  </h2>

                  <small
                    style={{
                      color: "#64748B",
                    }}
                  >
                    Modification actions
                  </small>

                </div>

                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "13px",
                    background: "#DBEAFE",
                    color: "#2563EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaEdit size={18} />
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* DELETE */}

        <div className="col-md-3">

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
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#64748B",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Deletes
                  </p>

                  <h2
                    className="mb-1"
                    style={{
                      fontSize: "28px",
                      fontWeight: "700",
                      color: "#0F172A",
                    }}
                  >
                    {statistics.deleteCount}
                  </h2>

                  <small
                    style={{
                      color: "#64748B",
                    }}
                  >
                    Removal actions
                  </small>

                </div>

                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "13px",
                    background: "#FEE2E2",
                    color: "#DC2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FaTrash size={17} />
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ==================================================
          MAIN AUDIT LOG CARD
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
                System Activity
              </h4>

              <p
                className="mb-0"
                style={{
                  color: "#64748B",
                  fontSize: "13px",
                }}
              >
                Review changes made by users and system processes.
              </p>

            </div>

            <button
              type="button"
              className="btn btn-light"
              onClick={refreshLogs}
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
              FILTERS
          ================================================== */}

          <div
            className="d-flex align-items-center mb-4"
            style={{
              gap: "10px",
              flexWrap: "wrap",
            }}
          >

            {/* SEARCH */}

            <div
              className="d-flex align-items-center"
              style={{
                background: "#F8FAFC",
                border:
                  "1px solid #E2E8F0",
                borderRadius: "10px",
                padding:
                  "0 12px 0 14px",
                height: "44px",
                maxWidth: "350px",
                flex: "1 1 280px",
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
                placeholder="Search activity..."
                style={{
                  border: "none",
                  outline: "none",
                  background:
                    "transparent",
                  marginLeft: "10px",
                  width: "100%",
                  fontSize: "13px",
                  color: "#0F172A",
                }}
              />

              {search && (

                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  style={{
                    border: "none",
                    background:
                      "transparent",
                    color: "#64748B",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  <FaTimes size={12} />
                </button>

              )}

            </div>

            {/* FLAG */}

            <select
              value={flagFilter}
              onChange={(e) =>
                setFlagFilter(
                  e.target.value
                )
              }
              style={{
                height: "44px",
                minWidth: "135px",
                border:
                  "1px solid #E2E8F0",
                borderRadius: "10px",
                background: "#FFFFFF",
                color: "#475569",
                fontSize: "12px",
                fontWeight: "600",
                padding: "0 10px",
                outline: "none",
              }}
            >

              <option value="ALL">
                All Flags
              </option>

              {flagOptions.map(
                (flagId) => (
                  <option
                    key={flagId}
                    value={flagId}
                  >
                    Flag #{flagId}
                  </option>
                )
              )}

            </select>

            {/* USER */}

            <select
              value={userFilter}
              onChange={(e) =>
                setUserFilter(
                  e.target.value
                )
              }
              style={{
                height: "44px",
                minWidth: "170px",
                maxWidth: "220px",
                border:
                  "1px solid #E2E8F0",
                borderRadius: "10px",
                background: "#FFFFFF",
                color: "#475569",
                fontSize: "12px",
                fontWeight: "600",
                padding: "0 10px",
                outline: "none",
              }}
            >

              <option value="ALL">
                All Users
              </option>

              {userOptions.map(
                (user) => (
                  <option
                    key={user}
                    value={user}
                  >
                    {user}
                  </option>
                )
              )}

            </select>

            {/* ACTION */}

            <select
              value={actionFilter}
              onChange={(e) =>
                setActionFilter(
                  e.target.value
                )
              }
              style={{
                height: "44px",
                minWidth: "160px",
                border:
                  "1px solid #E2E8F0",
                borderRadius: "10px",
                background: "#FFFFFF",
                color: "#475569",
                fontSize: "12px",
                fontWeight: "600",
                padding: "0 10px",
                outline: "none",
              }}
            >

              <option value="ALL">
                All Actions
              </option>

              <option value="CREATE_FEATURE">
                Create Feature
              </option>

              <option value="UPDATE_FEATURE">
                Update Feature
              </option>

              <option value="DELETE_FEATURE">
                Delete Feature
              </option>

              <option value="TOGGLE_FEATURE">
                Toggle Feature
              </option>

              <option value="ROLLOUT_CHANGED">
                Rollout Changed
              </option>

              <option value="USER_TARGET_ADDED">
                User Target Added
              </option>

              <option value="USER_TARGET_REMOVED">
                User Target Removed
              </option>

              <option value="GROUP_TARGET_ADDED">
                Group Target Added
              </option>

              <option value="GROUP_TARGET_REMOVED">
                Group Target Removed
              </option>

              <option value="OVERRIDE_CHANGED">
                Override Changed
              </option>

              <option value="RELEASE_STATUS_CHANGED">
                Release Status Changed
              </option>

            </select>

          </div>

          {/* DATE FILTERS */}

          <div
            className="d-flex align-items-center mb-4"
            style={{
              gap: "10px",
              flexWrap: "wrap",
            }}
          >

            <div
              className="d-flex align-items-center"
              style={{
                height: "44px",
                border:
                  "1px solid #E2E8F0",
                borderRadius: "10px",
                background: "#FFFFFF",
                padding:
                  "0 11px",
              }}
            >

              <FaCalendarAlt
                size={12}
                color="#64748B"
                style={{
                  marginRight: "8px",
                }}
              />

              <span
                style={{
                  color: "#64748B",
                  fontSize: "11px",
                  fontWeight: "600",
                  marginRight: "7px",
                }}
              >
                From
              </span>

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(
                    e.target.value
                  )
                }
                style={{
                  border: "none",
                  outline: "none",
                  color: "#475569",
                  fontSize: "12px",
                }}
              />

            </div>

            <div
              className="d-flex align-items-center"
              style={{
                height: "44px",
                border:
                  "1px solid #E2E8F0",
                borderRadius: "10px",
                background: "#FFFFFF",
                padding:
                  "0 11px",
              }}
            >

              <FaCalendarAlt
                size={12}
                color="#64748B"
                style={{
                  marginRight: "8px",
                }}
              />

              <span
                style={{
                  color: "#64748B",
                  fontSize: "11px",
                  fontWeight: "600",
                  marginRight: "7px",
                }}
              >
                To
              </span>

              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) =>
                  setEndDate(
                    e.target.value
                  )
                }
                style={{
                  border: "none",
                  outline: "none",
                  color: "#475569",
                  fontSize: "12px",
                }}
              />

            </div>

            {hasFilters && (

              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-light"
                style={{
                  height: "44px",
                  border:
                    "1px solid #E2E8F0",
                  borderRadius: "10px",
                  color: "#64748B",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                Clear Filters
              </button>

            )}

          </div>

          {/* RESULT COUNT */}

          {!loading && (

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
                {filteredLogs.length}
              </strong>{" "}
              audit records
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
              />

              <p
                className="mt-3 mb-0"
                style={{
                  color: "#64748B",
                  fontSize: "14px",
                }}
              >
                Loading audit logs...
              </p>

            </div>

          ) : filteredLogs.length === 0 ? (

            <div
              className="text-center"
              style={{
                padding: "70px 20px",
                background: "#F8FAFC",
                borderRadius: "12px",
                border:
                  "1px dashed #CBD5E1",
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
                  margin:
                    "0 auto 16px",
                }}
              >
                <FaHistory size={23} />
              </div>

              <h5
                style={{
                  color: "#0F172A",
                  fontWeight: "700",
                  marginBottom: "7px",
                }}
              >
                {hasFilters
                  ? "No matching activity"
                  : "No audit activity yet"}
              </h5>

              <p
                className="mb-3"
                style={{
                  color: "#64748B",
                  fontSize: "13px",
                }}
              >
                {hasFilters
                  ? "Try changing your filters or search."
                  : "Actions performed in the system will appear here."}
              </p>

              {hasFilters && (

                <button
                  type="button"
                  className="btn btn-light btn-sm"
                  onClick={clearFilters}
                  style={{
                    border:
                      "1px solid #CBD5E1",
                    borderRadius: "8px",
                  }}
                >
                  Clear Filters
                </button>

              )}

            </div>

          ) : (

            /* ==================================================
               TABLE
            ================================================== */

            <div className="table-responsive">

              <table
                className="table table-hover align-middle mb-0"
                style={{
                  minWidth: "1180px",
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

                    <th style={headerStyle}>
                      ID
                    </th>

                    <th style={headerStyle}>
                      Time
                    </th>

                    <th style={headerStyle}>
                      User
                    </th>

                    <th style={headerStyle}>
                      Flag
                    </th>

                    <th style={headerStyle}>
                      Action
                    </th>

                    <th style={headerStyle}>
                      Previous Value
                    </th>

                    <th style={headerStyle}>
                      New Value
                    </th>

                    <th style={headerStyle}>
                      Details
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredLogs.map(
                    (log) => {

                      const actionStyle =
                        getActionStyle(
                          log.action
                        );

                      return (

                        <tr
                          key={log.id}
                          style={{
                            borderBottom:
                              "1px solid #F1F5F9",
                          }}
                        >

                          {/* ID */}

                          <td style={cellStyle}>
                            <span
                              style={{
                                color:
                                  "#64748B",
                                fontWeight:
                                  "600",
                              }}
                            >
                              #{log.id}
                            </span>
                          </td>

                          {/* TIME */}

                          <td
                            style={{
                              ...cellStyle,
                              color:
                                "#475569",
                              fontSize:
                                "12px",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {formatDate(
                              log.timestamp
                            )}
                          </td>

                          {/* USER */}

                          <td style={cellStyle}>

                            <div
                              className="d-flex align-items-center"
                              style={{
                                gap: "8px",
                              }}
                            >

                              <div
                                style={{
                                  width:
                                    "30px",
                                  height:
                                    "30px",
                                  borderRadius:
                                    "8px",
                                  background:
                                    "#F1F5F9",
                                  color:
                                    "#64748B",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                }}
                              >
                                <FaUser
                                  size={11}
                                />
                              </div>

                              <span
                                style={{
                                  fontWeight:
                                    "700",
                                  color:
                                    "#0F172A",
                                  fontSize:
                                    "12px",
                                }}
                              >
                                {log.performed_by ||
                                  "System"}
                              </span>

                            </div>

                          </td>

                          {/* FLAG */}

                          <td style={cellStyle}>

                            {log.flag_id ? (

                              <span
                                style={{
                                  display:
                                    "inline-flex",
                                  alignItems:
                                    "center",
                                  gap: "5px",
                                  padding:
                                    "5px 9px",
                                  borderRadius:
                                    "7px",
                                  background:
                                    "#EFF6FF",
                                  color:
                                    "#2563EB",
                                  fontSize:
                                    "11px",
                                  fontWeight:
                                    "700",
                                }}
                              >
                                <FaFlag
                                  size={9}
                                />
                                #{log.flag_id}
                              </span>

                            ) : (

                              <span
                                style={{
                                  color:
                                    "#94A3B8",
                                  fontSize:
                                    "12px",
                                }}
                              >
                                —
                              </span>

                            )}

                          </td>

                          {/* ACTION */}

                          <td style={cellStyle}>

                            <span
                              style={{
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                gap: "6px",
                                padding:
                                  "6px 10px",
                                borderRadius:
                                  "20px",
                                background:
                                  actionStyle.background,
                                color:
                                  actionStyle.color,
                                fontSize:
                                  "10px",
                                fontWeight:
                                  "700",
                                letterSpacing:
                                  "0.3px",
                                whiteSpace:
                                  "nowrap",
                              }}
                            >

                              {actionStyle.icon}

                              {log.action ||
                                "UNKNOWN"}

                            </span>

                          </td>

                          {/* OLD VALUE */}

                          <td
                            style={{
                              ...cellStyle,
                              maxWidth:
                                "220px",
                            }}
                          >

                            {log.old_value ? (

                              <div
                                style={{
                                  background:
                                    "#FEF2F2",
                                  border:
                                    "1px solid #FECACA",
                                  borderRadius:
                                    "7px",
                                  padding:
                                    "7px 9px",
                                  fontSize:
                                    "11px",
                                  color:
                                    "#991B1B",
                                  fontFamily:
                                    "monospace",
                                  wordBreak:
                                    "break-word",
                                  maxHeight:
                                    "55px",
                                  overflow:
                                    "auto",
                                }}
                              >
                                {log.old_value}
                              </div>

                            ) : (

                              <span
                                style={{
                                  color:
                                    "#94A3B8",
                                }}
                              >
                                —
                              </span>

                            )}

                          </td>

                          {/* NEW VALUE */}

                          <td
                            style={{
                              ...cellStyle,
                              maxWidth:
                                "220px",
                            }}
                          >

                            {log.new_value ? (

                              <div
                                style={{
                                  background:
                                    "#F0FDFA",
                                  border:
                                    "1px solid #99F6E4",
                                  borderRadius:
                                    "7px",
                                  padding:
                                    "7px 9px",
                                  fontSize:
                                    "11px",
                                  color:
                                    "#115E59",
                                  fontFamily:
                                    "monospace",
                                  wordBreak:
                                    "break-word",
                                  maxHeight:
                                    "55px",
                                  overflow:
                                    "auto",
                                }}
                              >
                                {log.new_value}
                              </div>

                            ) : (

                              <span
                                style={{
                                  color:
                                    "#94A3B8",
                                }}
                              >
                                —
                              </span>

                            )}

                          </td>

                          {/* DETAILS */}

                          <td style={cellStyle}>

                            <button
                              type="button"
                              onClick={() =>
                                openDetails(log)
                              }
                              className="btn btn-light btn-sm"
                              style={{
                                border:
                                  "1px solid #E2E8F0",
                                borderRadius:
                                  "8px",
                                color:
                                  "#475569",
                                fontSize:
                                  "11px",
                                fontWeight:
                                  "600",
                              }}
                            >
                              <FaEye
                                size={10}
                                style={{
                                  marginRight:
                                    "5px",
                                }}
                              />
                              View
                            </button>

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

      {/* ==================================================
          AUDIT DETAILS MODAL
      ================================================== */}

      {selectedLog && (

        <div
          onClick={closeDetails}
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
            padding: "20px",
          }}
        >

          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width: "100%",
              maxWidth: "720px",
              maxHeight:
                "90vh",
              overflowY:
                "auto",
              background:
                "#FFFFFF",
              borderRadius:
                "16px",
              boxShadow:
                "0 20px 60px rgba(15, 23, 42, 0.20)",
            }}
          >

            {/* MODAL HEADER */}

            <div
              className="d-flex justify-content-between align-items-center"
              style={{
                padding:
                  "20px 24px",
                borderBottom:
                  "1px solid #E2E8F0",
              }}
            >

              <div>

                <h5
                  className="mb-1"
                  style={{
                    fontWeight:
                      "700",
                    color:
                      "#0F172A",
                  }}
                >
                  Audit Record #{selectedLog.id}
                </h5>

                <p
                  className="mb-0"
                  style={{
                    color:
                      "#64748B",
                    fontSize:
                      "12px",
                  }}
                >
                  Detailed change information
                </p>

              </div>

              <button
                type="button"
                onClick={closeDetails}
                style={{
                  width:
                    "34px",
                  height:
                    "34px",
                  borderRadius:
                    "8px",
                  border:
                    "1px solid #E2E8F0",
                  background:
                    "#F8FAFC",
                  color:
                    "#64748B",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  cursor:
                    "pointer",
                }}
              >
                <FaTimes
                  size={13}
                />
              </button>

            </div>

            {/* MODAL BODY */}

            <div
              style={{
                padding:
                  "24px",
              }}
            >

              {/* TOP INFORMATION */}

              <div className="row g-3 mb-4">

                <DetailBox
                  icon={<FaUser />}
                  label="Performed By"
                  value={
                    selectedLog.performed_by ||
                    "System"
                  }
                />

                <DetailBox
                  icon={<FaFlag />}
                  label="Feature Flag"
                  value={
                    selectedLog.flag_id
                      ? `Flag #${selectedLog.flag_id}`
                      : "Not associated"
                  }
                />

                <DetailBox
                  icon={<FaServer />}
                  label="Environment"
                  value={
                    selectedLog.environment_id
                      ? `Environment #${selectedLog.environment_id}`
                      : "Not environment-specific"
                  }
                />

                <DetailBox
                  icon={<FaCalendarAlt />}
                  label="Time"
                  value={formatDate(
                    selectedLog.timestamp
                  )}
                />

              </div>

              {/* ACTION */}

              <div
                style={{
                  marginBottom:
                    "20px",
                }}
              >

                <p
                  style={{
                    marginBottom:
                      "8px",
                    fontSize:
                      "11px",
                    fontWeight:
                      "700",
                    color:
                      "#64748B",
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.5px",
                  }}
                >
                  Action
                </p>

                <div
                  style={{
                    background:
                      "#F8FAFC",
                    border:
                      "1px solid #E2E8F0",
                    borderRadius:
                      "10px",
                    padding:
                      "12px 14px",
                  }}
                >

                  <span
                    style={{
                      fontWeight:
                        "700",
                      color:
                        "#334155",
                      fontSize:
                        "13px",
                    }}
                  >
                    {selectedLog.action ||
                      "UNKNOWN"}
                  </span>

                </div>

              </div>

              {/* OLD STATE */}

              <div
                style={{
                  marginBottom:
                    "20px",
                }}
              >

                <p
                  style={{
                    marginBottom:
                      "8px",
                    fontSize:
                      "11px",
                    fontWeight:
                      "700",
                    color:
                      "#64748B",
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.5px",
                  }}
                >
                  Old State
                </p>

                <div
                  style={{
                    minHeight:
                      "70px",
                    background:
                      "#FEF2F2",
                    border:
                      "1px solid #FECACA",
                    borderRadius:
                      "10px",
                    padding:
                      "12px 14px",
                    color:
                      "#991B1B",
                    fontFamily:
                      "monospace",
                    fontSize:
                      "12px",
                    whiteSpace:
                      "pre-wrap",
                    wordBreak:
                      "break-word",
                  }}
                >
                  {selectedLog.old_value ||
                    "No previous state recorded"}
                </div>

              </div>

              {/* NEW STATE */}

              <div>

                <p
                  style={{
                    marginBottom:
                      "8px",
                    fontSize:
                      "11px",
                    fontWeight:
                      "700",
                    color:
                      "#64748B",
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.5px",
                  }}
                >
                  New State
                </p>

                <div
                  style={{
                    minHeight:
                      "70px",
                    background:
                      "#F0FDFA",
                    border:
                      "1px solid #99F6E4",
                    borderRadius:
                      "10px",
                    padding:
                      "12px 14px",
                    color:
                      "#115E59",
                    fontFamily:
                      "monospace",
                    fontSize:
                      "12px",
                    whiteSpace:
                      "pre-wrap",
                    wordBreak:
                      "break-word",
                  }}
                >
                  {selectedLog.new_value ||
                    "No new state recorded"}
                </div>

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div
              className="d-flex justify-content-end"
              style={{
                padding:
                  "16px 24px",
                borderTop:
                  "1px solid #E2E8F0",
              }}
            >

              <button
                type="button"
                onClick={closeDetails}
                className="btn btn-light"
                style={{
                  border:
                    "1px solid #E2E8F0",
                  borderRadius:
                    "9px",
                  fontSize:
                    "12px",
                  fontWeight:
                    "600",
                  color:
                    "#475569",
                }}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

// ==================================================
// SHARED STYLES
// ==================================================

const headerStyle = {
  padding: "14px 12px",
  color: "#64748B",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  fontWeight: "700",
};

const cellStyle = {
  padding: "15px 12px",
};

function DetailBox({
  icon,
  label,
  value,
}) {
  return (
    <div className="col-md-6">

      <div
        style={{
          background:
            "#F8FAFC",
          border:
            "1px solid #E2E8F0",
          borderRadius:
            "10px",
          padding:
            "12px 14px",
        }}
      >

        <div
          className="d-flex align-items-center"
          style={{
            gap: "7px",
            marginBottom:
              "6px",
          }}
        >

          <span
            style={{
              color:
                "#64748B",
              fontSize:
                "11px",
            }}
          >
            {icon}
          </span>

          <span
            style={{
              color:
                "#64748B",
              fontSize:
                "10px",
              fontWeight:
                "700",
              textTransform:
                "uppercase",
              letterSpacing:
                "0.4px",
            }}
          >
            {label}
          </span>

        </div>

        <div
          style={{
            color:
              "#0F172A",
            fontSize:
              "12px",
            fontWeight:
              "700",
            wordBreak:
              "break-word",
          }}
        >
          {value}
        </div>

      </div>

    </div>
  );
}

export default AuditLogs;