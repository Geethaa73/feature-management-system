import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const login = async () => {

  try {

    const response = await api.post("/auth/login", {

      email: email,
      password: password,

    });

    console.log(response.data);

    localStorage.setItem(
      "token",
      response.data.access_token
    );

    navigate("/dashboard");

  } catch (err) {

    console.log(err.response);

    alert("Invalid Email or Password");

  }

};

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#4f46e5,#06b6d4)",
      }}
    >

      <div
        className="card shadow-lg"
        style={{
          width: "420px",
          borderRadius: "20px",
        }}
      >

        <div className="card-body p-5">

          <div className="text-center mb-4">

            <h1>🚀</h1>

            <h3>Feature Manager</h3>

            <p className="text-muted">
              Sign in to continue
            </p>

          </div>

          <div className="mb-3">

            <label>Email</label>

            <input
              type="email"
              className="form-control"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </div>

          <div className="mb-3">

            <label>Password</label>

            <div className="input-group">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                className="form-control"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

              <button
                className="btn btn-outline-secondary"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "🙈" : "👁"}
              </button>

            </div>

          </div>

          <button
            className="btn btn-primary w-100"
            onClick={login}
          >
            Login
          </button>

          <hr />

          <div className="text-center text-muted">

            Feature Management &
            Release Control System

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;