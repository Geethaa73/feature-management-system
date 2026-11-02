
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import api from "../services/api";
import { success, error } from "../utils/toast";

import {
  MdFlag,
  MdAdd,
  MdDelete,
  MdToggleOn,
  MdToggleOff,
  MdCheckCircle,
  MdCancel,
  MdRocketLaunch,
  MdSave,
  MdSecurity,
  MdPlayArrow,
  MdPublish,
  MdBlock,
} from "react-icons/md";

function Features() {
  const { t } = useTranslation();

  const [features, setFeatures] = useState([]);

  const initialForm = {
    key: "",
    description: "",
    type: "boolean",
    enabled: true,
    default_value: false,
    owner_team: "",
    rollout_percentage: 100,
    target_group_id: null,
  };

  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(false);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [rolloutValues, setRolloutValues] = useState({});
  const [savingRolloutId, setSavingRolloutId] = useState(null);
  const [changingReleaseId, setChangingReleaseId] = useState(null);

  const isAdmin = !!currentUserRole;

  const canControlRelease = !!currentUserRole;

  // -----------------------------------------
  // LOAD CURRENT USER
  // -----------------------------------------

  const loadCurrentUser = async () => {
    try {
      setLoadingUser(true);

      const response = await api.get("/users/me");

      setCurrentUserRole(response.data.role);
    } catch (err) {
      console.error(
        "Load current user error:",
        err.response?.data || err
      );

      setCurrentUserRole(null);
    } finally {
      setLoadingUser(false);
    }
  };

  // -----------------------------------------
  // LOAD FEATURES
  // -----------------------------------------

  const loadFeatures = async () => {
    try {
      setLoadingFeatures(true);

      const response = await api.get("/feature-flags/");

      const featureList = Array.isArray(response.data)
        ? response.data
        : response.data?.items || [];

      setFeatures(featureList);

      const rolloutMap = {};

      featureList.forEach((feature) => {
        rolloutMap[feature.id] =
          feature.rollout_percentage ?? 100;
      });

      setRolloutValues(rolloutMap);
    } catch (err) {
      console.error(
        "Load features error:",
        err.response?.data || err
      );

      error(
        err.response?.data?.detail ||
          "Failed to load features"
      );
    } finally {
      setLoadingFeatures(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
    loadFeatures();
  }, []);

  // -----------------------------------------
  // FORM CHANGE
  // -----------------------------------------

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // -----------------------------------------
  // CREATE FEATURE
  // -----------------------------------------

  const addFeature = async (e) => {
    e.preventDefault();

    const featureKey = form.key.trim();

    if (!featureKey) {
      error("Please enter a feature key");
      return;
    }

    if (!form.owner_team.trim()) {
      error("Please enter an owner team");
      return;
    }

    // Frontend duplicate validation
    const duplicateFeature = features.some(
      (feature) =>
        feature.key?.toLowerCase() ===
        featureKey.toLowerCase()
    );

    if (duplicateFeature) {
      error("A feature with this key already exists.");
      return;
    }

    const rollout = Number(form.rollout_percentage);

    if (
      !Number.isFinite(rollout) ||
      rollout < 0 ||
      rollout > 100
    ) {
      error("Rollout percentage must be between 0 and 100");
      return;
    }

    try {
      setLoading(true);

      const featureData = {
        key: featureKey,
        description: form.description.trim() || null,
        type: form.type,
        enabled: form.enabled,
        default_value: form.default_value,
        owner_team: form.owner_team.trim(),
        rollout_percentage: rollout,
        target_group_id: null,
      };

      console.log("Creating feature:", featureData);

      const response = await api.post(
        "/feature-flags/",
        featureData
      );

      console.log("Feature created:", response.data);

      success("Feature created successfully");

      setForm({ ...initialForm });

      await loadFeatures();
    } catch (err) {
      console.error(
        "Feature creation error:",
        err.response?.data || err
      );

      const status = err.response?.status;
      const detail = err.response?.data?.detail;

      if (status === 409 || status === 400) {
        error(
          typeof detail === "string"
            ? detail
            : "This feature key may already exist."
        );
      } else if (status === 422) {
        error("Please check the feature details and try again.");
      } else {
        error(
          typeof detail === "string"
            ? detail
            : "Failed to create feature. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // TOGGLE FEATURE
  // -----------------------------------------

  const toggleFeature = async (id) => {
    try {
      await api.patch(`/feature-flags/${id}/toggle`);

      success("Feature status updated");

      await loadFeatures();
    } catch (err) {
      console.error("Toggle error:", err.response?.data || err);

      error(
        err.response?.data?.detail ||
          "Failed to update feature"
      );
    }
  };

  // -----------------------------------------
  // DELETE FEATURE
  // -----------------------------------------

  const deleteFeature = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this feature?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/feature-flags/${id}`);

      success("Feature deleted successfully");

      await loadFeatures();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err);

      error(
        err.response?.data?.detail ||
          "Failed to delete feature. Check your permissions."
      );
    }
  };

  // -----------------------------------------
  // ROLLOUT VALUE CHANGE
  // -----------------------------------------

  const handleRolloutChange = (id, value) => {
    let percentage = Number(value);

    if (Number.isNaN(percentage)) {
      percentage = 0;
    }

    percentage = Math.max(0, Math.min(100, percentage));

    setRolloutValues((previous) => ({
      ...previous,
      [id]: percentage,
    }));
  };

  // -----------------------------------------
  // SAVE ROLLOUT
  // -----------------------------------------

  const saveRollout = async (id) => {
    if (!isAdmin) {
      error("Only Admin users can change rollout percentage");
      return;
    }

    const rolloutPercentage = Number(
      rolloutValues[id] ?? 0
    );

    if (
      rolloutPercentage < 0 ||
      rolloutPercentage > 100
    ) {
      error("Rollout percentage must be between 0 and 100");
      return;
    }

    try {
      setSavingRolloutId(id);

      const response = await api.patch(
        `/feature-flags/${id}/rollout`,
        {
          rollout_percentage: rolloutPercentage,
        }
      );

      setFeatures((previous) =>
        previous.map((feature) =>
          feature.id === id
            ? {
                ...feature,
                rollout_percentage:
                  response.data.rollout_percentage,
              }
            : feature
        )
      );

      setRolloutValues((previous) => ({
        ...previous,
        [id]: response.data.rollout_percentage,
      }));

      success(
        `Rollout updated to ${response.data.rollout_percentage}%`
      );
    } catch (err) {
      console.error(
        "Rollout update error:",
        err.response?.data || err
      );

      error(
        err.response?.data?.detail ||
          "Failed to update rollout percentage"
      );
    } finally {
      setSavingRolloutId(null);
    }
  };

  // -----------------------------------------
  // QUICK ROLLOUT
  // -----------------------------------------

  const setQuickRollout = (id, percentage) => {
    if (!isAdmin) return;

    setRolloutValues((previous) => ({
      ...previous,
      [id]: percentage,
    }));
  };

  // -----------------------------------------
  // RELEASE STATUS TRANSITIONS
  // -----------------------------------------

  const getReleaseActions = (status) => {
    const normalizedStatus = status?.toUpperCase() || "DRAFT";

    switch (normalizedStatus) {
      case "ACTIVE":
        return [
          {
            status: "ROLLOUT",
            label: "Start Rollout",
            icon: MdPlayArrow,
            className: "btn-outline-primary",
          },
          {
            status: "FULL_RELEASE",
            label: "Full Release",
            icon: MdPublish,
            className: "btn-outline-success",
          },
          {
            status: "DISABLED",
            label: "Disable",
            icon: MdBlock,
            className: "btn-outline-danger",
          },
        ];

      case "ROLLOUT":
        return [
          {
            status: "FULL_RELEASE",
            label: "Full Release",
            icon: MdPublish,
            className: "btn-outline-success",
          },
          {
            status: "DISABLED",
            label: "Disable",
            icon: MdBlock,
            className: "btn-outline-danger",
          },
        ];

      case "FULL_RELEASE":
        return [
          {
            status: "DISABLED",
            label: "Disable",
            icon: MdBlock,
            className: "btn-outline-danger",
          },
        ];

      case "DISABLED":
        return [
          {
            status: "ACTIVE",
            label: "Activate",
            icon: MdPlayArrow,
            className: "btn-outline-primary",
          },
        ];

      case "DRAFT":
      default:
        return [
          {
            status: "ACTIVE",
            label: "Activate",
            icon: MdPlayArrow,
            className: "btn-outline-primary",
          },
        ];
    }
  };

  // -----------------------------------------
  // CHANGE RELEASE STATUS
  // -----------------------------------------

  const changeReleaseStatus = async (featureId, newStatus) => {
    if (!canControlRelease) {
      error("Please log in to control feature releases");
      return;
    }

    try {
      setChangingReleaseId(featureId);

      const response = await api.patch(
        `/release/${featureId}`,
        {
          release_status: newStatus,
        }
      );

      setFeatures((previous) =>
        previous.map((feature) =>
          feature.id === featureId
            ? {
                ...feature,
                release_status: response.data.release_status,
                enabled:
                  newStatus === "DISABLED"
                    ? false
                    : true,
                rollout_percentage:
                  newStatus === "FULL_RELEASE"
                    ? 100
                    : feature.rollout_percentage,
              }
            : feature
        )
      );

      success(
        `Release status changed to ${response.data.release_status}`
      );
    } catch (err) {
      console.error(
        "Release status update error:",
        err.response?.data || err
      );

      error(
        err.response?.data?.detail ||
          "Failed to update release status"
      );
    } finally {
      setChangingReleaseId(null);
    }
  };

  // -----------------------------------------
  // STATISTICS
  // -----------------------------------------

  const activeFeatures = features.filter(
    (feature) => feature.enabled
  ).length;

  const inactiveFeatures = features.length - activeFeatures;

  // -----------------------------------------
  // TYPE BADGE
  // -----------------------------------------

  const getTypeBadge = (type) => {
    if (type === "boolean") {
      return {
        background: "#E0F2FE",
        color: "#0369A1",
        label: "Boolean",
      };
    }

    if (type === "percentage") {
      return {
        background: "#F3E8FF",
        color: "#7E22CE",
        label: "Percentage",
      };
    }

    return {
      background: "#FEF3C7",
      color: "#92400E",
      label: type
        ? type.charAt(0).toUpperCase() + type.slice(1)
        : "String",
    };
  };

  // -----------------------------------------
  // RELEASE STATUS BADGE
  // -----------------------------------------

  const getReleaseStatusBadge = (status) => {
    const normalizedStatus = status?.toUpperCase() || "DRAFT";

    switch (normalizedStatus) {
      case "ACTIVE":
        return {
          background: "#DBEAFE",
          color: "#1D4ED8",
          label: "ACTIVE",
        };

      case "ROLLOUT":
        return {
          background: "#F3E8FF",
          color: "#7E22CE",
          label: "ROLLOUT",
        };

      case "FULL_RELEASE":
        return {
          background: "#DCFCE7",
          color: "#15803D",
          label: "FULL RELEASE",
        };

      case "DISABLED":
        return {
          background: "#FEE2E2",
          color: "#B91C1C",
          label: "DISABLED",
        };

      default:
        return {
          background: "#FEF3C7",
          color: "#92400E",
          label: "DRAFT",
        };
    }
  };

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <div>
      {/* PAGE HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "14px",
              background: "#14B8A6",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MdFlag size={28} />
          </div>

          <div>
            <h2 className="mb-1 fw-bold">
              {t("Feature Management") || "Feature Management"}
            </h2>

            <p className="text-muted mb-0">
              Create, manage and control application feature releases
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {!loadingUser && currentUserRole && (
            <div
              className="px-3 py-2 rounded-pill"
              style={{
                background: isAdmin ? "#FEF3C7" : "#F1F5F9",
                color: isAdmin ? "#92400E" : "#475569",
                fontWeight: "600",
              }}
            >
              <MdSecurity className="me-1" />
              {currentUserRole}
            </div>
          )}

          <div
            className="px-3 py-2 rounded-pill"
            style={{
              background: "#ECFDF5",
              color: "#059669",
              fontWeight: "600",
            }}
          >
            <MdCheckCircle className="me-1" />
            {features.length} Feature{features.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}

      <div className="row g-4 mb-4">
        {[
          {
            title: "Total Features",
            value: features.length,
            icon: <MdFlag size={26} />,
            background: "#14B8A6",
            color: "#FFFFFF",
          },
          {
            title: "Active Features",
            value: activeFeatures,
            icon: <MdToggleOn size={28} />,
            background: "#ECFDF5",
            color: "#059669",
          },
          {
            title: "Inactive Features",
            value: inactiveFeatures,
            icon: <MdToggleOff size={28} />,
            background: "#F1F5F9",
            color: "#64748B",
          },
        ].map((item) => (
          <div className="col-md-4" key={item.title}>
            <div
              className="card border-0 shadow-sm h-100"
              style={{ borderRadius: "16px" }}
            >
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1">{item.title}</p>
                    <h2 className="fw-bold mb-0">{item.value}</h2>
                  </div>

                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: item.background,
                      color: item.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE FEATURE */}

      <div
        className="card border-0 shadow-sm mb-4"
        style={{ borderRadius: "16px" }}
      >
        <div className="card-body p-4">
          <div className="d-flex align-items-center mb-2">
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "#F0FDFA",
                color: "#0F766E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MdAdd size={24} />
            </div>

            <div className="ms-3">
              <h4 className="mb-0 fw-bold">
                {t("Add Feature") || "Create Feature"}
              </h4>

              <small className="text-muted">
                Define a new feature flag for controlled releases
              </small>
            </div>
          </div>

          <form onSubmit={addFeature} className="row g-4 mt-2">
            <div className="col-md-4">
              <label className="form-label fw-semibold">
                {t("Feature Key") || "Feature Key"}
              </label>

              <input
                className="form-control"
                name="key"
                placeholder="e.g. dark_mode"
                value={form.key}
                onChange={handleChange}
                required
              />

              <small className="text-muted">
                Unique identifier for the feature
              </small>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">
                {t("Owner Team") || "Owner Team"}
              </label>

              <input
                className="form-control"
                name="owner_team"
                placeholder="e.g. Frontend Team"
                value={form.owner_team}
                onChange={handleChange}
                required
              />

              <small className="text-muted">
                Team responsible for this feature
              </small>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">
                {t("Type") || "Feature Type"}
              </label>

              <select
                className="form-select"
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                <option value="boolean">Boolean</option>
                <option value="percentage">Percentage</option>
                <option value="string">String</option>
              </select>

              <small className="text-muted">
                Determines how the feature is evaluated
              </small>
            </div>

            {/* UPDATED DESCRIPTION FIELD */}

            <div className="col-12">
              <label className="form-label fw-semibold">
                {t("Description") || "Description"}
              </label>

              <textarea
                className="form-control"
                name="description"
                placeholder="e.g. Enable dark mode for selected users"
                value={form.description}
                onChange={handleChange}
                rows={3}
                maxLength={500}
                style={{
                  resize: "vertical",
                  minHeight: "90px",
                }}
              />

              <small className="text-muted">
                Describe what this feature does. Maximum 500 characters.
              </small>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">
                {t("Rollout Percentage") || "Rollout Percentage"}
              </label>

              <div className="input-group">
                <input
                  className="form-control"
                  type="number"
                  name="rollout_percentage"
                  value={form.rollout_percentage}
                  onChange={handleChange}
                  min="0"
                  max="100"
                />

                <span className="input-group-text">%</span>
              </div>

              <small className="text-muted">
                Percentage of users receiving the feature
              </small>
            </div>

            <div className="col-md-6">
              <div
                className="p-3"
                style={{
                  background: "#F8FAFC",
                  borderRadius: "12px",
                  border: "1px solid #E2E8F0",
                }}
              >
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="enabled"
                    checked={form.enabled}
                    onChange={handleChange}
                    id="featureEnabled"
                  />

                  <label
                    className="form-check-label fw-semibold"
                    htmlFor="featureEnabled"
                  >
                    Enable feature immediately
                  </label>
                </div>

                <small className="text-muted ms-4">
                  The feature will be available after creation
                </small>
              </div>
            </div>

            <div className="col-md-6">
              <div
                className="p-3"
                style={{
                  background: "#F8FAFC",
                  borderRadius: "12px",
                  border: "1px solid #E2E8F0",
                }}
              >
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="default_value"
                    checked={form.default_value}
                    onChange={handleChange}
                    id="defaultValue"
                  />

                  <label
                    className="form-check-label fw-semibold"
                    htmlFor="defaultValue"
                  >
                    Default value enabled
                  </label>
                </div>

                <small className="text-muted ms-4">
                  Used when no specific override applies
                </small>
              </div>
            </div>

            <div className="col-12">
              <button
                className="btn btn-primary px-4"
                type="submit"
                disabled={loading}
                style={{
                  borderRadius: "10px",
                  fontWeight: "600",
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <MdRocketLaunch size={20} className="me-1" />
                    Create Feature
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* FEATURE LIST */}

      <div
        className="card border-0 shadow-sm"
        style={{ borderRadius: "16px" }}
      >
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="mb-1 fw-bold">
                {t("Feature List") || "Feature Flags"}
              </h4>

              <p className="text-muted mb-0">
                Manage existing feature flags and release status
              </p>
            </div>

            <MdFlag size={32} style={{ color: "#14B8A6" }} />
          </div>

          {isAdmin && (
            <div
              className="alert d-flex align-items-start mb-4"
              style={{
                background: "#FFFBEB",
                border: "1px solid #FDE68A",
                borderRadius: "12px",
                color: "#92400E",
              }}
            >
              <MdSecurity size={24} className="me-2 mt-1" />

              <div>
                <strong>Admin Rollout Configuration</strong>

                <div className="small mt-1">
                  Use the rollout controls below to gradually
                  release features to a percentage of users.
                  Changes are saved immediately to the feature flag.
                </div>
              </div>
            </div>
          )}

          {canControlRelease && (
            <div
              className="alert d-flex align-items-start mb-4"
              style={{
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: "12px",
                color: "#1E40AF",
              }}
            >
              <MdRocketLaunch size={24} className="me-2 mt-1" />

              <div>
                <strong>Release Control</strong>

                <div className="small mt-1">
                  All authenticated users can manage the feature
                  release lifecycle. Use the release actions to
                  activate, roll out, fully release, or disable a feature.
                </div>
              </div>
            </div>
          )}

          {loadingFeatures ? (
            <div className="text-center py-5">
              <div
                className="spinner-border"
                style={{ color: "#14B8A6" }}
                role="status"
              />

              <p className="text-muted mt-3 mb-0">
                Loading feature flags...
              </p>
            </div>
          ) : features.length === 0 ? (
            <div
              className="text-center py-5"
              style={{
                background: "#F8FAFC",
                borderRadius: "12px",
              }}
            >
              <MdFlag size={52} style={{ color: "#CBD5E1" }} />

              <h5 className="mt-3">No feature flags yet</h5>

              <p className="text-muted mb-0">
                Create your first feature using the form above.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Feature</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Release</th>
                    <th style={{ minWidth: "260px" }}>Rollout</th>
                    <th>Owner</th>
                    <th style={{ minWidth: "300px" }}>Release Control</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {features.map((feature) => {
                    const typeBadge = getTypeBadge(feature.type);
                    const releaseBadge = getReleaseStatusBadge(
                      feature.release_status
                    );

                    const releaseActions = getReleaseActions(
                      feature.release_status
                    );

                    const currentRollout = Number(
                      rolloutValues[feature.id] ??
                        feature.rollout_percentage ??
                        0
                    );

                    const savedRollout = Number(
                      feature.rollout_percentage ?? 0
                    );

                    const rolloutChanged =
                      currentRollout !== savedRollout;

                    return (
                      <tr key={feature.id}>
                        <td>
                          <span className="text-muted">
                            #{feature.id}
                          </span>
                        </td>

                        <td>
                          <div>
                            <strong>{feature.key}</strong>

                            {feature.description && (
                              <div
                                className="text-muted small mt-1"
                                style={{ maxWidth: "240px" }}
                              >
                                {feature.description}
                              </div>
                            )}
                          </div>
                        </td>

                        <td>
                          <span
                            className="px-2 py-1 rounded-pill"
                            style={{
                              background: typeBadge.background,
                              color: typeBadge.color,
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            {typeBadge.label}
                          </span>
                        </td>

                        <td>
                          {feature.enabled ? (
                            <span className="badge bg-success-subtle text-success px-3 py-2">
                              <MdCheckCircle className="me-1" />
                              Enabled
                            </span>
                          ) : (
                            <span className="badge bg-secondary-subtle text-secondary px-3 py-2">
                              <MdCancel className="me-1" />
                              Disabled
                            </span>
                          )}
                        </td>

                        <td>
                          <span
                            className="px-3 py-2 rounded-pill"
                            style={{
                              background: releaseBadge.background,
                              color: releaseBadge.color,
                              fontSize: "12px",
                              fontWeight: "700",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {releaseBadge.label}
                          </span>
                        </td>

                        <td>
                          <div style={{ minWidth: "240px" }}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="fw-semibold">
                                {currentRollout}%
                              </span>

                              {rolloutChanged && (
                                <span
                                  className="small"
                                  style={{
                                    color: "#D97706",
                                    fontWeight: "600",
                                  }}
                                >
                                  Unsaved
                                </span>
                              )}
                            </div>

                            <div
                              className="progress mb-2"
                              style={{
                                height: "6px",
                                borderRadius: "10px",
                              }}
                            >
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{
                                  width: `${currentRollout}%`,
                                  background: "#14B8A6",
                                }}
                              />
                            </div>

                            {isAdmin ? (
                              <>
                                <div className="d-flex align-items-center gap-2">
                                  <input
                                    type="range"
                                    className="form-range"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={currentRollout}
                                    onChange={(e) =>
                                      handleRolloutChange(
                                        feature.id,
                                        e.target.value
                                      )
                                    }
                                  />

                                  <div
                                    className="input-group input-group-sm"
                                    style={{ width: "85px" }}
                                  >
                                    <input
                                      type="number"
                                      className="form-control"
                                      min="0"
                                      max="100"
                                      value={currentRollout}
                                      onChange={(e) =>
                                        handleRolloutChange(
                                          feature.id,
                                          e.target.value
                                        )
                                      }
                                    />

                                    <span className="input-group-text">
                                      %
                                    </span>
                                  </div>
                                </div>

                                <div className="d-flex gap-1 flex-wrap mt-1">
                                  {[10, 25, 50, 75, 100].map(
                                    (percentage) => (
                                      <button
                                        key={percentage}
                                        type="button"
                                        className={
                                          currentRollout === percentage
                                            ? "btn btn-primary btn-sm"
                                            : "btn btn-outline-secondary btn-sm"
                                        }
                                        style={{
                                          fontSize: "11px",
                                          padding: "2px 7px",
                                        }}
                                        onClick={() =>
                                          setQuickRollout(
                                            feature.id,
                                            percentage
                                          )
                                        }
                                      >
                                        {percentage}%
                                      </button>
                                    )
                                  )}
                                </div>

                                <button
                                  type="button"
                                  className="btn btn-sm btn-success mt-2"
                                  disabled={
                                    !rolloutChanged ||
                                    savingRolloutId === feature.id
                                  }
                                  onClick={() =>
                                    saveRollout(feature.id)
                                  }
                                >
                                  {savingRolloutId === feature.id ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-1" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <MdSave size={16} className="me-1" />
                                      Save Rollout
                                    </>
                                  )}
                                </button>
                              </>
                            ) : (
                              <small className="text-muted">
                                Admin only
                              </small>
                            )}
                          </div>
                        </td>

                        <td>
                          <span className="fw-semibold">
                            {feature.owner_team}
                          </span>
                        </td>

                        <td>
                          <div style={{ minWidth: "280px" }}>
                            <div className="mb-2">
                              <small className="text-muted">
                                Current release:
                              </small>

                              <div className="mt-1">
                                <span className="fw-bold">
                                  {releaseBadge.label}
                                </span>
                              </div>
                            </div>

                            {canControlRelease &&
                            releaseActions.length > 0 ? (
                              <div className="d-flex gap-1 flex-wrap">
                                {releaseActions.map((action) => {
                                  const ActionIcon = action.icon;
                                  const isChanging =
                                    changingReleaseId === feature.id;

                                  return (
                                    <button
                                      key={action.status}
                                      type="button"
                                      className={`btn btn-sm ${action.className}`}
                                      disabled={
                                        isChanging || loadingUser
                                      }
                                      onClick={() =>
                                        changeReleaseStatus(
                                          feature.id,
                                          action.status
                                        )
                                      }
                                      title={`Change release status to ${action.status}`}
                                    >
                                      {isChanging ? (
                                        <span className="spinner-border spinner-border-sm me-1" />
                                      ) : (
                                        <ActionIcon
                                          size={16}
                                          className="me-1"
                                        />
                                      )}

                                      {action.label}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <small className="text-muted">
                                {loadingUser
                                  ? "Checking user access..."
                                  : "Login required to control releases"}
                              </small>
                            )}
                          </div>
                        </td>

                        <td className="text-end">
                          <button
                            type="button"
                            className={
                              feature.enabled
                                ? "btn btn-outline-warning btn-sm me-2"
                                : "btn btn-outline-success btn-sm me-2"
                            }
                            onClick={() =>
                              toggleFeature(feature.id)
                            }
                            title={
                              feature.enabled
                                ? "Disable feature"
                                : "Enable feature"
                            }
                          >
                            {feature.enabled ? (
                              <>
                                <MdToggleOff
                                  size={18}
                                  className="me-1"
                                />
                                Disable
                              </>
                            ) : (
                              <>
                                <MdToggleOn
                                  size={18}
                                  className="me-1"
                                />
                                Enable
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() =>
                              deleteFeature(feature.id)
                            }
                            title="Delete feature"
                          >
                            <MdDelete size={18} className="me-1" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Features;
