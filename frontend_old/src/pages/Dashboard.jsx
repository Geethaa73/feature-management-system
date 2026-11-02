import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [features, setFeatures] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [environments, setEnvironments] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const featureRes = await api.get("/feature-flags/");
      const groupRes = await api.get("/groups/");
      const userRes = await api.get("/users/");
      const envRes = await api.get("/environments/");

      setFeatures(featureRes.data);
      setGroups(groupRes.data);
      setUsers(userRes.data);
      setEnvironments(envRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const enabled = features.filter(f => f.enabled).length;
  const disabled = features.length - enabled;

  return (
    <div className="container-fluid">

      <h2 className="mb-4">
        Welcome, Admin 👋
      </h2>

      <div className="row g-4">

        <DashboardCard
          color="primary"
          icon="bi-flag"
          title="Features"
          value={features.length}
        />

        <DashboardCard
          color="success"
          icon="bi-people"
          title="Groups"
          value={groups.length}
        />

        <DashboardCard
          color="warning"
          icon="bi-person"
          title="Users"
          value={users.length}
        />

        <DashboardCard
          color="info"
          icon="bi-globe"
          title="Environments"
          value={environments.length}
        />

        <DashboardCard
          color="success"
          icon="bi-check-circle"
          title="Enabled"
          value={enabled}
        />

        <DashboardCard
          color="danger"
          icon="bi-x-circle"
          title="Disabled"
          value={disabled}
        />

      </div>

      <div className="card mt-5">

        <div className="card-header">
          Recent Activity
        </div>

        <div className="card-body">

          <ul className="list-group list-group-flush">

            <li className="list-group-item">
              🚩 Feature Flags Created
            </li>

            <li className="list-group-item">
              👥 Groups Managed
            </li>

            <li className="list-group-item">
              🌍 Environments Updated
            </li>

          </ul>

        </div>

      </div>

    </div>
  );
}

function Dashboard() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard Works ✅</h1>
    </div>
  );
}

export default Dashboard;