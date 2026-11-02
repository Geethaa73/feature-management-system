import { useEffect, useState } from "react";
import api from "../services/api";
import { error, success } from "../utils/toast";

import PageHeader from "../components/PageHeader";

import {
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaPlay,
  FaCode,
  FaUser,
  FaLayerGroup,
} from "react-icons/fa";

function Evaluate() {
  const [featureName, setFeatureName] = useState("");
  const [userId, setUserId] = useState("");
  const [environment, setEnvironment] = useState("");

  const [environments, setEnvironments] = useState([]);
  const [loadingEnvironments, setLoadingEnvironments] = useState(false);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ==================================================
  // LOAD ENVIRONMENTS
  // ==================================================

  useEffect(() => {
    loadEnvironments();
  }, []);

  const loadEnvironments = async () => {
    try {
      setLoadingEnvironments(true);

      const response = await api.get("/environments/");

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setEnvironments(data);

      // Select the first environment automatically
      if (data.length > 0) {
        setEnvironment(data[0].name);
      }
    } catch (err) {
      console.error(
        "Environment loading error:",
        err.response?.data || err
      );

      error("Failed to load environments");
    } finally {
      setLoadingEnvironments(false);
    }
  };

  // ==================================================
  // EVALUATE FEATURE
  // ==================================================

  const evaluateFeature = async () => {
    if (!featureName.trim()) {
      error("Please enter a feature key");
      return;
    }

    if (!userId.trim()) {
      error("Please enter a user ID");
      return;
    }

    if (Number(userId) <= 0) {
      error("User ID must be a valid positive number");
      return;
    }

    if (!environment) {
      error("Please select an environment");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const response = await api.post("/flags/evaluate", {
        flag_key: featureName.trim(),
        environment: environment,
        user_id: userId.trim(),
        groups: [],
      });

      console.log(
        "Enhanced evaluation response:",
        response.data
      );

      setResult(response.data);

      success("Feature evaluated successfully");
    } catch (err) {
      console.error(
        "Evaluation error:",
        err.response?.data || err
      );

      const message =
        err.response?.data?.detail ||
        "Feature evaluation failed";

      error(message);

      setResult({
        error: message,
      });
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // RESET
  // ==================================================

  const resetEvaluation = () => {
    setFeatureName("");
    setUserId("");

    if (environments.length > 0) {
      setEnvironment(environments[0].name);
    } else {
      setEnvironment("");
    }

    setResult(null);
  };

  // ==================================================
  // ENTER KEY
  // ==================================================

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      evaluateFeature();
    }
  };

  // ==================================================
  // ENVIRONMENT LABEL
  // ==================================================

  const getEnvironmentName = (environmentItem) => {
    if (typeof environmentItem === "string") {
      return environmentItem;
    }

    return environmentItem?.name || "";
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
        title="Feature Evaluation"
        description="Evaluate whether a feature is enabled for a specific user and environment."
        icon={<FaSearch />}
      />

      {/* ==================================================
          MAIN CARD
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

          <div className="mb-4">
            <h4
              className="mb-1"
              style={{
                fontSize: "19px",
                fontWeight: "700",
                color: "#0F172A",
              }}
            >
              Evaluate Feature Flag
            </h4>

            <p
              className="mb-0"
              style={{
                color: "#64748B",
                fontSize: "13px",
              }}
            >
              Enter the feature and user details, then select
              the environment to determine the current flag state.
            </p>
          </div>

          {/* ==================================================
              INPUTS
          ================================================== */}

          <div className="row g-4">

            {/* FEATURE KEY */}

            <div className="col-md-4">
              <label
                className="form-label"
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#334155",
                }}
              >
                Feature Key
              </label>

              <div
                className="d-flex align-items-center"
                style={{
                  height: "46px",
                  background: "#FFFFFF",
                  border:
                    "1px solid #CBD5E1",
                  borderRadius: "10px",
                  padding: "0 13px",
                }}
              >
                <FaCode
                  size={13}
                  color="#64748B"
                />

                <input
                  type="text"
                  value={featureName}
                  onChange={(e) =>
                    setFeatureName(e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Example: dark_mode"
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
              </div>

              <small
                style={{
                  color: "#94A3B8",
                  fontSize: "11px",
                }}
              >
                Enter the exact feature flag key.
              </small>
            </div>

            {/* USER ID */}

            <div className="col-md-4">
              <label
                className="form-label"
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#334155",
                }}
              >
                User ID
              </label>

              <div
                className="d-flex align-items-center"
                style={{
                  height: "46px",
                  background: "#FFFFFF",
                  border:
                    "1px solid #CBD5E1",
                  borderRadius: "10px",
                  padding: "0 13px",
                }}
              >
                <FaUser
                  size={13}
                  color="#64748B"
                />

                <input
                  type="number"
                  min="1"
                  value={userId}
                  onChange={(e) =>
                    setUserId(e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Example: 101"
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
              </div>

              <small
                style={{
                  color: "#94A3B8",
                  fontSize: "11px",
                }}
              >
                ID of the user being evaluated.
              </small>
            </div>

            {/* ENVIRONMENT */}

            <div className="col-md-4">
              <label
                className="form-label"
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#334155",
                }}
              >
                Environment
              </label>

              <div
                className="d-flex align-items-center"
                style={{
                  height: "46px",
                  background: "#FFFFFF",
                  border:
                    "1px solid #CBD5E1",
                  borderRadius: "10px",
                  padding: "0 13px",
                }}
              >
                <FaLayerGroup
                  size={13}
                  color="#64748B"
                />

                <select
                  value={environment}
                  onChange={(e) =>
                    setEnvironment(e.target.value)
                  }
                  disabled={
                    loadingEnvironments ||
                    environments.length === 0
                  }
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    marginLeft: "10px",
                    width: "100%",
                    fontSize: "13px",
                    color: "#0F172A",
                    cursor: "pointer",
                  }}
                >
                  {loadingEnvironments ? (
                    <option value="">
                      Loading environments...
                    </option>
                  ) : environments.length === 0 ? (
                    <option value="">
                      No environments available
                    </option>
                  ) : (
                    environments.map((item) => {
                      const name =
                        getEnvironmentName(item);

                      return (
                        <option
                          key={
                            item?.id ??
                            name
                          }
                          value={name}
                        >
                          {name}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              <small
                style={{
                  color: "#94A3B8",
                  fontSize: "11px",
                }}
              >
                Select the environment to evaluate.
              </small>
            </div>
          </div>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div
            className="d-flex align-items-center mt-4"
            style={{
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={evaluateFeature}
              disabled={
                loading ||
                loadingEnvironments ||
                environments.length === 0
              }
              className="btn"
              style={{
                background: "#14B8A6",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "9px",
                padding: "10px 17px",
                fontSize: "13px",
                fontWeight: "700",
              }}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    style={{
                      marginRight: "8px",
                    }}
                  />

                  Evaluating...
                </>
              ) : (
                <>
                  <FaPlay
                    size={10}
                    style={{
                      marginRight: "8px",
                    }}
                  />

                  Evaluate Feature
                </>
              )}
            </button>

            <button
              type="button"
              onClick={resetEvaluation}
              disabled={loading}
              className="btn btn-light"
              style={{
                border: "1px solid #E2E8F0",
                borderRadius: "9px",
                padding: "10px 16px",
                fontSize: "13px",
                fontWeight: "600",
                color: "#475569",
              }}
            >
              Reset
            </button>
          </div>

          {/* ==================================================
              RESULT
          ================================================== */}

          {result && (
            <div className="mt-5">
              <div
                style={{
                  borderTop: "1px solid #E2E8F0",
                  paddingTop: "24px",
                }}
              >
                <div
                  className="d-flex justify-content-between align-items-center mb-3"
                  style={{
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div>
                    <h5
                      className="mb-1"
                      style={{
                        fontSize: "17px",
                        fontWeight: "700",
                        color: "#0F172A",
                      }}
                    >
                      Evaluation Result
                    </h5>

                    <p
                      className="mb-0"
                      style={{
                        color: "#64748B",
                        fontSize: "12px",
                      }}
                    >
                      Result returned by the enhanced feature
                      evaluation engine.
                    </p>
                  </div>
                </div>

                {/* ==================================================
                    ERROR
                ================================================== */}

                {result.error ? (
                  <div
                    style={{
                      background: "#FEF2F2",
                      border: "1px solid #FECACA",
                      borderRadius: "12px",
                      padding: "18px",
                    }}
                  >
                    <div
                      className="d-flex align-items-center"
                      style={{
                        gap: "10px",
                      }}
                    >
                      <FaTimesCircle
                        color="#DC2626"
                        size={20}
                      />

                      <div>
                        <div
                          style={{
                            fontWeight: "700",
                            color: "#991B1B",
                            fontSize: "14px",
                          }}
                        >
                          Evaluation Failed
                        </div>

                        <div
                          style={{
                            color: "#B91C1C",
                            fontSize: "12px",
                            marginTop: "3px",
                          }}
                        >
                          {result.error}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      background: result.enabled
                        ? "#F0FDFA"
                        : "#FFFBEB",

                      border: result.enabled
                        ? "1px solid #99F6E4"
                        : "1px solid #FDE68A",

                      borderRadius: "12px",
                      padding: "20px",
                    }}
                  >

                    {/* ==================================================
                        STATUS
                    ================================================== */}

                    <div
                      className="d-flex align-items-center mb-4"
                      style={{
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "13px",
                          background: result.enabled
                            ? "#CCFBF1"
                            : "#FEF3C7",

                          color: result.enabled
                            ? "#0F766E"
                            : "#B45309",

                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {result.enabled ? (
                          <FaCheckCircle size={23} />
                        ) : (
                          <FaTimesCircle size={23} />
                        )}
                      </div>

                      <div>
                        <h5
                          className="mb-1"
                          style={{
                            fontSize: "17px",
                            fontWeight: "700",
                            color: result.enabled
                              ? "#115E59"
                              : "#92400E",
                          }}
                        >
                          {result.enabled
                            ? "Feature Enabled"
                            : "Feature Disabled"}
                        </h5>

                        <p
                          className="mb-0"
                          style={{
                            fontSize: "12px",
                            color: result.enabled
                              ? "#0F766E"
                              : "#B45309",
                          }}
                        >
                          The evaluation engine has returned
                          the current feature state.
                        </p>
                      </div>
                    </div>

                    {/* ==================================================
                        DETAILS
                    ================================================== */}

                    <div className="row g-3">

                      {/* FEATURE */}

                      <div className="col-md-6">
                        <div
                          style={{
                            background: "#FFFFFF",
                            border:
                              "1px solid #E2E8F0",
                            borderRadius: "9px",
                            padding: "13px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "10px",
                              color: "#64748B",
                              textTransform:
                                "uppercase",
                              fontWeight: "700",
                              letterSpacing:
                                "0.5px",
                              marginBottom: "5px",
                            }}
                          >
                            Feature
                          </div>

                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: "700",
                              color: "#0F172A",
                              wordBreak:
                                "break-word",
                            }}
                          >
                            {result.flag_key ||
                              featureName}
                          </div>
                        </div>
                      </div>

                      {/* ENVIRONMENT */}

                      <div className="col-md-6">
                        <div
                          style={{
                            background: "#FFFFFF",
                            border:
                              "1px solid #E2E8F0",
                            borderRadius: "9px",
                            padding: "13px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "10px",
                              color: "#64748B",
                              textTransform:
                                "uppercase",
                              fontWeight: "700",
                              letterSpacing:
                                "0.5px",
                              marginBottom: "5px",
                            }}
                          >
                            Environment
                          </div>

                          <div
                            className="d-flex align-items-center"
                            style={{
                              gap: "7px",
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#334155",
                            }}
                          >
                            <FaLayerGroup
                              size={12}
                              color="#64748B"
                            />

                            {environment}
                          </div>
                        </div>
                      </div>

                      {/* USER ID */}

                      <div className="col-md-6">
                        <div
                          style={{
                            background: "#FFFFFF",
                            border:
                              "1px solid #E2E8F0",
                            borderRadius: "9px",
                            padding: "13px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "10px",
                              color: "#64748B",
                              textTransform:
                                "uppercase",
                              fontWeight: "700",
                              letterSpacing:
                                "0.5px",
                              marginBottom: "5px",
                            }}
                          >
                            User ID
                          </div>

                          <div
                            className="d-flex align-items-center"
                            style={{
                              gap: "7px",
                              fontSize: "13px",
                              fontWeight: "700",
                              color: "#0F172A",
                            }}
                          >
                            <FaUser
                              size={12}
                              color="#64748B"
                            />

                            {userId}
                          </div>
                        </div>
                      </div>

                      {/* REASON */}

                      <div className="col-md-6">
                        <div
                          style={{
                            background: "#FFFFFF",
                            border:
                              "1px solid #E2E8F0",
                            borderRadius: "9px",
                            padding: "13px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "10px",
                              color: "#64748B",
                              textTransform:
                                "uppercase",
                              fontWeight: "700",
                              letterSpacing:
                                "0.5px",
                              marginBottom: "5px",
                            }}
                          >
                            Evaluation Reason
                          </div>

                          <div
                            className="d-flex align-items-center"
                            style={{
                              gap: "7px",
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#334155",
                            }}
                          >
                            <FaInfoCircle
                              size={12}
                              color="#64748B"
                            />

                            {result.reason ||
                              "No reason provided"}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================
          REDIS / EVALUATION INFORMATION
      ================================================== */}

      <div
        className="card border-0 mt-4"
        style={{
          borderRadius: "16px",
          background: "#F8FAFC",
          border: "1px solid #E2E8F0",
        }}
      >
        <div className="card-body p-4">

          <div
            className="d-flex align-items-start"
            style={{
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#CCFBF1",
                color: "#0F766E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FaInfoCircle size={16} />
            </div>

            <div>
              <h6
                className="mb-2"
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#0F172A",
                }}
              >
                How evaluation works
              </h6>

              <p
                className="mb-2"
                style={{
                  fontSize: "12px",
                  lineHeight: "1.7",
                  color: "#64748B",
                }}
              >
                The system evaluates the selected feature
                against the specified user and environment.
                Environment overrides, feature state,
                targeting rules, group membership, and
                percentage rollout settings can influence
                the final result.
              </p>

              <p
                className="mb-2"
                style={{
                  fontSize: "12px",
                  lineHeight: "1.7",
                  color: "#64748B",
                }}
              >
                Evaluation results are cached in Redis using
                the feature key, user ID, and environment as
                the cache key. Repeated evaluations can
                therefore be served directly from the cache
                until the cache entry expires or is invalidated
                by a feature configuration change.
              </p>

              <p
                className="mb-0"
                style={{
                  fontSize: "12px",
                  lineHeight: "1.7",
                  color: "#64748B",
                }}
              >
                Cache entries are invalidated when relevant
                feature configuration changes are made,
                helping prevent stale evaluation results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Evaluate;