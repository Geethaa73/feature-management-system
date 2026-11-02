import { useEffect, useState } from "react";
import api from "../services/api";

function Environments() {
  const [environments, setEnvironments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    loadEnvironments();
  }, []);

  const loadEnvironments = async () => {
    try {
      const response = await api.get("/environments/");
      setEnvironments(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const editEnvironment = (env) => {
    setForm({
      name: env.name,
      description: env.description,
    });

    setEditingId(env.id);
  };

  const saveEnvironment = async () => {
    try {
      if (editingId) {
        await api.put(`/environments/${editingId}`, form);
        alert("Environment Updated Successfully!");
        setEditingId(null);
      } else {
        await api.post("/environments/", form);
        alert("Environment Added Successfully!");
      }

      setForm({
        name: "",
        description: "",
      });

      loadEnvironments();

    } catch (err) {
      console.error(err.response);
      alert(JSON.stringify(err.response?.data));
    }
  };

  const deleteEnvironment = async (id) => {
    if (!window.confirm("Delete this environment?")) return;

    await api.delete(`/environments/${id}`);
    loadEnvironments();
  };

  const filtered = environments.filter((env) =>
    env.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-fluid">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🌍 Environment Management</h2>

        <span className="badge bg-primary fs-6">
          Total : {environments.length}
        </span>
      </div>

      <div className="card shadow mb-4">

        <div className="card-header bg-success text-white">
          <h5 className="mb-0">
            {editingId ? "Update Environment" : "Add Environment"}
          </h5>
        </div>

        <div className="card-body">

          <div className="row">

            <div className="col-md-6 mb-3">
              <label>Name</label>

              <input
                className="form-control"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Description</label>

              <input
                className="form-control"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
              />
            </div>

          </div>

          <button
            className="btn btn-success"
            onClick={saveEnvironment}
          >
            {editingId ? "Update Environment" : "Add Environment"}
          </button>

        </div>

      </div>

      <div className="card shadow">

        <div className="card-header d-flex justify-content-between align-items-center">

          <h5 className="mb-0">
            All Environments
          </h5>

          <input
            className="form-control"
            style={{ width: "300px" }}
            placeholder="Search..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <div className="card-body">

          <table className="table table-striped table-hover">

            <thead className="table-dark">

              <tr>

                <th>ID</th>

                <th>Name</th>

                <th>Description</th>

                <th>Actions</th>

              </tr>

            </thead>

            <tbody>

              {filtered.map((env) => (

                <tr key={env.id}>

                  <td>{env.id}</td>

                  <td>{env.name}</td>

                  <td>{env.description}</td>

                  <td>

                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() =>
                        editEnvironment(env)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        deleteEnvironment(env.id)
                      }
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Environments;