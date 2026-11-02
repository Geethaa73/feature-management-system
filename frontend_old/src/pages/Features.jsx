import { useEffect, useState } from "react";
import api from "../services/api";

import {
  notifySuccess,
  notifyError,
  notifyInfo,
  notifyWarning,
} from "../utils/toast";

function Features() {
  console.log("FEATURE PAGE LOADED");

  const [features, setFeatures] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    key: "",
    description: "",
    type: "",
    owner_team: "",
    enabled: true,
    default_value: false,
    rollout_percentage: 100,
    target_group_id: null,
  });

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {

    try {

      setLoading(true);

      const response = await api.get("/feature-flags/");

      setFeatures(response.data);

    } catch (err) {

      console.error(err);

      notifyError("Unable to load features.");

    } finally {

      setLoading(false);

    }

  };

  const clearForm = () => {

    setForm({
      key: "",
      description: "",
      type: "",
      owner_team: "",
      enabled: true,
      default_value: false,
      rollout_percentage: 100,
      target_group_id: null,
    });

    setEditingId(null);

  };

  const editFeature = (feature) => {

    setEditingId(feature.id);

    setForm({
      key: feature.key,
      description: feature.description,
      type: feature.type,
      owner_team: feature.owner_team,
      enabled: feature.enabled,
      default_value: feature.default_value,
      rollout_percentage: feature.rollout_percentage,
      target_group_id: feature.target_group_id,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };

  const saveFeature = async () => {

    if (!form.key.trim()) {
      notifyWarning("Feature Key is required.");
      return;
    }

    if (!form.type.trim()) {
      notifyWarning("Feature Type is required.");
      return;
    }

    try {

      setSaving(true);

      if (editingId) {

        await api.put(
          `/feature-flags/${editingId}`,
          form
        );

        notifyInfo("Feature updated successfully.");

      } else {

        await api.post(
          "/feature-flags/",
          form
        );

        notifySuccess("Feature created successfully.");

      }

      clearForm();

      loadFeatures();

    } catch (err) {

      console.error(err);

      notifyError(
        err.response?.data?.detail ||
        "Unable to save feature."
      );

    } finally {

      setSaving(false);

    }

  };

  const toggleFeature = async (id) => {

    try {

      await api.patch(
        `/feature-flags/${id}/toggle`
      );

      notifySuccess("Feature status updated.");

      loadFeatures();

    } catch (err) {

      notifyError("Unable to toggle feature.");

    }

  };

  const deleteFeature = async (id) => {

    const ok = window.confirm(
      "Delete this Feature?"
    );

    if (!ok) return;

    try {

      await api.delete(
        `/feature-flags/${id}`
      );

      notifyWarning("Feature deleted.");

      loadFeatures();

    } catch (err) {

      notifyError("Unable to delete feature.");

    }

  };

  const filteredFeatures = features.filter((feature) =>

    feature.key
      ?.toLowerCase()
      .includes(search.toLowerCase())

  );

    return (
    <div className="container-fluid">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">🚩 Feature Flags</h2>
          <p className="text-muted mb-0">
            Manage all application feature flags
          </p>
        </div>

        <span className="badge bg-primary fs-6 p-3">
          Total : {features.length}
        </span>

      </div>

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-header bg-primary text-white">

          <h5 className="mb-0">
            {editingId ? "Update Feature" : "Create Feature"}
          </h5>

        </div>

        <div className="card-body">

          <div className="row">

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Feature Key
              </label>

              <input
                className="form-control"
                value={form.key}
                onChange={(e)=>
                  setForm({
                    ...form,
                    key:e.target.value
                  })
                }
              />

            </div>

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Feature Type
              </label>

              <input
                className="form-control"
                value={form.type}
                onChange={(e)=>
                  setForm({
                    ...form,
                    type:e.target.value
                  })
                }
              />

            </div>

            <div className="col-12 mb-3">

              <label className="form-label">
                Description
              </label>

              <textarea
                rows="3"
                className="form-control"
                value={form.description}
                onChange={(e)=>
                  setForm({
                    ...form,
                    description:e.target.value
                  })
                }
              />

            </div>

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Owner Team
              </label>

              <input
                className="form-control"
                value={form.owner_team}
                onChange={(e)=>
                  setForm({
                    ...form,
                    owner_team:e.target.value
                  })
                }
              />

            </div>

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Rollout %
              </label>

              <input
                type="number"
                className="form-control"
                value={form.rollout_percentage}
                onChange={(e)=>
                  setForm({
                    ...form,
                    rollout_percentage:Number(e.target.value)
                  })
                }
              />

            </div>

          </div>

          <div className="d-flex gap-2">

            <button
              className="btn btn-success"
              disabled={saving}
              onClick={saveFeature}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Feature"
                : "Create Feature"}
            </button>

            <button
              className="btn btn-secondary"
              onClick={clearForm}
            >
              Reset
            </button>

          </div>

        </div>

      </div>

      <div className="card shadow-sm border-0">

        <div className="card-header">

          <div className="d-flex justify-content-between align-items-center">

            <h5 className="mb-0">
              Feature List
            </h5>

            <input
              className="form-control"
              style={{width:"280px"}}
              placeholder="Search Feature..."
              value={search}
              onChange={(e)=>
                setSearch(e.target.value)
              }
            />

          </div>

        </div>

        <div className="card-body">

          {loading ? (

            <div className="text-center p-5">

              <div
                className="spinner-border text-primary"
              />

              <p className="mt-3">
                Loading Features...
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-dark">

                  <tr>

                    <th>ID</th>
                    <th>Key</th>
                    <th>Type</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Rollout</th>
                    <th width="220">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredFeatures.length===0 ? (

                    <tr>

                      <td
                        colSpan="7"
                        className="text-center p-5"
                      >

                        No Features Found

                      </td>

                    </tr>

                  ) : (

                    filteredFeatures.map((feature)=>(

                      <tr key={feature.id}>

                        <td>{feature.id}</td>

                        <td>{feature.key}</td>

                        <td>{feature.type}</td>

                        <td>{feature.owner_team}</td>

                        <td>

                          <span
                            className={`badge ${
                              feature.enabled
                              ? "bg-success"
                              : "bg-danger"
                            }`}
                          >

                            {feature.enabled
                              ? "Enabled"
                              : "Disabled"}

                          </span>

                        </td>

                        <td>

                          <span className="badge bg-info">

                            {feature.rollout_percentage}%

                          </span>

                        </td>

                        <td>

                          <button
                            className="btn btn-warning btn-sm me-2"
                            onClick={()=>
                              editFeature(feature)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-primary btn-sm me-2"
                            onClick={()=>
                              toggleFeature(feature.id)
                            }
                          >
                            Toggle
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={()=>
                              deleteFeature(feature.id)
                            }
                          >
                            Delete
                          </button>

                        </td>

                      </tr>

                    ))

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

export default Features;