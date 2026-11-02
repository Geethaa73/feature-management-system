import { useEffect, useState } from "react";
import api from "../services/api";

function Overrides() {
  const [overrides, setOverrides] = useState([]);
  const [features, setFeatures] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    feature_flag_id: "",
    environment_id: "",
    is_enabled: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const overrideRes = await api.get("/overrides/");
      const featureRes = await api.get("/feature-flags/");
      const environmentRes = await api.get("/environments/");

      setOverrides(overrideRes.data);
      setFeatures(featureRes.data);
      setEnvironments(environmentRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const saveOverride = async () => {
    try {
      await api.post("/overrides/", {
        feature_flag_id: Number(form.feature_flag_id),
        environment_id: Number(form.environment_id),
        is_enabled: form.is_enabled,
      });

      alert("Override Added Successfully!");

      setForm({
        feature_flag_id: "",
        environment_id: "",
        is_enabled: true,
      });

      loadData();

    } catch (err) {
      alert(JSON.stringify(err.response?.data));
    }
  };

  const filtered = overrides.filter((item) =>
    item.flag_id.toString().includes(search)
);
  return (
    <div className="container-fluid">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>⚙️ Environment Overrides</h2>

        <span className="badge bg-primary fs-6">
          Total : {overrides.length}
        </span>
      </div>

      <div className="card shadow mb-4">

        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            Add Override
          </h5>
        </div>

        <div className="card-body">

          <div className="row">

            <div className="col-md-4">

              <label>Feature</label>

              <select
                className="form-select"
                value={form.feature_flag_id}
                onChange={(e)=>
                  setForm({
                    ...form,
                    feature_flag_id:e.target.value
                  })
                }
              >

                <option value="">
                  Select Feature
                </option>

                {features.map(feature=>(
                  <option
                    key={feature.id}
                    value={feature.id}
                  >
                    {feature.key}
                  </option>
                ))}

              </select>

            </div>

            <div className="col-md-4">

              <label>Environment</label>

              <select
                className="form-select"
                value={form.environment_id}
                onChange={(e)=>
                  setForm({
                    ...form,
                    environment_id:e.target.value
                  })
                }
              >

                <option value="">
                  Select Environment
                </option>

                {environments.map(environment=>(
                  <option
                    key={environment.id}
                    value={environment.id}
                  >
                    {environment.name}
                  </option>
                ))}

              </select>

            </div>

            <div className="col-md-4">

              <label>Status</label>

              <select
                className="form-select"
                value={form.is_enabled}
                onChange={(e)=>
                  setForm({
                    ...form,
                    is_enabled:e.target.value==="true"
                  })
                }
              >

                <option value={true}>
                  Enabled
                </option>

                <option value={false}>
                  Disabled
                </option>

              </select>

            </div>

          </div>

          <br />

          <button
            className="btn btn-success"
            onClick={saveOverride}
          >
            Save Override
          </button>

        </div>

      </div>

      <div className="card shadow">

        <div className="card-header d-flex justify-content-between">

          <h5>All Overrides</h5>

          <input
            className="form-control"
            style={{width:"300px"}}
            placeholder="Search Feature ID..."
            value={search}
            onChange={(e)=>
              setSearch(e.target.value)
            }
          />

        </div>

        <div className="card-body">

          <table className="table table-striped table-hover">

            <thead className="table-dark">

              <tr>

                <th>ID</th>

                <th>Feature ID</th>

                <th>Environment ID</th>

                <th>Status</th>

              </tr>

            </thead>

            <tbody>

              {filtered.map((item)=>(

                <tr key={item.id}>

                  <td>{item.id}</td>

                  <td>{item.flag_id}</td>

                  <td>{item.environment_id}</td>

                  <td>

                    <span
                      className={
                        item.value
                        ? "badge bg-success"
                        : "badge bg-danger"
                      }
                    >
                      {item.value
                        ? "Enabled"
                        : "Disabled"}
                    </span>

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

export default Overrides;