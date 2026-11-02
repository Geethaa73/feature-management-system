import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { success, error } from "../utils/toast";

import PageHeader from "../components/PageHeader";

import {
  MdSettings,
  MdAdd,
  MdDelete,
  MdCheckCircle,
  MdCancel,
  MdRefresh,
  MdFlag,
  MdPublic,
} from "react-icons/md";

function Overrides() {
  const [overrides, setOverrides] = useState([]);
  const [features, setFeatures] = useState([]);
  const [environments, setEnvironments] = useState([]);

  const [featureId, setFeatureId] = useState("");
  const [environmentId, setEnvironmentId] = useState("");
  const [value, setValue] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // --------------------------------------------------
  // LOAD ALL DATA
  // --------------------------------------------------

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        overrideResponse,
        featureResponse,
        environmentResponse,
      ] = await Promise.all([
        api.get("/overrides/"),
        api.get("/feature-flags/"),
        api.get("/environments/"),
      ]);

      setOverrides(
        Array.isArray(overrideResponse.data)
          ? overrideResponse.data
          : []
      );

      setFeatures(
        Array.isArray(featureResponse.data)
          ? featureResponse.data
          : []
      );

      setEnvironments(
        Array.isArray(environmentResponse.data)
          ? environmentResponse.data
          : []
      );
    } catch (err) {
      console.error(
        "Override loading error:",
        err.response?.data || err
      );

      error(
        err.response?.data?.detail ||
          "Failed to load override data"
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    loadData();
  }, []);

  // --------------------------------------------------
  // REFRESH
  // --------------------------------------------------

  const refreshData = async () => {
    try {
      setRefreshing(true);

      await loadData();

      success("Override data refreshed successfully");
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const getFeatureName = (id) => {
    const feature = features.find(
      (item) => Number(item.id) === Number(id)
    );

    return feature?.key || `Feature #${id}`;
  };

  const getEnvironmentName = (id) => {
    const environment = environments.find(
      (item) => Number(item.id) === Number(id)
    );

    return environment?.name || `Environment #${id}`;
  };

  // --------------------------------------------------
  // STATISTICS
  // --------------------------------------------------

  const activeOverrides = useMemo(
    () =>
      overrides.filter(
        (item) => item.value === true
      ).length,
    [overrides]
  );

  const disabledOverrides = useMemo(
    () =>
      overrides.filter(
        (item) => item.value === false
      ).length,
    [overrides]
  );

  // --------------------------------------------------
  // ADD OVERRIDE
  // --------------------------------------------------

  const addOverride = async () => {
    if (!featureId || !environmentId) {
      error(
        "Please select both a feature and an environment"
      );
      return;
    }

    // Prevent duplicate feature/environment override
    const duplicate = overrides.some(
      (item) =>
        Number(item.flag_id) === Number(featureId) &&
        Number(item.environment_id) ===
          Number(environmentId)
    );

    if (duplicate) {
      error(
        "An override already exists for this feature and environment."
      );
      return;
    }

    const overrideData = {
      flag_id: Number(featureId),
      environment_id: Number(environmentId),
      value: value,
    };

    try {
      setSaving(true);

      await api.post(
        "/overrides/",
        overrideData
      );

      success(
        "Environment override created successfully"
      );

      setFeatureId("");
      setEnvironmentId("");
      setValue(true);

      await loadData();
    } catch (err) {
      console.error(
        "Override creation error:",
        err.response?.data || err
      );

      error(
        err.response?.data?.detail ||
          "Failed to create override"
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE OVERRIDE
  // --------------------------------------------------

  const deleteOverride = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this override?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      await api.delete(
        `/overrides/${id}`
      );

      success(
        "Override deleted successfully"
      );

      await loadData();
    } catch (err) {
      console.error(
        "Override deletion error:",
        err.response?.data || err
      );

      error(
        err.response?.data?.detail ||
          "Failed to delete override"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div>

      {/* ============================================ */}
      {/* PAGE HEADER */}
      {/* ============================================ */}

      <PageHeader
        title="Environment Overrides"
        description="Control feature behavior for specific deployment environments."
        icon={<MdSettings />}
      />

      {/* ============================================ */}
      {/* SUMMARY CARDS */}
      {/* ============================================ */}

      <div className="row g-4 mb-4">

        {/* Total */}
        <div className="col-md-4">

          <div
            className="card border-0 shadow-sm h-100"
            style={{
              borderRadius: "16px",
            }}
          >

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small
                    className="text-muted"
                    style={{
                      fontWeight: "600",
                    }}
                  >
                    TOTAL OVERRIDES
                  </small>

                  <h2
                    className="mt-2 mb-0"
                    style={{
                      fontWeight: "700",
                      color: "#0F172A",
                    }}
                  >
                    {overrides.length}
                  </h2>

                </div>

                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "14px",
                    background: "#E0F2FE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MdSettings
                    size={28}
                    color="#0284C7"
                  />
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Enabled */}
        <div className="col-md-4">

          <div
            className="card border-0 shadow-sm h-100"
            style={{
              borderRadius: "16px",
            }}
          >

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small
                    className="text-muted"
                    style={{
                      fontWeight: "600",
                    }}
                  >
                    ENABLED OVERRIDES
                  </small>

                  <h2
                    className="mt-2 mb-0"
                    style={{
                      fontWeight: "700",
                      color: "#16A34A",
                    }}
                  >
                    {activeOverrides}
                  </h2>

                </div>

                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "14px",
                    background: "#DCFCE7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MdCheckCircle
                    size={28}
                    color="#16A34A"
                  />
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Disabled */}
        <div className="col-md-4">

          <div
            className="card border-0 shadow-sm h-100"
            style={{
              borderRadius: "16px",
            }}
          >

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <small
                    className="text-muted"
                    style={{
                      fontWeight: "600",
                    }}
                  >
                    DISABLED OVERRIDES
                  </small>

                  <h2
                    className="mt-2 mb-0"
                    style={{
                      fontWeight: "700",
                      color: "#64748B",
                    }}
                  >
                    {disabledOverrides}
                  </h2>

                </div>

                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "14px",
                    background: "#F1F5F9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MdCancel
                    size={28}
                    color="#64748B"
                  />
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ============================================ */}
      {/* CREATE OVERRIDE */}
      {/* ============================================ */}

      <div
        className="card border-0 shadow-sm mb-4"
        style={{
          borderRadius: "16px",
        }}
      >

        <div className="card-body p-4">

          <div className="d-flex align-items-center mb-4">

            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "#CCFBF1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "12px",
              }}
            >
              <MdAdd
                size={24}
                color="#0F766E"
              />
            </div>

            <div>

              <h4
                className="mb-1"
                style={{
                  fontWeight: "700",
                }}
              >
                Add Override
              </h4>

              <small className="text-muted">
                Define a feature value for a specific environment.
              </small>

            </div>

          </div>

          <div className="row g-3">

            {/* FEATURE */}
            <div className="col-md-4">

              <label className="form-label fw-semibold">
                Feature
              </label>

              <div className="position-relative">

                <MdFlag
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "12px",
                    color: "#64748B",
                    zIndex: 2,
                  }}
                />

                <select
                  className="form-select"
                  value={featureId}
                  onChange={(e) =>
                    setFeatureId(e.target.value)
                  }
                  style={{
                    paddingLeft: "38px",
                    borderRadius: "10px",
                    height: "45px",
                  }}
                  disabled={
                    loading ||
                    saving ||
                    refreshing
                  }
                >

                  <option value="">
                    Select Feature
                  </option>

                  {features.map(
                    (feature) => (
                      <option
                        key={feature.id}
                        value={feature.id}
                      >
                        {feature.key}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

            {/* ENVIRONMENT */}
            <div className="col-md-4">

              <label className="form-label fw-semibold">
                Environment
              </label>

              <div className="position-relative">

                <MdPublic
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "12px",
                    color: "#64748B",
                    zIndex: 2,
                  }}
                />

                <select
                  className="form-select"
                  value={environmentId}
                  onChange={(e) =>
                    setEnvironmentId(
                      e.target.value
                    )
                  }
                  style={{
                    paddingLeft: "38px",
                    borderRadius: "10px",
                    height: "45px",
                  }}
                  disabled={
                    loading ||
                    saving ||
                    refreshing
                  }
                >

                  <option value="">
                    Select Environment
                  </option>

                  {environments.map(
                    (environment) => (
                      <option
                        key={environment.id}
                        value={environment.id}
                      >
                        {environment.name}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

            {/* VALUE */}
            <div className="col-md-2">

              <label className="form-label fw-semibold">
                Override Value
              </label>

              <select
                className="form-select"
                value={
                  value
                    ? "true"
                    : "false"
                }
                onChange={(e) =>
                  setValue(
                    e.target.value ===
                      "true"
                  )
                }
                style={{
                  borderRadius: "10px",
                  height: "45px",
                }}
                disabled={
                  loading ||
                  saving ||
                  refreshing
                }
              >

                <option value="true">
                  Enabled
                </option>

                <option value="false">
                  Disabled
                </option>

              </select>

            </div>

            {/* ADD BUTTON */}
            <div className="col-md-2 d-flex align-items-end">

              <button
                className="btn w-100"
                onClick={addOverride}
                disabled={
                  loading ||
                  saving ||
                  refreshing ||
                  !featureId ||
                  !environmentId
                }
                style={{
                  height: "45px",
                  background: "#14B8A6",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "600",
                }}
              >

                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Adding...
                  </>
                ) : (
                  <>
                    <MdAdd
                      size={20}
                      className="me-1"
                    />
                    Add
                  </>
                )}

              </button>

            </div>

          </div>

        </div>

      </div>

      {/* ============================================ */}
      {/* OVERRIDE LIST */}
      {/* ============================================ */}

      <div
        className="card border-0 shadow-sm"
        style={{
          borderRadius: "16px",
        }}
      >

        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-center mb-4">

            <div>

              <h4
                className="mb-1"
                style={{
                  fontWeight: "700",
                }}
              >
                Override List
              </h4>

              <small className="text-muted">
                Environment-specific feature configurations
              </small>

            </div>

            <button
              className="btn btn-light"
              onClick={refreshData}
              disabled={
                loading ||
                saving ||
                refreshing
              }
              style={{
                borderRadius: "10px",
                border:
                  "1px solid #E2E8F0",
                minWidth: "105px",
              }}
            >

              {refreshing ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Refreshing
                </>
              ) : (
                <>
                  <MdRefresh
                    size={20}
                    className="me-1"
                  />
                  Refresh
                </>
              )}

            </button>

          </div>

          {/* ======================================== */}
          {/* LOADING */}
          {/* ======================================== */}

          {loading ? (

            <div
              className="text-center py-5"
              style={{
                color: "#64748B",
              }}
            >

              <div
                className="spinner-border"
                style={{
                  color: "#14B8A6",
                }}
              />

              <p className="mt-3 mb-0">
                Loading environment overrides...
              </p>

            </div>

          ) : overrides.length === 0 ? (

            /* ====================================== */
            /* EMPTY STATE */
            /* ====================================== */

            <div
              className="text-center py-5 px-3"
              style={{
                background: "#F8FAFC",
                borderRadius: "14px",
              }}
            >

              <MdSettings
                size={55}
                color="#94A3B8"
              />

              <h5
                className="mt-3"
                style={{
                  fontWeight: "700",
                  color: "#334155",
                }}
              >
                No overrides found
              </h5>

              <p className="text-muted mb-0">
                Create an environment override above
                to customize feature behavior.
              </p>

            </div>

          ) : (

            /* ====================================== */
            /* TABLE */
            /* ====================================== */

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>

                  <tr
                    style={{
                      background: "#F8FAFC",
                    }}
                  >

                    <th
                      style={{
                        padding: "14px",
                      }}
                    >
                      ID
                    </th>

                    <th
                      style={{
                        padding: "14px",
                      }}
                    >
                      Feature
                    </th>

                    <th
                      style={{
                        padding: "14px",
                      }}
                    >
                      Environment
                    </th>

                    <th
                      style={{
                        padding: "14px",
                      }}
                    >
                      Override
                    </th>

                    <th
                      className="text-end"
                      style={{
                        padding: "14px",
                      }}
                    >
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {overrides.map(
                    (item) => (
                      <tr key={item.id}>

                        {/* ID */}
                        <td
                          style={{
                            padding: "16px 14px",
                            color: "#64748B",
                          }}
                        >
                          #{item.id}
                        </td>

                        {/* FEATURE */}
                        <td
                          style={{
                            padding: "16px 14px",
                          }}
                        >

                          <div className="d-flex align-items-center">

                            <div
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "10px",
                                background: "#CCFBF1",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: "10px",
                              }}
                            >

                              <MdFlag
                                color="#0F766E"
                                size={20}
                              />

                            </div>

                            <div>

                              <strong>
                                {getFeatureName(
                                  item.flag_id
                                )}
                              </strong>

                              <div>
                                <small
                                  className="text-muted"
                                >
                                  Feature ID:{" "}
                                  {item.flag_id}
                                </small>
                              </div>

                            </div>

                          </div>

                        </td>

                        {/* ENVIRONMENT */}
                        <td
                          style={{
                            padding: "16px 14px",
                          }}
                        >

                          <div className="d-flex align-items-center">

                            <MdPublic
                              size={20}
                              color="#64748B"
                              className="me-2"
                            />

                            <div>

                              <div>
                                {getEnvironmentName(
                                  item.environment_id
                                )}
                              </div>

                              <small
                                className="text-muted"
                              >
                                Environment ID:{" "}
                                {item.environment_id}
                              </small>

                            </div>

                          </div>

                        </td>

                        {/* VALUE */}
                        <td
                          style={{
                            padding: "16px 14px",
                          }}
                        >

                          {item.value ? (

                            <span
                              className="badge d-inline-flex align-items-center"
                              style={{
                                background:
                                  "#DCFCE7",
                                color:
                                  "#15803D",
                                padding:
                                  "8px 12px",
                                borderRadius:
                                  "20px",
                                fontWeight:
                                  "600",
                              }}
                            >

                              <MdCheckCircle
                                size={16}
                                className="me-1"
                              />

                              Enabled

                            </span>

                          ) : (

                            <span
                              className="badge d-inline-flex align-items-center"
                              style={{
                                background:
                                  "#F1F5F9",
                                color:
                                  "#64748B",
                                padding:
                                  "8px 12px",
                                borderRadius:
                                  "20px",
                                fontWeight:
                                  "600",
                              }}
                            >

                              <MdCancel
                                size={16}
                                className="me-1"
                              />

                              Disabled

                            </span>

                          )}

                        </td>

                        {/* DELETE */}
                        <td
                          className="text-end"
                          style={{
                            padding: "16px 14px",
                          }}
                        >

                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() =>
                              deleteOverride(
                                item.id
                              )
                            }
                            disabled={
                              deletingId ===
                              item.id ||
                              saving ||
                              refreshing
                            }
                            style={{
                              borderRadius: "8px",
                              minWidth: "85px",
                            }}
                          >

                            {deletingId ===
                            item.id ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-1"
                                  role="status"
                                  aria-hidden="true"
                                />

                                Deleting...
                              </>
                            ) : (
                              <>
                                <MdDelete
                                  size={18}
                                  className="me-1"
                                />

                                Delete
                              </>
                            )}

                          </button>

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

export default Overrides;