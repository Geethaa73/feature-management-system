import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

import {
  MdRule,
  MdFlag,
  MdPerson,
  MdGroups,
  MdAdd,
  MdSearch,
  MdDelete,
  MdClose,
  MdRefresh,
  MdSave,
  MdFilterList,
} from "react-icons/md";

function TargetingRules() {
  // ============================================================
  // STATE
  // ============================================================

  const [features, setFeatures] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);

  const [rules, setRules] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [form, setForm] = useState({
    feature_flag_id: "",
    rule_type: "user",
    rule_value: "",
  });

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  // ============================================================
  // LOAD ALL DATA
  // ============================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setMessage({
        type: "",
        text: "",
      });

      // Load features, users and groups
      const [
        featureResponse,
        userResponse,
        groupResponse,
      ] = await Promise.all([
        api.get("/feature-flags/"),
        api.get("/users/"),
        api.get("/groups/"),
      ]);

      const featureData = Array.isArray(
        featureResponse.data
      )
        ? featureResponse.data
        : [];

      const userData = Array.isArray(
        userResponse.data
      )
        ? userResponse.data
        : [];

      const groupData = Array.isArray(
        groupResponse.data
      )
        ? groupResponse.data
        : [];

      setFeatures(featureData);
      setUsers(userData);
      setGroups(groupData);

      // --------------------------------------------------------
      // IMPORTANT:
      // Backend does NOT have GET /targeting-rules/
      //
      // It has:
      // GET /targeting-rules/flag/{feature_flag_id}
      //
      // Therefore we load rules separately for every feature.
      // --------------------------------------------------------

      if (featureData.length === 0) {
        setRules([]);
        return;
      }

      const ruleRequests = featureData.map(
        (feature) =>
          api
            .get(
              `/targeting-rules/flag/${feature.id}`
            )
            .then((response) => ({
              feature,
              rules: Array.isArray(
                response.data
              )
                ? response.data
                : [],
            }))
            .catch((err) => {
              console.error(
                `Failed to load rules for feature ${feature.id}:`,
                err
              );

              return {
                feature,
                rules: [],
              };
            })
      );

      const ruleResults = await Promise.all(
        ruleRequests
      );

      const allRules = [];

      ruleResults.forEach(
        ({ feature, rules: featureRules }) => {
          featureRules.forEach((rule) => {
            allRules.push({
              ...rule,
              feature_key:
                feature.key ||
                feature.name ||
                `Feature #${feature.id}`,
            });
          });
        }
      );

      setRules(allRules);
    } catch (err) {
      console.error(
        "Targeting Rules load error:",
        err.response?.data || err
      );

      setMessage({
        type: "danger",
        text:
          err.response?.data?.detail ||
          "Failed to load targeting rules.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // CREATE TARGETING RULE
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.feature_flag_id) {
      setMessage({
        type: "danger",
        text: "Please select a feature flag.",
      });

      return;
    }

    if (!form.rule_value) {
      setMessage({
        type: "danger",
        text:
          form.rule_type === "user"
            ? "Please select a user."
            : "Please select a group.",
      });

      return;
    }

    try {
      setSaving(true);

      setMessage({
        type: "",
        text: "",
      });

      // This EXACTLY matches TargetingRuleCreate:
      //
      // feature_flag_id: int
      // rule_type: str
      // rule_value: str

      const payload = {
        feature_flag_id: Number(
          form.feature_flag_id
        ),
        rule_type: form.rule_type,
        rule_value: form.rule_value,
      };

      await api.post(
        "/targeting-rules/",
        payload
      );

      setMessage({
        type: "success",
        text:
          "Targeting rule created successfully.",
      });

      setForm({
        feature_flag_id: "",
        rule_type: "user",
        rule_value: "",
      });

      setShowForm(false);

      await loadData();
    } catch (err) {
      console.error(
        "Create targeting rule error:",
        err.response?.data || err
      );

      setMessage({
        type: "danger",
        text:
          err.response?.data?.detail ||
          "Failed to create targeting rule.",
      });
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE TARGETING RULE
  // ============================================================

  const handleDelete = async (ruleId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this targeting rule?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/targeting-rules/${ruleId}`
      );

      setMessage({
        type: "success",
        text:
          "Targeting rule deleted successfully.",
      });

      await loadData();
    } catch (err) {
      console.error(
        "Delete targeting rule error:",
        err.response?.data || err
      );

      setMessage({
        type: "danger",
        text:
          err.response?.data?.detail ||
          "Failed to delete targeting rule.",
      });
    }
  };

  // ============================================================
  // CLOSE FORM
  // ============================================================

  const closeForm = () => {
    setShowForm(false);

    setForm({
      feature_flag_id: "",
      rule_type: "user",
      rule_value: "",
    });
  };

  // ============================================================
  // STATISTICS
  // ============================================================

  const userRuleCount = rules.filter(
    (rule) =>
      rule.rule_type === "user"
  ).length;

  const groupRuleCount = rules.filter(
    (rule) =>
      rule.rule_type === "group"
  ).length;

  // ============================================================
  // FILTER RULES
  // ============================================================

  const filteredRules = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    return rules.filter((rule) => {
      const matchesType =
        filterType === "all" ||
        rule.rule_type === filterType;

      const matchesSearch =
        !search ||
        String(
          rule.feature_key || ""
        )
          .toLowerCase()
          .includes(search) ||
        String(
          rule.rule_type || ""
        )
          .toLowerCase()
          .includes(search) ||
        String(
          rule.rule_value || ""
        )
          .toLowerCase()
          .includes(search);

      return (
        matchesType &&
        matchesSearch
      );
    });
  }, [
    rules,
    searchTerm,
    filterType,
  ]);

  // ============================================================
  // FIND USER
  // ============================================================

  const getUserName = (username) => {
    const user = users.find(
      (item) =>
        item.username === username
    );

    return (
      user?.username ||
      username
    );
  };

  // ============================================================
  // FIND GROUP
  // ============================================================

  const getGroupName = (groupName) => {
    const group = groups.find(
      (item) =>
        item.name === groupName
    );

    return (
      group?.name ||
      groupName
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      style={{
        paddingBottom: "40px",
      }}
    >

      {/* ====================================================== */}
      {/* PAGE HEADER */}
      {/* ====================================================== */}

      <div
        className="d-flex align-items-start mb-5"
        style={{
          gap: "20px",
        }}
      >
        <div
          style={{
            width: "74px",
            height: "74px",
            minWidth: "74px",
            borderRadius: "18px",
            background: "#14B8A6",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MdRule size={40} />
        </div>

        <div>
          <h1
            className="mb-2"
            style={{
              fontSize: "42px",
              fontWeight: "700",
              color: "#1E293B",
              lineHeight: "1.15",
            }}
          >
            Targeting Rules
          </h1>

          <p
            className="mb-0"
            style={{
              fontSize: "20px",
              color: "#64748B",
            }}
          >
            Manage user and group targeting
            rules for feature flags
          </p>
        </div>
      </div>


      {/* ====================================================== */}
      {/* MESSAGE */}
      {/* ====================================================== */}

      {message.text && (
        <div
          className={`alert alert-${message.type} d-flex justify-content-between align-items-center`}
          role="alert"
        >
          <span>
            {message.text}
          </span>

          <button
            type="button"
            className="btn-close"
            onClick={() =>
              setMessage({
                type: "",
                text: "",
              })
            }
          />
        </div>
      )}


      {/* ====================================================== */}
      {/* STATISTICS */}
      {/* ====================================================== */}

      <div className="row g-4 mb-4">

        {/* FEATURE FLAGS */}

        <div className="col-md-4">
          <div
            className="h-100"
            style={{
              background: "#ECFDF5",
              border:
                "1px solid #A7F3D0",
              borderRadius: "14px",
              padding:
                "25px 28px",
              boxShadow:
                "0 4px 12px rgba(15,23,42,0.06)",
            }}
          >
            <div
              className="d-flex align-items-center"
              style={{
                gap: "20px",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "#FFFFFF",
                  color: "#14B8A6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow:
                    "0 2px 6px rgba(0,0,0,0.05)",
                }}
              >
                <MdFlag size={30} />
              </div>

              <div>
                <div
                  style={{
                    color: "#475569",
                    fontSize: "16px",
                    marginBottom: "4px",
                  }}
                >
                  Feature Flags
                </div>

                <div
                  style={{
                    color: "#0F172A",
                    fontSize: "32px",
                    fontWeight: "700",
                    lineHeight: "1",
                  }}
                >
                  {features.length}
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* USER RULES */}

        <div className="col-md-4">
          <div
            className="h-100"
            style={{
              background: "#EFF6FF",
              border:
                "1px solid #BFDBFE",
              borderRadius: "14px",
              padding:
                "25px 28px",
              boxShadow:
                "0 4px 12px rgba(15,23,42,0.06)",
            }}
          >
            <div
              className="d-flex align-items-center"
              style={{
                gap: "20px",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "#FFFFFF",
                  color: "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow:
                    "0 2px 6px rgba(0,0,0,0.05)",
                }}
              >
                <MdPerson size={30} />
              </div>

              <div>
                <div
                  style={{
                    color: "#475569",
                    fontSize: "16px",
                    marginBottom: "4px",
                  }}
                >
                  User Rules
                </div>

                <div
                  style={{
                    color: "#0F172A",
                    fontSize: "32px",
                    fontWeight: "700",
                    lineHeight: "1",
                  }}
                >
                  {userRuleCount}
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* GROUP RULES */}

        <div className="col-md-4">
          <div
            className="h-100"
            style={{
              background: "#F5F3FF",
              border:
                "1px solid #DDD6FE",
              borderRadius: "14px",
              padding:
                "25px 28px",
              boxShadow:
                "0 4px 12px rgba(15,23,42,0.06)",
            }}
          >
            <div
              className="d-flex align-items-center"
              style={{
                gap: "20px",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "#FFFFFF",
                  color: "#7C3AED",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow:
                    "0 2px 6px rgba(0,0,0,0.05)",
                }}
              >
                <MdGroups size={30} />
              </div>

              <div>
                <div
                  style={{
                    color: "#475569",
                    fontSize: "16px",
                    marginBottom: "4px",
                  }}
                >
                  Group Rules
                </div>

                <div
                  style={{
                    color: "#0F172A",
                    fontSize: "32px",
                    fontWeight: "700",
                    lineHeight: "1",
                  }}
                >
                  {groupRuleCount}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>


      {/* ====================================================== */}
      {/* CREATE BUTTON */}
      {/* ====================================================== */}

      <div
        className="d-flex justify-content-end mb-4"
      >
        <button
          className="btn"
          onClick={() =>
            setShowForm(
              (previous) => !previous
            )
          }
          style={{
            background: "#14B8A6",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "10px",
            padding:
              "11px 20px",
            fontWeight: "600",
          }}
        >
          {showForm ? (
            <>
              <MdClose
                size={20}
                className="me-1"
              />
              Close
            </>
          ) : (
            <>
              <MdAdd
                size={20}
                className="me-1"
              />
              Create Rule
            </>
          )}
        </button>
      </div>


      {/* ====================================================== */}
      {/* CREATE RULE FORM */}
      {/* ====================================================== */}

      {showForm && (
        <div
          className="card border-0 shadow-sm mb-4"
          style={{
            borderRadius: "16px",
          }}
        >
          <div className="card-body p-4">

            <div
              className="d-flex align-items-center mb-4"
              style={{
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "#ECFDF5",
                  color: "#14B8A6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MdRule size={25} />
              </div>

              <div>
                <h4
                  className="mb-1"
                  style={{
                    fontWeight: "700",
                  }}
                >
                  Create Targeting Rule
                </h4>

                <p className="text-muted mb-0">
                  Select a feature and define
                  which user or group should
                  receive it.
                </p>
              </div>
            </div>


            <form
              onSubmit={handleSubmit}
            >
              <div className="row g-4">

                {/* FEATURE FLAG */}

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Feature Flag
                  </label>

                  <select
                    className="form-select"
                    name="feature_flag_id"
                    value={
                      form.feature_flag_id
                    }
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select feature flag
                    </option>

                    {features.map(
                      (feature) => (
                        <option
                          key={feature.id}
                          value={feature.id}
                        >
                          {feature.key ||
                            feature.name ||
                            `Feature #${feature.id}`}
                        </option>
                      )
                    )}
                  </select>
                </div>


                {/* RULE TYPE */}

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Rule Type
                  </label>

                  <select
                    className="form-select"
                    name="rule_type"
                    value={
                      form.rule_type
                    }
                    onChange={(event) => {
                      handleChange(event);

                      setForm(
                        (previous) => ({
                          ...previous,
                          rule_type:
                            event.target
                              .value,
                          rule_value:
                            "",
                        })
                      );
                    }}
                  >
                    <option value="user">
                      User Rule
                    </option>

                    <option value="group">
                      Group Rule
                    </option>
                  </select>
                </div>


                {/* USER */}

                {form.rule_type ===
                  "user" && (
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      User
                    </label>

                    <select
                      className="form-select"
                      name="rule_value"
                      value={
                        form.rule_value
                      }
                      onChange={
                        handleChange
                      }
                      required
                    >
                      <option value="">
                        Select user
                      </option>

                      {users.map(
                        (user) => (
                          <option
                            key={user.id}
                            value={
                              user.username
                            }
                          >
                            {user.username}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                )}


                {/* GROUP */}

                {form.rule_type ===
                  "group" && (
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Group
                    </label>

                    <select
                      className="form-select"
                      name="rule_value"
                      value={
                        form.rule_value
                      }
                      onChange={
                        handleChange
                      }
                      required
                    >
                      <option value="">
                        Select group
                      </option>

                      {groups.map(
                        (group) => (
                          <option
                            key={group.id}
                            value={
                              group.name
                            }
                          >
                            {group.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                )}


                {/* INFORMATION */}

                <div className="col-12">
                  <div
                    style={{
                      background: "#F8FAFC",
                      border:
                        "1px solid #E2E8F0",
                      borderRadius: "12px",
                      padding: "15px",
                    }}
                  >
                    <div
                      className="d-flex align-items-center"
                      style={{
                        gap: "10px",
                      }}
                    >
                      {form.rule_type ===
                      "user" ? (
                        <MdPerson
                          size={22}
                          color="#2563EB"
                        />
                      ) : (
                        <MdGroups
                          size={22}
                          color="#7C3AED"
                        />
                      )}

                      <span
                        style={{
                          color:
                            "#475569",
                        }}
                      >
                        This rule will target{" "}
                        <strong>
                          {form.rule_type ===
                          "user"
                            ? "one specific user"
                            : "one specific group"}
                        </strong>
                        .
                      </span>
                    </div>
                  </div>
                </div>


                {/* BUTTONS */}

                <div className="col-12">

                  <button
                    type="submit"
                    className="btn me-2"
                    disabled={saving}
                    style={{
                      background:
                        "#14B8A6",
                      color:
                        "#FFFFFF",
                      borderRadius:
                        "10px",
                      fontWeight:
                        "600",
                      padding:
                        "10px 18px",
                    }}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <MdSave
                          size={19}
                          className="me-1"
                        />
                        Save Rule
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={
                      closeForm
                    }
                    disabled={saving}
                    style={{
                      borderRadius:
                        "10px",
                      padding:
                        "10px 18px",
                    }}
                  >
                    Cancel
                  </button>

                </div>

              </div>
            </form>

          </div>
        </div>
      )}


      {/* ====================================================== */}
      {/* RULES CARD */}
      {/* ====================================================== */}

      <div
        className="card border-0 shadow-sm"
        style={{
          borderRadius: "16px",
        }}
      >
        <div className="card-body p-4">

          {/* CARD HEADER */}

          <div
            className="d-flex justify-content-between align-items-center flex-wrap mb-4"
            style={{
              gap: "15px",
            }}
          >
            <div>
              <h4
                className="mb-1"
                style={{
                  fontWeight: "700",
                }}
              >
                Targeting Rules
              </h4>

              <p className="text-muted mb-0">
                Manage rules assigned to your
                feature flags.
              </p>
            </div>

            <button
              className="btn btn-light"
              onClick={loadData}
              disabled={loading}
              style={{
                borderRadius: "10px",
              }}
            >
              <MdRefresh
                size={19}
                className="me-1"
              />
              Refresh
            </button>
          </div>


          {/* SEARCH / FILTER */}

          <div className="row g-3 mb-4">

            <div className="col-md-8">
              <div className="input-group">

                <span
                  className="input-group-text"
                  style={{
                    background:
                      "#FFFFFF",
                  }}
                >
                  <MdSearch />
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by feature, type or target..."
                  value={
                    searchTerm
                  }
                  onChange={(event) =>
                    setSearchTerm(
                      event.target
                        .value
                    )
                  }
                />

              </div>
            </div>


            <div className="col-md-4">
              <div className="input-group">

                <span
                  className="input-group-text"
                  style={{
                    background:
                      "#FFFFFF",
                  }}
                >
                  <MdFilterList />
                </span>

                <select
                  className="form-select"
                  value={
                    filterType
                  }
                  onChange={(event) =>
                    setFilterType(
                      event.target
                        .value
                    )
                  }
                >
                  <option value="all">
                    All Rules
                  </option>

                  <option value="user">
                    User Rules
                  </option>

                  <option value="group">
                    Group Rules
                  </option>
                </select>

              </div>
            </div>

          </div>


          {/* LOADING */}

          {loading ? (
            <div
              className="text-center py-5"
            >
              <div
                className="spinner-border"
                style={{
                  color: "#14B8A6",
                }}
              />

              <p className="text-muted mt-3 mb-0">
                Loading targeting rules...
              </p>
            </div>
          ) : filteredRules.length ===
            0 ? (

            /* EMPTY STATE */

            <div
              className="text-center py-5"
              style={{
                background:
                  "#F8FAFC",
                borderRadius:
                  "12px",
              }}
            >
              <MdRule
                size={55}
                style={{
                  color:
                    "#CBD5E1",
                }}
              />

              <h5
                className="mt-3"
                style={{
                  fontWeight:
                    "700",
                }}
              >
                No targeting rules yet
              </h5>

              <p className="text-muted mb-3">
                Create a user or group rule
                to control feature access.
              </p>

              <button
                className="btn"
                onClick={() =>
                  setShowForm(true)
                }
                style={{
                  background:
                    "#14B8A6",
                  color:
                    "#FFFFFF",
                  borderRadius:
                    "10px",
                  fontWeight:
                    "600",
                }}
              >
                <MdAdd
                  size={19}
                  className="me-1"
                />
                Create Rule
              </button>
            </div>

          ) : (

            /* RULE TABLE */

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead>
                  <tr>

                    <th
                      style={{
                        color:
                          "#64748B",
                        fontSize:
                          "13px",
                        fontWeight:
                          "600",
                      }}
                    >
                      #
                    </th>

                    <th
                      style={{
                        color:
                          "#64748B",
                        fontSize:
                          "13px",
                        fontWeight:
                          "600",
                      }}
                    >
                      Feature Flag
                    </th>

                    <th
                      style={{
                        color:
                          "#64748B",
                        fontSize:
                          "13px",
                        fontWeight:
                          "600",
                      }}
                    >
                      Rule Type
                    </th>

                    <th
                      style={{
                        color:
                          "#64748B",
                        fontSize:
                          "13px",
                        fontWeight:
                          "600",
                      }}
                    >
                      Target
                    </th>

                    <th
                      className="text-end"
                      style={{
                        color:
                          "#64748B",
                        fontSize:
                          "13px",
                        fontWeight:
                          "600",
                      }}
                    >
                      Actions
                    </th>

                  </tr>
                </thead>


                <tbody>

                  {filteredRules.map(
                    (
                      rule,
                      index
                    ) => {

                      const isUser =
                        rule.rule_type ===
                        "user";

                      return (
                        <tr
                          key={
                            rule.id
                          }
                        >

                          {/* NUMBER */}

                          <td
                            style={{
                              color:
                                "#94A3B8",
                            }}
                          >
                            {index +
                              1}
                          </td>


                          {/* FEATURE */}

                          <td>
                            <div
                              className="d-flex align-items-center"
                              style={{
                                gap:
                                  "10px",
                              }}
                            >
                              <div
                                style={{
                                  width:
                                    "38px",
                                  height:
                                    "38px",
                                  borderRadius:
                                    "10px",
                                  background:
                                    "#ECFDF5",
                                  color:
                                    "#14B8A6",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                }}
                              >
                                <MdFlag
                                  size={
                                    20
                                  }
                                />
                              </div>

                              <div>
                                <div
                                  style={{
                                    fontWeight:
                                      "600",
                                    color:
                                      "#1E293B",
                                  }}
                                >
                                  {
                                    rule.feature_key
                                  }
                                </div>

                                <small
                                  style={{
                                    color:
                                      "#94A3B8",
                                  }}
                                >
                                  Feature ID:{" "}
                                  {
                                    rule.feature_flag_id
                                  }
                                </small>
                              </div>
                            </div>
                          </td>


                          {/* TYPE */}

                          <td>

                            {isUser ? (
                              <span
                                className="badge"
                                style={{
                                  background:
                                    "#EFF6FF",
                                  color:
                                    "#2563EB",
                                  padding:
                                    "7px 10px",
                                  fontWeight:
                                    "600",
                                }}
                              >
                                <MdPerson
                                  size={
                                    15
                                  }
                                  className="me-1"
                                />
                                User Rule
                              </span>
                            ) : (
                              <span
                                className="badge"
                                style={{
                                  background:
                                    "#F5F3FF",
                                  color:
                                    "#7C3AED",
                                  padding:
                                    "7px 10px",
                                  fontWeight:
                                    "600",
                                }}
                              >
                                <MdGroups
                                  size={
                                    15
                                  }
                                  className="me-1"
                                />
                                Group Rule
                              </span>
                            )}

                          </td>


                          {/* TARGET */}

                          <td>

                            <div
                              className="d-flex align-items-center"
                              style={{
                                gap:
                                  "8px",
                              }}
                            >

                              {isUser ? (
                                <MdPerson
                                  size={
                                    21
                                  }
                                  color="#2563EB"
                                />
                              ) : (
                                <MdGroups
                                  size={
                                    21
                                  }
                                  color="#7C3AED"
                                />
                              )}

                              <strong
                                style={{
                                  color:
                                    "#334155",
                                }}
                              >
                                {isUser
                                  ? getUserName(
                                      rule.rule_value
                                    )
                                  : getGroupName(
                                      rule.rule_value
                                    )}
                              </strong>

                            </div>

                          </td>


                          {/* DELETE */}

                          <td className="text-end">

                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() =>
                                handleDelete(
                                  rule.id
                                )
                              }
                              title="Delete targeting rule"
                            >
                              <MdDelete
                                size={
                                  18
                                }
                                className="me-1"
                              />
                              Delete
                            </button>

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
  );
}

export default TargetingRules;