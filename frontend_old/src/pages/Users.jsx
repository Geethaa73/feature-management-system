import { useEffect, useState } from "react";
import api from "../services/api";

function Users() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get("/users/");
      setUsers(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const saveUser = async () => {
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, form);
        alert("User Updated Successfully!");
        setEditingId(null);
      } else {
        await api.post("/users/", form);
        alert("User Added Successfully!");
      }

      setForm({
        username: "",
        email: "",
        password: "",
      });

      loadUsers();

    } catch (err) {
      alert(JSON.stringify(err.response?.data));
    }
  };

  const editUser = (user) => {
    setEditingId(user.id);

    setForm({
      username: user.username,
      email: user.email,
      password: "",
    });
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    await api.delete(`/users/${id}`);
    loadUsers();
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-fluid">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2>👤 User Management</h2>

        <span className="badge bg-primary fs-6">
          Total Users : {users.length}
        </span>

      </div>

      <div className="card shadow mb-4">

        <div className="card-header bg-primary text-white">

          <h5 className="mb-0">
            {editingId ? "Update User" : "Add User"}
          </h5>

        </div>

        <div className="card-body">

          <div className="row">

            <div className="col-md-4">

              <label>Username</label>

              <input
                className="form-control"
                value={form.username}
                onChange={(e)=>
                  setForm({
                    ...form,
                    username:e.target.value
                  })
                }
              />

            </div>

            <div className="col-md-4">

              <label>Email</label>

              <input
                className="form-control"
                value={form.email}
                onChange={(e)=>
                  setForm({
                    ...form,
                    email:e.target.value
                  })
                }
              />

            </div>

            <div className="col-md-4">

              <label>Password</label>

              <input
                type="password"
                className="form-control"
                value={form.password}
                onChange={(e)=>
                  setForm({
                    ...form,
                    password:e.target.value
                  })
                }
              />

            </div>

          </div>

          <br />

          <button
            className="btn btn-success"
            onClick={saveUser}
          >
            {editingId ? "Update User" : "Add User"}
          </button>

        </div>

      </div>

      <div className="card shadow">

        <div className="card-header d-flex justify-content-between">

          <h5>All Users</h5>

          <input
            className="form-control"
            style={{width:"300px"}}
            placeholder="Search..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
          />

        </div>

        <div className="card-body">

          <table className="table table-hover table-striped">

            <thead className="table-dark">

              <tr>

                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Actions</th>

              </tr>

            </thead>

            <tbody>

              {filteredUsers.map((user)=>(

                <tr key={user.id}>

                  <td>{user.id}</td>

                  <td>{user.username}</td>

                  <td>{user.email}</td>

                  <td>

                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={()=>editUser(user)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={()=>deleteUser(user.id)}
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

export default Users;