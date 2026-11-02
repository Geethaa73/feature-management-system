import { useEffect, useState } from "react";
import api from "../services/api";
import { success, error } from "../utils/toast";

import {
  MdPublic,
  MdAdd,
  MdDelete,
  MdCloud,
  MdCheckCircle,
  MdEdit,
  MdClose,
  MdSave,
} from "react-icons/md";

function Environments() {
  const [environments, setEnvironments] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editingEnvironment, setEditingEnvironment] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // ============================================================
  // LOAD ENVIRONMENTS
  // ============================================================

  const loadEnvironments = async () => {
    try {
      const response = await api.get("/environments/");
      setEnvironments(response.data);
    } catch (err) {
      console.error(
        "Environment loading error:",
        err.response?.data || err
      );

      error(
        err.response?.data?.detail ||
          "Failed to load environments"
      );
    }
  };

  useEffect(() => {
    loadEnvironments();
  }, []);

  // ============================================================
  // CREATE ENVIRONMENT
  // ============================================================

  const addEnvironment = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      error("Please enter an environment name");
      return;
    }

    try {
      setLoading(true);

      await api.post("/environments/", {
        name: trimmedName,
        description: trimmedDescription || null,
      });

      setName("");
      setDescription("");

      success("Environment created successfully");

      await loadEnvironments();
    } catch (err) {
      console.error(
        "Environment creation error:",
        err.response?.data || err
      );

      error(
        err.response?.data?.detail ||
          "Failed to create environment"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  const openEditModal = async (id) => {
    try {
      const response = await api.get(
        `/environments/${id}`
      );

      const environment = response.data;

      setEditingEnvironment(environment);
      setEditName(environment.name || "");
      setEditDescription(
        environment.description || ""
      );
    } catch (err) {
      console.error(
        "Environment fetch error:",
        err.response?.data || err
      );

      error(
        err.response?.data?.detail ||
          "Failed to load environment"
      );
    }
  };

  // ============================================================
  // CLOSE EDIT MODAL
  // ============================================================

  const closeEditModal = () => {
    if (editLoading) return;

    setEditingEnvironment(null);
    setEditName("");
    setEditDescription("");
  };

  // ============================================================
  // UPDATE ENVIRONMENT
  // ============================================================

  const updateEnvironment = async (e) => {
    e.preventDefault();

    if (!editingEnvironment) {
      return;
    }

    const trimmedName = editName.trim();
    const trimmedDescription =
      editDescription.trim();

    if (!trimmedName) {
      error("Environment name cannot be empty");
      return;
    }

    try {
      setEditLoading(true);

      await api.put(
        `/environments/${editingEnvironment.id}`,
        {
          name: trimmedName,
          description:
            trimmedDescription || null,
        }
      );

      success(
        "Environment updated successfully"
      );

      closeEditModal();

      await loadEnvironments();
    } catch (err) {
      console.error(
        "Environment update error:",
        err.response?.data || err
      );

      error(
        err.response?.data?.detail ||
          "Failed to update environment"
      );
    } finally {
      setEditLoading(false);
    }
  };

  // ============================================================
  // DELETE ENVIRONMENT
  // ============================================================

  const deleteEnvironment = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this environment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(id);

      await api.delete(
        `/environments/${id}`
      );

      success(
        "Environment deleted successfully"
      );

      await loadEnvironments();
    } catch (err) {
      console.error(
        "Environment deletion error:",
        err.response?.data || err
      );

      error(
        err.response?.data?.detail ||
          "Failed to delete environment"
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div>

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <div className="d-flex align-items-center gap-3">

            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "14px",
                background:
                  "linear-gradient(135deg, #E0F2FE, #CCFBF1)",
                color: "#0F766E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MdPublic size={28} />
            </div>

            <div>

              <h2
                className="mb-1 fw-bold"
                style={{
                  color: "#0F172A",
                }}
              >
                Environments
              </h2>

              <p className="text-muted mb-0">
                Manage application deployment environments
              </p>

            </div>

          </div>

        </div>

        <div
          className="px-3 py-2 rounded-pill"
          style={{
            background: "#ECFDF5",
            color: "#059669",
            fontWeight: "600",
          }}
        >
          <MdCheckCircle
            className="me-1"
          />

          {environments.length} Environment
          {environments.length !== 1
            ? "s"
            : ""}
        </div>

      </div>


      {/* ======================================================
          CREATE ENVIRONMENT
      ====================================================== */}

      <div
        className="card border-0 shadow-sm mb-4"
        style={{
          borderRadius: "18px",
        }}
      >

        <div className="card-body p-4">

          <div className="d-flex align-items-center mb-2">

            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "#F0FDFA",
                color: "#0F766E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MdAdd size={23} />
            </div>

            <div className="ms-3">

              <h4 className="mb-0 fw-bold">
                Add Environment
              </h4>

              <small className="text-muted">
                Create a deployment environment
              </small>

            </div>

          </div>


          <form
            onSubmit={addEnvironment}
            className="row g-3 mt-2"
          >

            {/* NAME */}

            <div className="col-md-5">

              <label className="form-label fw-semibold">
                Environment Name
              </label>

              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="e.g. Development"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                disabled={loading}
              />

            </div>


            {/* DESCRIPTION */}

            <div className="col-md-5">

              <label className="form-label fw-semibold">
                Description
              </label>

              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="e.g. Used by developers"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                disabled={loading}
              />

            </div>


            {/* BUTTON */}

            <div className="col-md-2 d-flex align-items-end">

              <button
                type="submit"
                className="btn btn-primary btn-lg w-100"
                disabled={loading}
                style={{
                  borderRadius: "11px",
                  fontWeight: "600",
                }}
              >

                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    <MdAdd
                      size={22}
                      className="me-1"
                    />
                    Add
                  </>
                )}

              </button>

            </div>

          </form>

        </div>

      </div>


      {/* ======================================================
          ENVIRONMENT LIST
      ====================================================== */}

      <div
        className="card border-0 shadow-sm"
        style={{
          borderRadius: "18px",
        }}
      >

        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-center mb-4">

            <div>

              <h4 className="mb-1 fw-bold">
                Deployment Environments
              </h4>

              <p className="text-muted mb-0">
                Available environments in the system
              </p>

            </div>

            <MdCloud
              size={34}
              style={{
                color: "#14B8A6",
              }}
            />

          </div>


          {/* EMPTY STATE */}

          {environments.length === 0 ? (

            <div
              className="text-center py-5"
              style={{
                background: "#F8FAFC",
                borderRadius: "14px",
              }}
            >

              <MdPublic
                size={55}
                style={{
                  color: "#CBD5E1",
                }}
              />

              <h5 className="mt-3 fw-semibold">
                No environments yet
              </h5>

              <p className="text-muted mb-0">
                Create your first deployment
                environment above.
              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead>

                  <tr>

                    <th>
                      ID
                    </th>

                    <th>
                      Environment
                    </th>

                    <th>
                      Description
                    </th>

                    <th>
                      Status
                    </th>

                    <th className="text-end">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {environments.map(
                    (env) => (

                      <tr key={env.id}>

                        {/* ID */}

                        <td>

                          <span
                            className="text-muted fw-semibold"
                          >
                            #{env.id}
                          </span>

                        </td>


                        {/* ENVIRONMENT */}

                        <td>

                          <div className="d-flex align-items-center gap-3">

                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "10px",
                                background:
                                  "#F0FDFA",
                                color:
                                  "#0F766E",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                              }}
                            >
                              <MdPublic
                                size={21}
                              />
                            </div>

                            <strong>
                              {env.name}
                            </strong>

                          </div>

                        </td>


                        {/* DESCRIPTION */}

                        <td>

                          <span
                            className={
                              env.description
                                ? "text-muted"
                                : "text-muted fst-italic"
                            }
                          >
                            {env.description ||
                              "No description"}
                          </span>

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className="badge px-3 py-2"
                            style={{
                              background:
                                "#ECFDF5",
                              color:
                                "#059669",
                            }}
                          >

                            <MdCheckCircle
                              className="me-1"
                            />

                            Active

                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td className="text-end">

                          <div className="d-flex justify-content-end gap-2">

                            {/* EDIT */}

                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() =>
                                openEditModal(
                                  env.id
                                )
                              }
                              disabled={
                                deleteLoading ===
                                env.id
                              }
                              title="Edit environment"
                            >

                              <MdEdit
                                size={17}
                                className="me-1"
                              />

                              Edit

                            </button>


                            {/* DELETE */}

                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() =>
                                deleteEnvironment(
                                  env.id
                                )
                              }
                              disabled={
                                deleteLoading ===
                                env.id
                              }
                              title="Delete environment"
                            >

                              {deleteLoading ===
                              env.id ? (

                                <span
                                  className="spinner-border spinner-border-sm me-1"
                                />

                              ) : (

                                <MdDelete
                                  size={17}
                                  className="me-1"
                                />

                              )}

                              Delete

                            </button>

                          </div>

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


      {/* ======================================================
          EDIT MODAL
      ====================================================== */}

      {editingEnvironment && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
            padding: "20px",
          }}
          onClick={closeEditModal}
        >

          <div
            className="card border-0 shadow-lg"
            style={{
              width: "100%",
              maxWidth: "550px",
              borderRadius: "18px",
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div
              className="card-header border-0 d-flex justify-content-between align-items-center p-4"
              style={{
                background: "white",
                borderRadius:
                  "18px 18px 0 0",
              }}
            >

              <div>

                <h4 className="mb-1 fw-bold">
                  Edit Environment
                </h4>

                <p className="text-muted mb-0">
                  Update environment details
                </p>

              </div>

              <button
                type="button"
                className="btn btn-light rounded-circle"
                onClick={closeEditModal}
                disabled={editLoading}
                style={{
                  width: "40px",
                  height: "40px",
                }}
              >
                <MdClose size={22} />
              </button>

            </div>


            {/* MODAL BODY */}

            <form
              onSubmit={updateEnvironment}
            >

              <div className="card-body px-4 pb-4">

                <div className="mb-3">

                  <label className="form-label fw-semibold">
                    Environment Name
                  </label>

                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={editName}
                    onChange={(e) =>
                      setEditName(
                        e.target.value
                      )
                    }
                    disabled={editLoading}
                    autoFocus
                  />

                </div>


                <div className="mb-3">

                  <label className="form-label fw-semibold">
                    Description
                  </label>

                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Describe this environment..."
                    value={editDescription}
                    onChange={(e) =>
                      setEditDescription(
                        e.target.value
                      )
                    }
                    disabled={editLoading}
                  />

                </div>

              </div>


              {/* MODAL FOOTER */}

              <div
                className="d-flex justify-content-end gap-2 px-4 pb-4"
              >

                <button
                  type="button"
                  className="btn btn-light"
                  onClick={closeEditModal}
                  disabled={editLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editLoading}
                >

                  {editLoading ? (

                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                      />

                      Saving...
                    </>

                  ) : (

                    <>
                      <MdSave
                        size={19}
                        className="me-1"
                      />

                      Save Changes
                    </>

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Environments;