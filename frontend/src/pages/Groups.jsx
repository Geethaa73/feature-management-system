
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { success, error } from "../utils/toast";

import PageHeader from "../components/PageHeader";

import {
  MdGroup,
  MdAdd,
  MdSearch,
  MdDelete,
  MdRefresh,
  MdPeople,
  MdClose,
  MdVisibility,
  MdEmail,
} from "react-icons/md";

function Groups() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // MEMBERS MODAL
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // --------------------------------------------------
  // LOAD GROUPS
  // --------------------------------------------------

  const loadGroups = async () => {
    try {
      setLoading(true);

      const response = await api.get("/groups/");

      setGroups(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Group loading error:",
        err.response?.data || err
      );

      error(
        err.response?.data?.detail ||
          "Failed to load groups"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  // --------------------------------------------------
  // CREATE GROUP
  // --------------------------------------------------

  const addGroup = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      error("Please enter a group name");
      return;
    }

    setCreating(true);

    try {
      await api.post("/groups/", {
        name: trimmedName,
      });

      success("Group created successfully");

      setName("");

      await loadGroups();
    } catch (err) {
      console.error(
        "Group creation error:",
        err.response?.data || err
      );

      error(
        err.response?.data?.detail ||
          "Failed to create group"
      );
    } finally {
      setCreating(false);
    }
  };

  // --------------------------------------------------
  // DELETE GROUP
  // --------------------------------------------------

  const deleteGroup = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this group?"
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      await api.delete(`/groups/${id}`);

      success("Group deleted successfully");

      await loadGroups();
    } catch (err) {
      console.error(
        "Group deletion error:",
        err.response?.data || err
      );

      error(
        err.response?.data?.detail ||
          "Failed to delete group"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // --------------------------------------------------
  // LOAD GROUP MEMBERS
  // --------------------------------------------------

  const viewMembers = async (group) => {
    setSelectedGroup(group);
    setMembers([]);
    setMembersLoading(true);

    try {
      const response = await api.get(
        `/user-groups/group/${group.id}`
      );

      setMembers(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Group members loading error:",
        err.response?.data || err
      );

      error(
        err.response?.data?.detail ||
          "Failed to load group members"
      );
    } finally {
      setMembersLoading(false);
    }
  };

  // --------------------------------------------------
  // CLOSE MEMBERS MODAL
  // --------------------------------------------------

  const closeMembers = () => {
    setSelectedGroup(null);
    setMembers([]);
  };

  // --------------------------------------------------
  // FILTER GROUPS
  // --------------------------------------------------

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return groups;

    return groups.filter((group) =>
      String(group.name || "")
        .toLowerCase()
        .includes(query)
    );
  }, [groups, search]);

  return (
    <div>
      {/* PAGE HEADER */}

      <PageHeader
        title="Groups"
        description="Organize users into groups for controlled feature access and release management."
        icon={<MdGroup />}
      />

      {/* TOP STAT CARDS */}

      <div className="row g-4 mb-4">
        {/* TOTAL GROUPS */}

        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm h-100"
            style={{
              borderRadius: "16px",
            }}
          >
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small
                    style={{
                      color: "#64748B",
                      fontWeight: "600",
                    }}
                  >
                    TOTAL GROUPS
                  </small>

                  <h2
                    className="mt-2 mb-1"
                    style={{
                      fontWeight: "700",
                      color: "#0F172A",
                    }}
                  >
                    {groups.length}
                  </h2>

                  <small className="text-muted">
                    User organization groups
                  </small>
                </div>

                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "14px",
                    background: "#CCFBF1",
                    color: "#0F766E",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MdGroup size={26} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIVE GROUPS */}

        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm h-100"
            style={{
              borderRadius: "16px",
            }}
          >
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small
                    style={{
                      color: "#64748B",
                      fontWeight: "600",
                    }}
                  >
                    ACTIVE GROUPS
                  </small>

                  <h2
                    className="mt-2 mb-1"
                    style={{
                      fontWeight: "700",
                      color: "#0F172A",
                    }}
                  >
                    {groups.length}
                  </h2>

                  <small className="text-muted">
                    Available for assignments
                  </small>
                </div>

                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "14px",
                    background: "#DCFCE7",
                    color: "#16A34A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MdPeople size={26} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH RESULTS */}

        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm h-100"
            style={{
              borderRadius: "16px",
            }}
          >
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small
                    style={{
                      color: "#64748B",
                      fontWeight: "600",
                    }}
                  >
                    SEARCH RESULTS
                  </small>

                  <h2
                    className="mt-2 mb-1"
                    style={{
                      fontWeight: "700",
                      color: "#0F172A",
                    }}
                  >
                    {filteredGroups.length}
                  </h2>

                  <small className="text-muted">
                    Matching groups
                  </small>
                </div>

                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "14px",
                    background: "#DBEAFE",
                    color: "#2563EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MdSearch size={26} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE GROUP */}

      <div
        className="card border-0 shadow-sm mb-4"
        style={{
          borderRadius: "16px",
        }}
      >
        <div className="card-body p-4">
          <div className="d-flex align-items-center mb-4">
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "#CCFBF1",
                color: "#0F766E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "12px",
              }}
            >
              <MdAdd size={24} />
            </div>

            <div>
              <h5
                className="mb-1"
                style={{
                  fontWeight: "700",
                }}
              >
                Create New Group
              </h5>

              <small className="text-muted">
                Create a group to organize users and control feature access.
              </small>
            </div>
          </div>

          <form onSubmit={addGroup}>
            <div className="row g-3">
              <div className="col-md-9">
                <label
                  className="form-label"
                  style={{
                    fontWeight: "600",
                    color: "#334155",
                  }}
                >
                  Group Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Example: Beta Testers"
                  disabled={creating}
                  style={{
                    height: "48px",
                    borderRadius: "10px",
                  }}
                />
              </div>

              <div className="col-md-3 d-flex align-items-end">
                <button
                  type="submit"
                  className="btn w-100"
                  disabled={creating}
                  style={{
                    height: "48px",
                    background: "#14B8A6",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "600",
                  }}
                >
                  <MdAdd
                    size={21}
                    style={{
                      marginRight: "5px",
                      verticalAlign: "middle",
                    }}
                  />

                  {creating
                    ? "Creating..."
                    : "Create Group"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* GROUP LIST */}

      <div
        className="card border-0 shadow-sm"
        style={{
          borderRadius: "16px",
        }}
      >
        <div className="card-body p-4">
          {/* LIST HEADER */}

          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <h5
                className="mb-1"
                style={{
                  fontWeight: "700",
                }}
              >
                Group Directory
              </h5>

              <small className="text-muted">
                Manage groups available in FeatureOps.
              </small>
            </div>

            <button
              className="btn btn-light"
              onClick={loadGroups}
              disabled={loading}
              style={{
                borderRadius: "9px",
                border: "1px solid #E2E8F0",
              }}
            >
              <MdRefresh
                size={19}
                style={{
                  marginRight: "5px",
                  verticalAlign: "middle",
                }}
              />

              Refresh
            </button>
          </div>

          {/* SEARCH */}

          <div
            className="mb-4"
            style={{
              position: "relative",
            }}
          >
            <MdSearch
              size={21}
              style={{
                position: "absolute",
                left: "15px",
                top: "13px",
                color: "#64748B",
              }}
            />

            <input
              type="text"
              className="form-control"
              placeholder="Search groups..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              style={{
                height: "46px",
                paddingLeft: "45px",
                paddingRight: search ? "45px" : "15px",
                borderRadius: "10px",
                background: "#F8FAFC",
              }}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "9px",
                  border: "none",
                  background: "transparent",
                  color: "#64748B",
                }}
              >
                <MdClose size={22} />
              </button>
            )}
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border"
                role="status"
                style={{
                  color: "#14B8A6",
                }}
              />

              <p className="text-muted mt-3 mb-0">
                Loading groups...
              </p>
            </div>
          ) : filteredGroups.length === 0 ? (
            /* EMPTY STATE */

            <div className="text-center py-5">
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "20px",
                  background: "#F1F5F9",
                  color: "#64748B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                }}
              >
                <MdGroup size={38} />
              </div>

              <h5
                className="mt-4"
                style={{
                  fontWeight: "700",
                }}
              >
                {search
                  ? "No matching groups"
                  : "No groups created yet"}
              </h5>

              <p className="text-muted mb-0">
                {search
                  ? "Try a different search term."
                  : "Create your first group using the form above."}
              </p>
            </div>
          ) : (
            /* TABLE */

            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr
                    style={{
                      background: "#F8FAFC",
                    }}
                  >
                    <th
                      style={{
                        color: "#64748B",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      ID
                    </th>

                    <th
                      style={{
                        color: "#64748B",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      GROUP
                    </th>

                    <th
                      style={{
                        color: "#64748B",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      STATUS
                    </th>

                    <th
                      className="text-end"
                      style={{
                        color: "#64748B",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      ACTION
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredGroups.map((group) => (
                    <tr key={group.id}>
                      <td>
                        <span
                          style={{
                            color: "#64748B",
                            fontWeight: "600",
                          }}
                        >
                          #{group.id}
                        </span>
                      </td>

                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "10px",
                              background: "#CCFBF1",
                              color: "#0F766E",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: "12px",
                            }}
                          >
                            <MdGroup size={21} />
                          </div>

                          <div>
                            <strong
                              style={{
                                color: "#0F172A",
                              }}
                            >
                              {group.name}
                            </strong>

                            <br />

                            <small className="text-muted">
                              User access group
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className="badge"
                          style={{
                            background: "#DCFCE7",
                            color: "#15803D",
                            padding: "7px 11px",
                            borderRadius: "20px",
                            fontWeight: "600",
                          }}
                        >
                          <span
                            style={{
                              marginRight: "5px",
                            }}
                          >
                            ●
                          </span>
                          Active
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          {/* MEMBERS */}

                          <button
                            className="btn btn-sm"
                            onClick={() =>
                              viewMembers(group)
                            }
                            style={{
                              border:
                                "1px solid #BFDBFE",
                              color: "#2563EB",
                              background: "#EFF6FF",
                              borderRadius: "8px",
                              fontWeight: "600",
                            }}
                          >
                            <MdVisibility
                              size={18}
                              style={{
                                marginRight: "4px",
                                verticalAlign:
                                  "middle",
                              }}
                            />

                            Members
                          </button>

                          {/* DELETE */}

                          <button
                            className="btn btn-sm"
                            onClick={() =>
                              deleteGroup(group.id)
                            }
                            disabled={
                              deletingId === group.id
                            }
                            style={{
                              border:
                                "1px solid #FECACA",
                              color: "#DC2626",
                              background: "#FEF2F2",
                              borderRadius: "8px",
                              fontWeight: "600",
                            }}
                          >
                            <MdDelete
                              size={18}
                              style={{
                                marginRight: "4px",
                                verticalAlign:
                                  "middle",
                              }}
                            />

                            {deletingId === group.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================
          GROUP MEMBERS MODAL
          ================================================== */}

      {selectedGroup && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.55)",
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
          >
            <div
              className="modal-content border-0 shadow"
              style={{
                borderRadius: "18px",
                overflow: "hidden",
              }}
            >
              {/* MODAL HEADER */}

              <div
                className="modal-header border-0"
                style={{
                  padding: "22px 24px",
                  background: "#F8FAFC",
                }}
              >
                <div className="d-flex align-items-center">
                  <div
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "12px",
                      background: "#CCFBF1",
                      color: "#0F766E",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "12px",
                    }}
                  >
                    <MdPeople size={25} />
                  </div>

                  <div>
                    <h5
                      className="mb-1"
                      style={{
                        fontWeight: "700",
                      }}
                    >
                      Group Members
                    </h5>

                    <small className="text-muted">
                      {selectedGroup.name}
                    </small>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeMembers}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#64748B",
                    fontSize: "24px",
                  }}
                >
                  <MdClose size={25} />
                </button>
              </div>

              {/* MODAL BODY */}

              <div
                className="modal-body"
                style={{
                  padding: "24px",
                }}
              >
                {membersLoading ? (
                  <div className="text-center py-5">
                    <div
                      className="spinner-border"
                      role="status"
                      style={{
                        color: "#14B8A6",
                      }}
                    />

                    <p className="text-muted mt-3 mb-0">
                      Loading group members...
                    </p>
                  </div>
                ) : members.length === 0 ? (
                  <div
                    className="text-center py-5"
                    style={{
                      background: "#F8FAFC",
                      border: "1px dashed #CBD5E1",
                      borderRadius: "14px",
                    }}
                  >
                    <MdPeople
                      size={52}
                      color="#94A3B8"
                    />

                    <h5
                      className="mt-3"
                      style={{
                        fontWeight: "700",
                        color: "#334155",
                      }}
                    >
                      No members found
                    </h5>

                    <p className="text-muted mb-0">
                      This group currently has no
                      assigned users.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* MEMBER COUNT */}

                    <div
                      className="mb-3"
                      style={{
                        color: "#475569",
                        fontWeight: "600",
                      }}
                    >
                      {members.length}{" "}
                      {members.length === 1
                        ? "member"
                        : "members"}
                    </div>

                    {/* MEMBERS TABLE */}

                    <div className="table-responsive">
                      <table className="table align-middle mb-0">
                        <thead>
                          <tr
                            style={{
                              background: "#F8FAFC",
                            }}
                          >
                            <th
                              style={{
                                color: "#64748B",
                                fontSize: "13px",
                              }}
                            >
                              USER
                            </th>

                            <th
                              style={{
                                color: "#64748B",
                                fontSize: "13px",
                              }}
                            >
                              USER ID
                            </th>

                            <th
                              className="text-end"
                              style={{
                                color: "#64748B",
                                fontSize: "13px",
                              }}
                            >
                              STATUS
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {members.map((member) => (
                            <tr key={member.id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      borderRadius: "50%",
                                      background: "#E0F2FE",
                                      color: "#0284C7",
                                      display:
                                        "flex",
                                      alignItems:
                                        "center",
                                      justifyContent:
                                        "center",
                                      marginRight:
                                        "10px",
                                    }}
                                  >
                                    <MdPeople
                                      size={21}
                                    />
                                  </div>

                                  <div>
                                    <strong
                                      style={{
                                        color:
                                          "#0F172A",
                                      }}
                                    >
                                      {member.user
                                        ?.username ||
                                        `User #${member.user_id}`}
                                    </strong>

                                    {member.user
                                      ?.email && (
                                      <>
                                        <br />

                                        <small className="text-muted">
                                          <MdEmail
                                            size={14}
                                            style={{
                                              marginRight:
                                                "4px",
                                              verticalAlign:
                                                "middle",
                                            }}
                                          />

                                          {
                                            member.user
                                              .email
                                          }
                                        </small>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td>
                                <span
                                  style={{
                                    color: "#64748B",
                                    fontWeight: "600",
                                  }}
                                >
                                  #{member.user_id}
                                </span>
                              </td>

                              <td className="text-end">
                                <span
                                  className="badge"
                                  style={{
                                    background:
                                      "#DCFCE7",
                                    color: "#15803D",
                                    padding:
                                      "7px 11px",
                                    borderRadius:
                                      "20px",
                                    fontWeight:
                                      "600",
                                  }}
                                >
                                  Active
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              {/* MODAL FOOTER */}

              <div
                className="modal-footer border-0"
                style={{
                  padding: "16px 24px",
                  background: "#F8FAFC",
                }}
              >
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={closeMembers}
                  style={{
                    borderRadius: "9px",
                    border: "1px solid #E2E8F0",
                    fontWeight: "600",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Groups;
