import { useEffect, useState } from "react";
import api from "../services/api";

function UserGroups() {
  const [assignments, setAssignments] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);

  const [form, setForm] = useState({
    user_id: "",
    group_id: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userRes = await api.get("/users/");
      const groupRes = await api.get("/groups/");

      setUsers(userRes.data);
      setGroups(groupRes.data);

      if (userRes.data.length > 0) {
        loadAssignments(userRes.data[0].id);
      }

    } catch (err) {
      console.error(err);
    }
  };

  const loadAssignments = async (userId) => {
    try {
      const response = await api.get(`/user-groups/user/${userId}`);
      setAssignments(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const assignUser = async () => {
    try {
      await api.post("/user-groups/assign", {
        user_id: Number(form.user_id),
        group_id: Number(form.group_id),
      });

      alert("User Assigned Successfully!");

      loadAssignments(form.user_id);

    } catch (err) {
      alert(JSON.stringify(err.response?.data));
    }
  };

  const removeAssignment = async (id) => {
    if (!window.confirm("Remove Assignment?")) return;

    await api.delete(`/user-groups/${id}`);

    loadAssignments(form.user_id);
  };

  return (
    <div className="container-fluid">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>👤 User Group Assignment</h2>

        <span className="badge bg-primary fs-6">
          Assign Users to Groups
        </span>
      </div>

      <div className="card shadow mb-4">

        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            Assign User
          </h5>
        </div>

        <div className="card-body">

          <div className="row">

            <div className="col-md-6">

              <label>User</label>

              <select
                className="form-select"
                value={form.user_id}
                onChange={(e)=>{
                  setForm({
                    ...form,
                    user_id:e.target.value
                  });

                  loadAssignments(e.target.value);
                }}
              >

                <option value="">
                  Select User
                </option>

                {users.map(user=>(
                  <option
                    key={user.id}
                    value={user.id}
                  >
                    {user.username}
                  </option>
                ))}

              </select>

            </div>

            <div className="col-md-6">

              <label>Group</label>

              <select
                className="form-select"
                value={form.group_id}
                onChange={(e)=>
                  setForm({
                    ...form,
                    group_id:e.target.value
                  })
                }
              >

                <option value="">
                  Select Group
                </option>

                {groups.map(group=>(
                  <option
                    key={group.id}
                    value={group.id}
                  >
                    {group.name}
                  </option>
                ))}

              </select>

            </div>

          </div>

          <br />

          <button
            className="btn btn-success"
            onClick={assignUser}
          >
            Assign User
          </button>

        </div>

      </div>

      <div className="card shadow">

        <div className="card-header">

          <h5>
            Current Assignments
          </h5>

        </div>

        <div className="card-body">

          <table className="table table-hover">

            <thead className="table-dark">

              <tr>

                <th>ID</th>

                <th>User ID</th>

                <th>Group ID</th>

                <th>Action</th>

              </tr>

            </thead>

            <tbody>

              {assignments.map((assignment)=>(

                <tr key={assignment.id}>

                  <td>{assignment.id}</td>

                  <td>{assignment.user_id}</td>

                  <td>{assignment.group_id}</td>

                  <td>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={()=>removeAssignment(assignment.id)}
                    >
                      Remove
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

export default UserGroups;