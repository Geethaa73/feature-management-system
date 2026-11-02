import { useEffect, useState } from "react";
import api from "../services/api";

function Groups() {
  const [groups, setGroups] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
  });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await api.get("/groups/");
      setGroups(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const editGroup = (group) => {
    setForm({
      name: group.name,
    });

    setEditingId(group.id);
  };

  const saveGroup = async () => {
    try {
      if (editingId) {
        await api.put(`/groups/${editingId}`, form);
        alert("Group Updated Successfully!");
        setEditingId(null);
      } else {
        await api.post("/groups/", form);
        alert("Group Added Successfully!");
      }

      setForm({
        name: "",
      });

      loadGroups();

    } catch (err) {
      console.error(err.response);
      alert(JSON.stringify(err.response?.data));
    }
  };

  const deleteGroup = async (id) => {
    if (!window.confirm("Delete this group?")) return;

    await api.delete(`/groups/${id}`);
    loadGroups();
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-fluid">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>👥 Group Management</h2>

        <span className="badge bg-primary fs-6">
          Total Groups : {groups.length}
        </span>
      </div>

      <div className="card shadow mb-4">

        <div className="card-header bg-success text-white">
          <h5 className="mb-0">
            {editingId ? "Update Group" : "Add New Group"}
          </h5>
        </div>

        <div className="card-body">

          <div className="row">

            <div className="col-md-12 mb-3">

              <label>Group Name</label>

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

          </div>

          <button
            className="btn btn-success"
            onClick={saveGroup}
          >
            {editingId ? "Update Group" : "Add Group"}
          </button>

        </div>

      </div>

      <div className="card shadow">

        <div className="card-header d-flex justify-content-between align-items-center">

          <h5 className="mb-0">All Groups</h5>

          <input
            className="form-control"
            style={{ width: "300px" }}
            placeholder="Search Group..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <div className="card-body">

          <table className="table table-hover table-striped">

            <thead className="table-dark">

              <tr>
                <th>ID</th>
                <th>Group Name</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody>

              {filteredGroups.map((group) => (

                <tr key={group.id}>

                  <td>{group.id}</td>

                  <td>{group.name}</td>

                  <td>

                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => editGroup(group)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteGroup(group.id)}
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

export default Groups;