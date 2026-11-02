import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  MdAnalytics,
  MdOutlineFlag,
  MdBolt,
  MdPublic,
  MdTrendingUp,
  MdRefresh,
  MdCheckCircle,
  MdPercent,
  MdBarChart,
  MdToday,
  MdHistory,
} from "react-icons/md";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import api from "../services/api";
import PageHeader from "../components/PageHeader";


/* =====================================================
   FEATUREOPS DESIGN SYSTEM
===================================================== */

const COLORS = [
  "#14B8A6",
  "#0D9488",
  "#5EEAD4",
  "#2DD4BF",
  "#99F6E4",
  "#64748B",
];

const UI = {
  primary: "#14B8A6",
  primaryDark: "#0D9488",
  primarySoft: "#ECFDF9",

  background: "#F8FAFC",
  card: "#FFFFFF",

  text: "#0F172A",
  textSecondary: "#64748B",
  textLight: "#94A3B8",

  border: "#E2E8F0",
  borderLight: "#EEF2F7",

  success: "#22C55E",
  danger: "#EF4444",

  inactive: "#CBD5E1",

  shadow:
    "0 8px 28px rgba(15, 23, 42, 0.055)",
};


function Analysis() {
  const { t } = useTranslation();

  const [features, setFeatures] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [overrides, setOverrides] = useState([]);

  const [evaluationData, setEvaluationData] = useState([]);
  const [evaluationEnvironmentData, setEvaluationEnvironmentData] =
    useState([]);

  const [todayEvaluations, setTodayEvaluations] = useState(0);
  const [auditLogsToday, setAuditLogsToday] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");


  /* =====================================================
     LOAD ANALYTICS
  ===================================================== */

  const loadAnalytics = async () => {
    try {
      setError("");

      const [
        featuresResponse,
        environmentsResponse,
        overridesResponse,
        evaluationResponse,
        environmentUsageResponse,
        todayEvaluationsResponse,
        todayAuditLogsResponse,
      ] = await Promise.all([
        api.get("/feature-flags/"),
        api.get("/environments/"),
        api.get("/overrides/"),
        api.get("/analytics/flags"),
        api.get("/analytics/usage"),
        api.get("/analytics/today/evaluations"),
        api.get("/analytics/today/audit-logs"),
      ]);


      setFeatures(
        Array.isArray(featuresResponse.data)
          ? featuresResponse.data
          : []
      );


      setEnvironments(
        Array.isArray(environmentsResponse.data)
          ? environmentsResponse.data
          : []
      );


      setOverrides(
        Array.isArray(overridesResponse.data)
          ? overridesResponse.data
          : []
      );


      const normalizedEvaluationData = Array.isArray(
        evaluationResponse.data
      )
        ? evaluationResponse.data.map((item) => ({
            flag_id: item.flag_id,
            flag_key:
              item.flag_key ||
              item.feature_key ||
              item.key ||
              `Flag ${item.flag_id}`,
            evaluation_count: Number(
              item.evaluation_count || 0
            ),
          }))
        : [];


      const normalizedEnvironmentData = Array.isArray(
        environmentUsageResponse.data
      )
        ? environmentUsageResponse.data.map((item) => ({
            environment_id: item.environment_id,
            environment:
              item.environment ||
              item.environment_name ||
              `Environment ${item.environment_id}`,
            evaluation_count: Number(
              item.evaluation_count || 0
            ),
          }))
        : [];


      setEvaluationData(normalizedEvaluationData);

      setEvaluationEnvironmentData(
        normalizedEnvironmentData
      );


      setTodayEvaluations(
        Number(
          todayEvaluationsResponse?.data
            ?.today_evaluations || 0
        )
      );


      setAuditLogsToday(
        Number(
          todayAuditLogsResponse?.data
            ?.audit_logs_today || 0
        )
      );

    } catch (err) {
      console.error(
        "Failed to load analytics:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to load analytics data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    loadAnalytics();
  }, []);


  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
  };


  /* =====================================================
     CALCULATIONS
  ===================================================== */

  const totalFeatures = features.length;


  const activeFeatures = features.filter(
    (feature) =>
      feature.enabled === true ||
      feature.enabled === 1 ||
      feature.enabled === "true"
  ).length;


  const inactiveFeatures =
    totalFeatures - activeFeatures;


  const totalOverrides = overrides.length;


  const totalEvaluations = evaluationData.reduce(
    (total, item) =>
      total + Number(item.evaluation_count || 0),
    0
  );


  const evaluatedFlags = evaluationData.filter(
    (item) =>
      Number(item.evaluation_count || 0) > 0
  ).length;


  const mostEvaluatedFlag = useMemo(() => {
    if (!evaluationData.length) {
      return null;
    }

    return [...evaluationData].sort(
      (a, b) =>
        Number(b.evaluation_count || 0) -
        Number(a.evaluation_count || 0)
    )[0];
  }, [evaluationData]);


  const activationPercentage =
    totalFeatures > 0
      ? Math.round(
          (activeFeatures / totalFeatures) * 100
        )
      : 0;


  const overrideCoverage =
    totalFeatures > 0
      ? Math.min(
          Math.round(
            (totalOverrides / totalFeatures) * 100
          ),
          100
        )
      : 0;


  const featureStatusData = [
    {
      name: "Active",
      value: activeFeatures,
    },
    {
      name: "Inactive",
      value: inactiveFeatures,
    },
  ];


  const environmentOverrideData = useMemo(() => {
    return environments.map((environment) => {
      const environmentId = environment.id;

      const count = overrides.filter(
        (override) =>
          Number(
            override.environment_id ||
              override.environmentId
          ) === Number(environmentId)
      ).length;

      return {
        environment:
          environment.name ||
          `Environment ${environmentId}`,
        overrides: count,
      };
    });
  }, [environments, overrides]);


  const evaluationChartData = useMemo(() => {
    return [...evaluationData]
      .sort(
        (a, b) =>
          Number(b.evaluation_count || 0) -
          Number(a.evaluation_count || 0)
      )
      .slice(0, 10)
      .map((item) => ({
        name: item.flag_key,
        evaluations: Number(
          item.evaluation_count || 0
        ),
      }));
  }, [evaluationData]);


  const environmentUsageChartData = useMemo(() => {
    return evaluationEnvironmentData.map((item) => ({
      name: item.environment,
      value: Number(
        item.evaluation_count || 0
      ),
    }));
  }, [evaluationEnvironmentData]);


  /* =====================================================
     SHARED CARD STYLES
  ===================================================== */

  const cardStyle = {
    background: UI.card,
    borderRadius: "16px",
    padding: "22px",
    border: `1px solid ${UI.borderLight}`,
    boxShadow: UI.shadow,
    height: "100%",
  };


  const iconContainerStyle = {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: UI.primarySoft,
  };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="container-fluid py-4">

        <PageHeader
          title="Analytics"
          subtitle="Feature flag usage and system insights"
        />

        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            minHeight: "400px",
          }}
        >
          <div className="text-center">

            <div
              className="spinner-border"
              role="status"
              style={{
                width: "3rem",
                height: "3rem",
                color: UI.primary,
              }}
            />

            <p
              className="mt-3 mb-0"
              style={{
                color: UI.textSecondary,
              }}
            >
              Loading analytics...
            </p>

          </div>
        </div>

      </div>
    );
  }


  return (
    <div className="container-fluid py-4">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="analysis-page-header d-flex align-items-center gap-3 mb-4">
  <div className="analysis-page-header-icon">
    <MdAnalytics size={28} />
  </div>

  <div>
    <h2 className="analysis-page-title">
      Analytics
    </h2>

    <p className="analysis-page-subtitle">
      Monitor feature flag usage, environments and system activity
    </p>
  </div>
</div>

      {/* =================================================
          REFRESH
      ================================================= */}

      <div className="d-flex justify-content-end mb-4">

        <button
          type="button"
          className="btn analysis-refresh-button d-flex align-items-center gap-2"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <MdRefresh
            size={20}
            className={
              refreshing
                ? "spin-animation"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div
          className="alert d-flex align-items-center justify-content-between mb-4"
          role="alert"
          style={{
            background: "#FFFBEB",
            border: "1px solid #FDE68A",
            color: "#92400E",
            borderRadius: "12px",
          }}
        >

          <span>{error}</span>

          <button
            className="btn btn-sm btn-outline-dark"
            onClick={handleRefresh}
          >
            Retry
          </button>

        </div>
      )}


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="row g-4 mb-4">

        {/* TOTAL FLAGS */}

        <div className="col-12 col-sm-6 col-xl-3">

          <div
            className="analysis-card"
            style={cardStyle}
          >

            <div className="d-flex justify-content-between align-items-start">

              <div>

                <div className="analysis-label">
                  Total Flags
                </div>

                <div className="analysis-number">
                  {totalFeatures}
                </div>

                <div className="analysis-description">
                  Feature flags configured
                </div>

              </div>

              <div
                style={iconContainerStyle}
              >
                <MdOutlineFlag
                  size={27}
                  color={UI.primary}
                />
              </div>

            </div>

          </div>

        </div>


        {/* ACTIVE FLAGS */}

        <div className="col-12 col-sm-6 col-xl-3">

          <div
            className="analysis-card"
            style={cardStyle}
          >

            <div className="d-flex justify-content-between align-items-start">

              <div>

                <div className="analysis-label">
                  Active Flags
                </div>

                <div className="analysis-number">
                  {activeFeatures}
                </div>

                <div className="analysis-description">
                  {activationPercentage}% activation rate
                </div>

              </div>

              <div
                style={iconContainerStyle}
              >
                <MdCheckCircle
                  size={27}
                  color={UI.success}
                />
              </div>

            </div>

          </div>

        </div>


        {/* TODAY EVALUATIONS */}

        <div className="col-12 col-sm-6 col-xl-3">

          <div
            className="analysis-card"
            style={cardStyle}
          >

            <div className="d-flex justify-content-between align-items-start">

              <div>

                <div className="analysis-label">
                  Today's Evaluations
                </div>

                <div className="analysis-number">
                  {todayEvaluations}
                </div>

                <div className="analysis-description">
                  Evaluations recorded today
                </div>

              </div>

              <div
                style={iconContainerStyle}
              >
                <MdToday
                  size={27}
                  color="#0284C7"
                />
              </div>

            </div>

          </div>

        </div>


        {/* AUDIT LOGS */}

        <div className="col-12 col-sm-6 col-xl-3">

          <div
            className="analysis-card"
            style={cardStyle}
          >

            <div className="d-flex justify-content-between align-items-start">

              <div>

                <div className="analysis-label">
                  Audit Logs Today
                </div>

                <div className="analysis-number">
                  {auditLogsToday}
                </div>

                <div className="analysis-description">
                  Changes recorded today
                </div>

              </div>

              <div
                style={iconContainerStyle}
              >
                <MdHistory
                  size={27}
                  color={UI.primary}
                />
              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          EVALUATION ANALYTICS
      ================================================= */}

      <div className="row g-4 mb-4">

        {/* FEATURE EVALUATION COUNTS */}

        <div className="col-12 col-xl-8">

          <div style={cardStyle}>

            <div className="analysis-section-header">

              <div>

                <h5 className="analysis-title">
                  Feature Evaluation Counts
                </h5>

                <p className="analysis-subtitle">
                  Most frequently evaluated feature flags
                </p>

              </div>

              <div className="analysis-header-icon">
                <MdAnalytics />
              </div>

            </div>


            {evaluationChartData.length === 0 ? (

              <div
                className="d-flex justify-content-center align-items-center"
                style={{
                  height: "320px",
                }}
              >

                <div className="text-center">

                  <MdBarChart
                    size={48}
                    color={UI.inactive}
                  />

                  <p className="analysis-empty-text">
                    No evaluation data available
                  </p>

                </div>

              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <BarChart
                  data={evaluationChartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 60,
                  }}
                >

                  <XAxis
                    dataKey="name"
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    height={80}
                    tick={{
                      fontSize: 11,
                      fill: UI.textSecondary,
                    }}
                    axisLine={{
                      stroke: UI.border,
                    }}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fontSize: 12,
                      fill: UI.textSecondary,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: `1px solid ${UI.border}`,
                      boxShadow:
                        "0 8px 20px rgba(15,23,42,0.08)",
                    }}
                  />

                  <Bar
                    dataKey="evaluations"
                    name="Evaluations"
                    fill={UI.primary}
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>


        {/* ENVIRONMENT USAGE */}

        <div className="col-12 col-xl-4">

          <div style={cardStyle}>

            <div className="analysis-section-header">

              <div>

                <h5 className="analysis-title">
                  Environment Usage
                </h5>

                <p className="analysis-subtitle">
                  Evaluations by environment
                </p>

              </div>

              <div className="analysis-header-icon">
                <MdPublic />
              </div>

            </div>


            {environmentUsageChartData.length === 0 ? (

              <div
                className="d-flex justify-content-center align-items-center"
                style={{
                  height: "320px",
                }}
              >

                <div className="text-center">

                  <MdPublic
                    size={48}
                    color={UI.inactive}
                  />

                  <p className="analysis-empty-text">
                    No environment usage data
                  </p>

                </div>

              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <PieChart>

                  <Pie
                    data={
                      environmentUsageChartData
                    }
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={95}
                    innerRadius={45}
                    paddingAngle={3}
                  >

                    {environmentUsageChartData.map(
                      (_, index) => (
                        <Cell
                          key={`environment-cell-${index}`}
                          fill={
                            COLORS[
                              index %
                                COLORS.length
                            ]
                          }
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: `1px solid ${UI.border}`,
                      boxShadow:
                        "0 8px 20px rgba(15,23,42,0.08)",
                    }}
                  />

                  <Legend
                    verticalAlign="bottom"
                    height={36}
                  />

                </PieChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>

      </div>


      {/* =================================================
          SECONDARY ANALYTICS
      ================================================= */}

      <div className="row g-4 mb-4">

        {/* FEATURE STATUS */}

        <div className="col-12 col-lg-4">

          <div style={cardStyle}>

            <div className="analysis-section-header">

              <div>

                <h5 className="analysis-title">
                  Feature Status
                </h5>

                <p className="analysis-subtitle">
                  Active versus inactive flags
                </p>

              </div>

              <div className="analysis-header-icon">
                <MdOutlineFlag />
              </div>

            </div>


            {totalFeatures === 0 ? (

              <div
                className="d-flex justify-content-center align-items-center"
                style={{
                  height: "260px",
                }}
              >
                <span className="analysis-empty-text">
                  No feature flags available
                </span>
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height={260}
              >

                <PieChart>

                  <Pie
                    data={featureStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={85}
                    innerRadius={45}
                    paddingAngle={4}
                  >

                    <Cell
                      fill={UI.success}
                    />

                    <Cell
                      fill={UI.inactive}
                    />

                  </Pie>

                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: `1px solid ${UI.border}`,
                      boxShadow:
                        "0 8px 20px rgba(15,23,42,0.08)",
                    }}
                  />

                  <Legend
                    verticalAlign="bottom"
                    height={36}
                  />

                </PieChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>


        {/* ENVIRONMENT OVERRIDES */}

        <div className="col-12 col-lg-8">

          <div style={cardStyle}>

            <div className="analysis-section-header">

              <div>

                <h5 className="analysis-title">
                  Environment Overrides
                </h5>

                <p className="analysis-subtitle">
                  Override distribution across environments
                </p>

              </div>

              <div className="analysis-header-icon">
                <MdTrendingUp />
              </div>

            </div>


            {environmentOverrideData.length === 0 ? (

              <div
                className="d-flex justify-content-center align-items-center"
                style={{
                  height: "260px",
                }}
              >

                <span className="analysis-empty-text">
                  No environment data available
                </span>

              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height={260}
              >

                <BarChart
                  data={
                    environmentOverrideData
                  }
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 10,
                  }}
                >

                  <XAxis
                    dataKey="environment"
                    tick={{
                      fontSize: 11,
                      fill: UI.textSecondary,
                    }}
                    axisLine={{
                      stroke: UI.border,
                    }}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fontSize: 12,
                      fill: UI.textSecondary,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: `1px solid ${UI.border}`,
                      boxShadow:
                        "0 8px 20px rgba(15,23,42,0.08)",
                    }}
                  />

                  <Bar
                    dataKey="overrides"
                    name="Overrides"
                    fill={UI.primary}
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>

      </div>


      {/* =================================================
          EVALUATION DETAILS
      ================================================= */}

      <div className="row g-4 mb-4">

        <div className="col-12">

          <div style={cardStyle}>

            <div className="analysis-section-header mb-4">

              <div>

                <h5 className="analysis-title">
                  Evaluation Details
                </h5>

                <p className="analysis-subtitle">
                  Usage statistics for each feature flag
                </p>

              </div>

              <div className="analysis-header-icon">
                <MdAnalytics />
              </div>

            </div>


            {evaluationData.length === 0 ? (

              <div
                className="text-center py-5"
                style={{
                  color: UI.textSecondary,
                }}
              >

                <MdAnalytics
                  size={50}
                  color={UI.inactive}
                />

                <p className="mt-2 mb-0">
                  No feature evaluations recorded yet.
                </p>

              </div>

            ) : (

              <div className="table-responsive">

                <table className="table align-middle mb-0 analysis-table">

                  <thead>

                    <tr>

                      <th>
                        #
                      </th>

                      <th>
                        Feature Flag
                      </th>

                      <th>
                        Evaluations
                      </th>

                      <th>
                        Usage
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {evaluationData.map(
                      (item, index) => {

                        const count = Number(
                          item.evaluation_count ||
                            0
                        );


                        const usagePercentage =
                          totalEvaluations > 0
                            ? Math.round(
                                (count /
                                  totalEvaluations) *
                                  100
                              )
                            : 0;


                        return (
                          <tr
                            key={
                              item.flag_id ||
                              index
                            }
                          >

                            <td>
                              {index + 1}
                            </td>


                            <td>

                              <div
                                className="d-flex align-items-center gap-2"
                              >

                                <div className="analysis-flag-icon">

                                  <MdOutlineFlag
                                    size={18}
                                    color={UI.primary}
                                  />

                                </div>


                                <span className="analysis-flag-name">
                                  {item.flag_key}
                                </span>

                              </div>

                            </td>


                            <td>

                              <span className="analysis-count-badge">
                                {count}
                              </span>

                            </td>


                            <td
                              style={{
                                minWidth:
                                  "180px",
                              }}
                            >

                              <div
                                className="d-flex align-items-center gap-2"
                              >

                                <div
                                  className="progress flex-grow-1"
                                  style={{
                                    height:
                                      "7px",
                                    background:
                                      "#E2E8F0",
                                    borderRadius:
                                      "10px",
                                  }}
                                >

                                  <div
                                    className="progress-bar"
                                    role="progressbar"
                                    style={{
                                      width: `${usagePercentage}%`,
                                      background:
                                        UI.primary,
                                      borderRadius:
                                        "10px",
                                    }}
                                  />

                                </div>


                                <small className="analysis-percentage">
                                  {
                                    usagePercentage
                                  }
                                  %
                                </small>

                              </div>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      </div>


      {/* =================================================
          INSIGHT CARDS
      ================================================= */}

      <div className="row g-4 mb-4">

        {/* ACTIVATION RATE */}

        <div className="col-12 col-md-6">

          <div style={cardStyle}>

            <div className="d-flex align-items-center gap-3 mb-3">

              <div style={iconContainerStyle}>

                <MdPercent
                  size={27}
                  color={UI.success}
                />

              </div>

              <div>

                <h6 className="analysis-title-small">
                  Activation Rate
                </h6>

                <p className="analysis-subtitle">
                  Percentage of feature flags currently enabled
                </p>

              </div>

            </div>


            <div
              className="analysis-insight-number"
              style={{
                color: UI.success,
              }}
            >
              {activationPercentage}%
            </div>


            <div
              className="progress mt-2"
              style={{
                height: "8px",
                background: "#E2E8F0",
                borderRadius: "10px",
              }}
            >

              <div
                className="progress-bar"
                role="progressbar"
                style={{
                  width: `${activationPercentage}%`,
                  background: UI.success,
                  borderRadius: "10px",
                }}
              />

            </div>

          </div>

        </div>


        {/* OVERRIDE COVERAGE */}

        <div className="col-12 col-md-6">

          <div style={cardStyle}>

            <div className="d-flex align-items-center gap-3 mb-3">

              <div style={iconContainerStyle}>

                <MdBolt
                  size={27}
                  color={UI.primary}
                />

              </div>

              <div>

                <h6 className="analysis-title-small">
                  Override Coverage
                </h6>

                <p className="analysis-subtitle">
                  Environment-specific override coverage
                </p>

              </div>

            </div>


            <div
              className="analysis-insight-number"
              style={{
                color: UI.primary,
              }}
            >
              {overrideCoverage}%
            </div>


            <div
              className="progress mt-2"
              style={{
                height: "8px",
                background: "#E2E8F0",
                borderRadius: "10px",
              }}
            >

              <div
                className="progress-bar"
                role="progressbar"
                style={{
                  width: `${overrideCoverage}%`,
                  background: UI.primary,
                  borderRadius: "10px",
                }}
              />

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          ANALYSIS SUMMARY
      ================================================= */}

      <div className="row g-4">

        <div className="col-12">

          <div
            style={{
              ...cardStyle,
              background:
                "linear-gradient(135deg, #ECFDF9, #FFFFFF)",
            }}
          >

            <div className="d-flex align-items-center gap-3 mb-3">

              <div style={iconContainerStyle}>

                <MdAnalytics
                  size={28}
                  color={UI.primary}
                />

              </div>

              <div>

                <h5 className="analysis-title">
                  Analysis Summary
                </h5>

                <p className="analysis-subtitle">
                  Current feature management activity overview
                </p>

              </div>

            </div>


            <div className="row g-4">

              {/* MOST EVALUATED */}

              <div className="col-12 col-md-4">

                <div className="analysis-summary-box">

                  <div className="analysis-summary-label">
                    Most Evaluated Flag
                  </div>


                  <div className="analysis-summary-value">
                    {mostEvaluatedFlag
                      ? mostEvaluatedFlag.flag_key
                      : "No evaluations yet"}
                  </div>


                  {mostEvaluatedFlag && (
                    <div className="analysis-summary-description">
                      {
                        mostEvaluatedFlag.evaluation_count
                      }{" "}
                      evaluation
                      {Number(
                        mostEvaluatedFlag.evaluation_count
                      ) === 1
                        ? ""
                        : "s"}
                    </div>
                  )}

                </div>

              </div>


              {/* TOTAL OVERRIDES */}

              <div className="col-12 col-md-4">

                <div className="analysis-summary-box">

                  <div className="analysis-summary-label">
                    Total Overrides
                  </div>


                  <div className="analysis-summary-number">
                    {totalOverrides}
                  </div>


                  <div className="analysis-summary-description">
                    Across all environments
                  </div>

                </div>

              </div>


              {/* EVALUATED FLAGS */}

              <div className="col-12 col-md-4">

                <div className="analysis-summary-box">

                  <div className="analysis-summary-label">
                    Evaluated Flags
                  </div>


                  <div className="analysis-summary-number">
                    {evaluatedFlags}
                  </div>


                  <div className="analysis-summary-description">
                    Flags with recorded evaluations
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          PAGE STYLES
      ================================================= */}

      <style>
        {`
          .analysis-page-header {
  margin-bottom: 24px;
}

.analysis-page-header-icon {
  width: 52px;
  height: 52px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 14px;

  background: ${UI.primary};
  color: #ffffff;

  flex-shrink: 0;

  box-shadow:
    0 6px 16px rgba(20, 184, 166, 0.18);
}

.analysis-page-title {
  margin: 0;
  color: ${UI.text};
  font-size: 26px;
  font-weight: 750;
  letter-spacing: -0.5px;
}

.analysis-page-subtitle {
  margin: 4px 0 0;
  color: ${UI.textSecondary};
  font-size: 14px;
}

          .analysis-refresh-button {
            background: ${UI.primary};
            color: #ffffff;
            border: none;
            border-radius: 10px;
            padding: 9px 16px;
            font-weight: 600;
            transition:
              background 0.18s ease,
              transform 0.18s ease,
              box-shadow 0.18s ease;
          }

          .analysis-refresh-button:hover {
            background: ${UI.primaryDark};
            color: #ffffff;
            transform: translateY(-1px);
            box-shadow:
              0 6px 16px rgba(20, 184, 166, 0.20);
          }

          .analysis-refresh-button:disabled {
            opacity: 0.75;
            cursor: not-allowed;
          }


          .analysis-card {
            transition:
              transform 0.18s ease,
              box-shadow 0.18s ease;
          }

          .analysis-card:hover {
            transform: translateY(-2px);
            box-shadow:
              0 12px 32px rgba(15, 23, 42, 0.075) !important;
          }


          .analysis-label {
            color: ${UI.textSecondary};
            font-size: 14px;
            font-weight: 500;
          }
            .analysis-page-header-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
}

.analysis-page-title {
  font-size: 22px;
}


          .analysis-number {
            font-size: 32px;
            font-weight: 750;
            line-height: 1.1;
            color: ${UI.text};
            margin-top: 8px;
            letter-spacing: -0.7px;
          }


          .analysis-description {
            font-size: 13px;
            color: ${UI.textSecondary};
            margin-top: 6px;
          }


          .analysis-section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }


          .analysis-title {
            margin-bottom: 4px;
            font-weight: 700;
            color: ${UI.text};
            font-size: 17px;
            letter-spacing: -0.2px;
          }


          .analysis-title-small {
            margin-bottom: 4px;
            font-weight: 700;
            color: ${UI.text};
            font-size: 15px;
          }


          .analysis-subtitle {
            margin-bottom: 0;
            font-size: 13px;
            color: ${UI.textSecondary};
          }


          .analysis-header-icon {
            width: 40px;
            height: 40px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 10px;

            background: ${UI.primarySoft};
            color: ${UI.primary};

            font-size: 23px;
          }


          .analysis-empty-text {
            color: ${UI.textSecondary};
            font-size: 13px;
          }


          .analysis-table {
            --bs-table-border-color: ${UI.borderLight};
          }


          .analysis-table thead th {
            color: ${UI.textSecondary};
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.45px;
            padding-top: 0;
            padding-bottom: 12px;
            border-bottom: 1px solid ${UI.border};
          }


          .analysis-table tbody td {
            color: ${UI.textSecondary};
            font-size: 13px;
            padding-top: 13px;
            padding-bottom: 13px;
            border-bottom: 1px solid ${UI.borderLight};
          }


          .analysis-table tbody tr {
            transition:
              background 0.15s ease;
          }


          .analysis-table tbody tr:hover {
            background: ${UI.primarySoft};
          }


          .analysis-flag-icon {
            width: 34px;
            height: 34px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 9px;

            background: ${UI.primarySoft};
          }


          .analysis-flag-name {
            color: ${UI.text};
            font-weight: 600;
          }


          .analysis-count-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;

            min-width: 38px;

            padding: 6px 9px;

            border-radius: 8px;

            background: ${UI.primarySoft};
            color: ${UI.primaryDark};

            font-weight: 700;
            font-size: 12px;
          }


          .analysis-percentage {
            color: ${UI.textSecondary};
            min-width: 38px;
          }


          .analysis-insight-number {
            font-size: 34px;
            font-weight: 750;
            letter-spacing: -0.8px;
          }


          .analysis-summary-box {
            padding: 16px;

            border-radius: 12px;

            background: #ffffff;

            border:
              1px solid ${UI.borderLight};

            transition:
              border-color 0.18s ease,
              transform 0.18s ease;
          }


          .analysis-summary-box:hover {
            border-color:
              rgba(20, 184, 166, 0.28);

            transform: translateY(-1px);
          }


          .analysis-summary-label {
            font-size: 13px;
            color: ${UI.textSecondary};
            margin-bottom: 6px;
          }


          .analysis-summary-value {
            font-weight: 700;
            color: ${UI.primaryDark};
            word-break: break-word;
          }


          .analysis-summary-number {
            font-size: 24px;
            font-weight: 750;
            color: ${UI.text};
          }


          .analysis-summary-description {
            font-size: 12px;
            color: ${UI.textSecondary};
            margin-top: 5px;
          }


          .spin-animation {
            animation:
              analysisSpin 1s linear infinite;
          }


          @keyframes analysisSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }


          @media (max-width: 768px) {

            .analysis-number {
              font-size: 28px;
            }

            .analysis-section-header {
              align-items: flex-start;
            }

            .analysis-header-icon {
              width: 36px;
              height: 36px;
              font-size: 20px;
            }

          }

        `}
      </style>

    </div>
  );
}


export default Analysis;