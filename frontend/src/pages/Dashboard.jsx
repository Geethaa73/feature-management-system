import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import api from "../services/api";

import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import WelcomeBanner from "../components/WelcomeBanner";

import {
  MdDashboard,
  MdOutlineFlag,
  MdPeople,
  MdPublic,
  MdBolt,
  MdAdd,
  MdManageSearch,
  MdHistory,
} from "react-icons/md";

function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [stats, setStats] = useState({
    features: 0,
    users: 0,
    environments: 0,
    activeFeatures: 0,
  });

  const [currentUser, setCurrentUser] = useState(null);

  // ============================================================
  // GET LOGGED-IN USER
  // ============================================================

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await api.get("/auth/me");

        setCurrentUser(response.data);
      } catch (err) {
        /*
         * Fallback:
         * Try to read the JWT payload if /auth/me is unavailable.
         */

        try {
          const token = localStorage.getItem("token");

          if (!token) {
            return;
          }

          const payload = JSON.parse(
            atob(
              token
                .split(".")[1]
                .replace(/-/g, "+")
                .replace(/_/g, "/")
            )
          );

          setCurrentUser({
            username:
              payload.username ||
              payload.name ||
              payload.sub ||
              "",
            email: payload.email || "",
            role: payload.role || "",
          });
        } catch (tokenError) {
          console.error(
            "Unable to load current user:",
            tokenError
          );
        }
      }
    };

    loadCurrentUser();
  }, []);

  // ============================================================
  // LOAD DASHBOARD STATISTICS
  // ============================================================

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [
          features,
          users,
          environments,
        ] = await Promise.all([
          api.get("/feature-flags/"),
          api.get("/users/"),
          api.get("/environments/"),
        ]);

        setStats({
          features: features.data.length,
          users: users.data.length,
          environments: environments.data.length,
          activeFeatures: features.data.filter(
            (item) => item.enabled
          ).length,
        });
      } catch (error) {
        console.error(
          "Dashboard error:",
          error
        );
      }
    };

    loadStats();
  }, []);

  return (
    <div>

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <PageHeader
        title={t("navigation.dashboard")}
        description={t("dashboardDescription")}
        icon={<MdDashboard />}
        buttonText={t("createFeature")}
        onButtonClick={() =>
          navigate("/features")
        }
      />


      {/* ==================================================
          WELCOME BANNER
      ================================================== */}

      <WelcomeBanner
        username={
          currentUser?.username ||
          currentUser?.name ||
          currentUser?.email ||
          ""
        }
        role={currentUser?.role || ""}
      />


      {/* ==================================================
          STATISTICS
      ================================================== */}

      <div className="row g-4 mb-4">

        {/* TOTAL FEATURES */}

        <div className="col-md-3">

          <StatCard
            title={t("totalFeatures")}
            value={stats.features}
            subtitle={t("registeredFeatures")}
            icon={<MdOutlineFlag />}
            color="#14B8A6"
          />

        </div>


        {/* ACTIVE FEATURES */}

        <div className="col-md-3">

          <StatCard
            title={t("activeFeatures")}
            value={stats.activeFeatures}
            subtitle={t("enabledFeatures")}
            icon={<MdBolt />}
            color="#2563EB"
          />

        </div>


        {/* USERS */}

        <div className="col-md-3">

          <StatCard
            title={t("navigation.users")}
            value={stats.users}
            subtitle={t("registeredUsers")}
            icon={<MdPeople />}
            color="#0D9488"
          />

        </div>


        {/* ENVIRONMENTS */}

        <div className="col-md-3">

          <StatCard
            title={t("navigation.environments")}
            value={stats.environments}
            subtitle={t("deploymentAreas")}
            icon={<MdPublic />}
            color="#2563EB"
          />

        </div>

      </div>


      {/* ==================================================
          QUICK ACTIONS
      ================================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body p-4">

          <h4 className="mb-4">
            {t("quickActions")}
          </h4>

          <div className="row g-3">

            {/* CREATE FEATURE */}

            <div className="col-md-3">

              <button
                className="btn btn-light w-100 p-4"
                onClick={() =>
                  navigate("/features")
                }
              >

                <MdAdd
                  size={30}
                  style={{
                    color: "#14B8A6",
                  }}
                />

                <br />

                {t("createFeature")}

              </button>

            </div>


            {/* EVALUATE */}

            <div className="col-md-3">

              <button
                className="btn btn-light w-100 p-4"
                onClick={() =>
                  navigate("/evaluate")
                }
              >

                <MdManageSearch
                  size={30}
                  style={{
                    color: "#2563EB",
                  }}
                />

                <br />

                {t("navigation.evaluate")}

              </button>

            </div>


            {/* ENVIRONMENTS */}

            <div className="col-md-3">

              <button
                className="btn btn-light w-100 p-4"
                onClick={() =>
                  navigate("/environments")
                }
              >

                <MdPublic
                  size={30}
                  style={{
                    color: "#0D9488",
                  }}
                />

                <br />

                {t("navigation.environments")}

              </button>

            </div>


            {/* AUDIT LOGS */}

            <div className="col-md-3">

              <button
                className="btn btn-light w-100 p-4"
                onClick={() =>
                  navigate("/audit-logs")
                }
              >

                <MdHistory
                  size={30}
                  style={{
                    color: "#2563EB",
                  }}
                />

                <br />

                {t("navigation.auditLogs")}

              </button>

            </div>

          </div>

        </div>

      </div>


      {/* ==================================================
          SYSTEM HEALTH
      ================================================== */}

      <div className="card shadow-sm border-0">

        <div className="card-body p-4">

          <h4 className="mb-4">
            {t("systemHealth")}
          </h4>


          {/* DATABASE */}

          <div className="d-flex justify-content-between mb-3">

            <span>
              {t("database")}
            </span>

            <span className="badge bg-success">
              {t("healthy")}
            </span>

          </div>


          {/* API SERVER */}

          <div className="d-flex justify-content-between mb-3">

            <span>
              {t("apiServer")}
            </span>

            <span className="badge bg-success">
              {t("running")}
            </span>

          </div>


          {/* FEATURE ENGINE */}

          <div className="d-flex justify-content-between">

            <span>
              {t("featureEngine")}
            </span>

            <span className="badge bg-success">
              {t("active")}
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;