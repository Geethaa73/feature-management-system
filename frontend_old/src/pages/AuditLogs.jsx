import { useEffect, useState } from "react";
import api from "../services/api";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const response = await api.get("/audit-logs/");
      setLogs(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLogs = logs.filter((log) =>
    (log.action || "").toLowerCase().includes(search.toLowerCase()) ||
    (log.performed_by || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-fluid">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📜 Audit Logs</h2>

        <span className="badge bg-primary fs-6">
          Total Logs : {logs.length}
        </span>
      </div>

      <div className="card shadow">

        <div className="card-header d-flex justify-content-between align-items-center">

          <h5 className="mb-0">System Activity</h5>

          <input
            type="text"
            className="form-control"
            style={{ width: "300px" }}
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        <div className="card-body">

          <table className="table table-hover table-striped">

            <thead className="table-dark">

              <tr>
                <th>ID</th>
                <th>Action</th>
                <th>Performed By</th>
                <th>Old Value</th>
                <th>New Value</th>
                <th>Time</th>
              </tr>

            </thead>

            <tbody>

              {filteredLogs.map((log) => (

                <tr key={log.id}>

                  <td>{log.id}</td>

                  <td>
                    <span className="badge bg-info">
                      {log.action}
                    </span>
                  </td>

                  <td>{log.performed_by}</td>

                  <td>{log.old_value || "-"}</td>

                  <td>{log.new_value || "-"}</td>

                  <td>
                    {log.timestamp
                      ? new Date(log.timestamp).toLocaleString()
                      : "-"}
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

export default AuditLogs;