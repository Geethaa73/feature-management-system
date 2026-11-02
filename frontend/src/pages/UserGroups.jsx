import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import PageHeader from "../components/PageHeader";

import {
  MdAdd,
  MdDelete,
  MdRefresh,
  MdGroup,
  MdPerson,
  MdPeople,
  MdLink,
} from "react-icons/md";

const UserGroups = () => {
  // --------------------------------------------------
  // State
  // --------------------------------------------------

  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [userId, setUserId] = useState("");
  const [groupId, setGroupId] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // --------------------------------------------------
  // Load Users + Groups
  // --------------------------------------------------

  const loadData = async () => {
    try {
      setLoading(true);

      const [usersResponse, groupsResponse] = await Promise.all([
        api.get("/users/"),
        api.get("/groups/"),
      ]);

      const userData = usersResponse.data || [];
      const groupData = groupsResponse.data || [];

      setUsers(userData);
      setGroups(groupData);

      // Keep selected user if it still exists.
      // Otherwise select the first available user.
      if (userData.length > 0) {
        setUserId((currentUserId) => {
          const stillExists = userData.some(
            (user) => String(user.id) === String(currentUserId)
          );

          return stillExists
            ? currentUserId
            : String(userData[0].id);
        });
      } else {
        setUserId("");
      }
    } catch (error) {
      console.error("Error loading users/groups:", error);

      const message =
        error.response?.data?.detail ||
        "Failed to load users and groups.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Load Assignments For Selected User
  // --------------------------------------------------

  const loadAssignments = async (selectedUserId = userId) => {
    if (!selectedUserId) {
      setAssignments([]);
      return;
    }

    try {
      setLoadingAssignments(true);

      const response = await api.get(
        `/user-groups/user/${selectedUserId}`
      );

      setAssignments(response.data || []);
    } catch (error) {
      console.error("Error loading assignments:", error);

      const message =
        error.response?.data?.detail ||
        "Failed to load group assignments.";

      toast.error(message);
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  // --------------------------------------------------
  // Initial Load
  // --------------------------------------------------

  useEffect(() => {
    loadData();
  }, []);

  // --------------------------------------------------
  // Reload Assignments When User Changes
  // --------------------------------------------------

  useEffect(() => {
    if (userId) {
      loadAssignments(userId);
    } else {
      setAssignments([]);
    }
  }, [userId]);

  // --------------------------------------------------
  // Selected User
  // --------------------------------------------------

  const selectedUser = useMemo(() => {
    return users.find(
      (user) => String(user.id) === String(userId)
    );
  }, [users, userId]);

  // --------------------------------------------------
  // Helper Functions
  // --------------------------------------------------

  const getUserName = (assignment) => {
    if (assignment.user?.username) {
      return assignment.user.username;
    }

    const user = users.find(
      (item) => String(item.id) === String(assignment.user_id)
    );

    return user?.username || `User #${assignment.user_id}`;
  };

  const getGroupName = (assignment) => {
    if (assignment.group?.name) {
      return assignment.group.name;
    }

    const group = groups.find(
      (item) => String(item.id) === String(assignment.group_id)
    );

    return group?.name || `Group #${assignment.group_id}`;
  };

  // --------------------------------------------------
  // Assign User To Group
  // --------------------------------------------------

  const assignUser = async (event) => {
    event.preventDefault();

    if (!userId) {
      toast.error("Please select a user.");
      return;
    }

    if (!groupId) {
      toast.error("Please select a group.");
      return;
    }

    // Prevent duplicate assignment
    const alreadyAssigned = assignments.some(
      (assignment) =>
        String(assignment.group_id) === String(groupId)
    );

    if (alreadyAssigned) {
      toast.info("This user is already assigned to the selected group.");
      return;
    }

    try {
      setAssigning(true);

      await api.post("/user-groups/assign", {
        user_id: Number(userId),
        group_id: Number(groupId),
      });

      toast.success("User assigned to group successfully.");

      setGroupId("");

      await loadAssignments(userId);
    } catch (error) {
      console.error("Error assigning user:", error);

      const message =
        error.response?.data?.detail ||
        "Failed to assign user to group.";

      toast.error(message);
    } finally {
      setAssigning(false);
    }
  };

  // --------------------------------------------------
  // Remove User From Group
  // --------------------------------------------------

  const removeAssignment = async (assignmentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this user from the group?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(assignmentId);

      await api.delete(`/user-groups/${assignmentId}`);

      toast.success("User removed from group successfully.");

      await loadAssignments(userId);
    } catch (error) {
      console.error("Error removing assignment:", error);

      const message =
        error.response?.data?.detail ||
        "Failed to remove user from group.";

      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  // --------------------------------------------------
  // Refresh Everything
  // --------------------------------------------------

  const refreshAll = async () => {
    try {
      setRefreshing(true);

      await loadData();

      // Refresh the currently selected user's assignments
      if (userId) {
        await loadAssignments(userId);
      }

      toast.success("User groups refreshed.");
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // --------------------------------------------------
  // Statistics
  // --------------------------------------------------

  const totalUsers = users.length;
  const totalGroups = groups.length;
  const totalAssignments = assignments.length;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="container-fluid px-4 py-4">

      {/* --------------------------------------------- */}
      {/* Page Header */}
      {/* --------------------------------------------- */}

      <PageHeader
        title="User Groups"
        subtitle="Manage user memberships and group assignments"
        icon={<MdPeople size={30} />}
      />

      {/* --------------------------------------------- */}
      {/* Summary Cards */}
      {/* --------------------------------------------- */}

      <div className="row g-3 mb-4">

        {/* Users */}
        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm h-100"
            style={{
              borderRadius: "14px",
              background: "#FFFFFF",
            }}
          >
            <div className="card-body d-flex align-items-center">

              <div
                className="d-flex align-items-center justify-content-center me-3"
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  background: "#EEF2FF",
                  color: "#4F46E5",
                }}
              >
                <MdPerson size={27} />
              </div>

              <div>
                <div
                  className="text-muted"
                  style={{ fontSize: "14px" }}
                >
                  Total Users
                </div>

                <div
                  className="fw-bold"
                  style={{
                    fontSize: "25px",
                    color: "#1E293B",
                  }}
                >
                  {totalUsers}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Groups */}
        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm h-100"
            style={{
              borderRadius: "14px",
              background: "#FFFFFF",
            }}
          >
            <div className="card-body d-flex align-items-center">

              <div
                className="d-flex align-items-center justify-content-center me-3"
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  background: "#ECFDF5",
                  color: "#059669",
                }}
              >
                <MdGroup size={27} />
              </div>

              <div>
                <div
                  className="text-muted"
                  style={{ fontSize: "14px" }}
                >
                  Total Groups
                </div>

                <div
                  className="fw-bold"
                  style={{
                    fontSize: "25px",
                    color: "#1E293B",
                  }}
                >
                  {totalGroups}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Assignments */}
        <div className="col-md-4">
          <div
            className="card border-0 shadow-sm h-100"
            style={{
              borderRadius: "14px",
              background: "#FFFFFF",
            }}
          >
            <div className="card-body d-flex align-items-center">

              <div
                className="d-flex align-items-center justify-content-center me-3"
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  background: "#FFF7ED",
                  color: "#EA580C",
                }}
              >
                <MdLink size={27} />
              </div>

              <div>
                <div
                  className="text-muted"
                  style={{ fontSize: "14px" }}
                >
                  Selected User Groups
                </div>

                <div
                  className="fw-bold"
                  style={{
                    fontSize: "25px",
                    color: "#1E293B",
                  }}
                >
                  {totalAssignments}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* --------------------------------------------- */}
      {/* Assignment Form */}
      {/* --------------------------------------------- */}

      <div
        className="card border-0 shadow-sm mb-4"
        style={{
          borderRadius: "14px",
          background: "#FFFFFF",
        }}
      >

        <div
          className="card-header bg-white border-0 d-flex align-items-center justify-content-between"
          style={{
            borderRadius: "14px 14px 0 0",
            padding: "20px",
          }}
        >
          <div>
            <h5
              className="mb-1 fw-semibold"
              style={{ color: "#1E293B" }}
            >
              Assign User to Group
            </h5>

            <p
              className="mb-0 text-muted"
              style={{ fontSize: "14px" }}
            >
              Select a user and assign them to a group.
            </p>
          </div>

          <MdGroup
            size={25}
            style={{ color: "#64748B" }}
          />
        </div>

        <div className="card-body">

          <form onSubmit={assignUser}>

            <div className="row g-3 align-items-end">

              {/* User */}
              <div className="col-md-5">

                <label
                  className="form-label fw-semibold"
                  style={{
                    fontSize: "14px",
                    color: "#334155",
                  }}
                >
                  <MdPerson className="me-1" />
                  User
                </label>

                <select
                  className="form-select"
                  value={userId}
                  onChange={(event) =>
                    setUserId(event.target.value)
                  }
                  disabled={
                    loading ||
                    assigning ||
                    refreshing
                  }
                  style={{
                    borderRadius: "10px",
                    border: "1px solid #CBD5E1",
                    minHeight: "44px",
                  }}
                >
                  <option value="">
                    Select a user
                  </option>

                  {users.map((user) => (
                    <option
                      key={user.id}
                      value={user.id}
                    >
                      {user.username}{" "}
                      {user.email
                        ? `(${user.email})`
                        : ""}
                    </option>
                  ))}
                </select>

              </div>

              {/* Group */}
              <div className="col-md-5">

                <label
                  className="form-label fw-semibold"
                  style={{
                    fontSize: "14px",
                    color: "#334155",
                  }}
                >
                  <MdGroup className="me-1" />
                  Group
                </label>

                <select
                  className="form-select"
                  value={groupId}
                  onChange={(event) =>
                    setGroupId(event.target.value)
                  }
                  disabled={
                    loading ||
                    assigning ||
                    refreshing ||
                    !userId
                  }
                  style={{
                    borderRadius: "10px",
                    border: "1px solid #CBD5E1",
                    minHeight: "44px",
                  }}
                >
                  <option value="">
                    Select a group
                  </option>

                  {groups.map((group) => (
                    <option
                      key={group.id}
                      value={group.id}
                    >
                      {group.name}
                    </option>
                  ))}
                </select>

              </div>

              {/* Assign Button */}
              <div className="col-md-2">

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={
                    loading ||
                    assigning ||
                    refreshing ||
                    !userId ||
                    !groupId
                  }
                  style={{
                    minHeight: "44px",
                    borderRadius: "10px",
                    fontWeight: "600",
                  }}
                >
                  {assigning ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
                      Assigning
                    </>
                  ) : (
                    <>
                      <MdAdd
                        size={20}
                        className="me-1"
                      />
                      Assign
                    </>
                  )}
                </button>

              </div>

            </div>

          </form>

        </div>
      </div>

      {/* --------------------------------------------- */}
      {/* Assignments */}
      {/* --------------------------------------------- */}

      <div
        className="card border-0 shadow-sm"
        style={{
          borderRadius: "14px",
          background: "#FFFFFF",
        }}
      >

        <div
          className="card-header bg-white border-0 d-flex align-items-center justify-content-between"
          style={{
            borderRadius: "14px 14px 0 0",
            padding: "20px",
          }}
        >

          <div>
            <h5
              className="mb-1 fw-semibold"
              style={{ color: "#1E293B" }}
            >
              Group Assignments
            </h5>

            <p
              className="mb-0 text-muted"
              style={{ fontSize: "14px" }}
            >
              {selectedUser
                ? `Groups assigned to ${selectedUser.username}`
                : "Select a user to view group assignments."}
            </p>
          </div>

          <button
            className="btn btn-light"
            type="button"
            onClick={refreshAll}
            disabled={
              loading ||
              loadingAssignments ||
              refreshing ||
              !userId
            }
            style={{
              borderRadius: "10px",
              border: "1px solid #E2E8F0",
              minWidth: "105px",
            }}
          >
            {refreshing ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                Refreshing
              </>
            ) : (
              <>
                <MdRefresh
                  size={20}
                  className="me-1"
                />
                Refresh
              </>
            )}
          </button>

        </div>

        <div className="card-body p-0">

          {/* Loading */}
          {loadingAssignments ? (
            <div
              className="text-center py-5"
              style={{ color: "#64748B" }}
            >
              <div
                className="spinner-border mb-3"
                role="status"
              />

              <div>
                Loading group assignments...
              </div>
            </div>
          ) : !userId ? (
            /* No User */
            <div
              className="text-center py-5 px-3"
              style={{ color: "#64748B" }}
            >
              <MdPerson
                size={45}
                className="mb-2"
              />

              <h6 className="fw-semibold">
                Select a user
              </h6>

              <p className="mb-0">
                Choose a user above to view their group
                assignments.
              </p>
            </div>
          ) : assignments.length === 0 ? (
            /* Empty */
            <div
              className="text-center py-5 px-3"
              style={{ color: "#64748B" }}
            >
              <MdGroup
                size={45}
                className="mb-2"
              />

              <h6 className="fw-semibold">
                No group assignments
              </h6>

              <p className="mb-0">
                {selectedUser
                  ? `${selectedUser.username} is not assigned to any groups yet.`
                  : "This user is not assigned to any groups yet."}
              </p>
            </div>
          ) : (
            /* Table */
            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead
                  style={{
                    background: "#F8FAFC",
                  }}
                >
                  <tr>
                    <th
                      className="px-4 py-3"
                      style={{
                        fontSize: "13px",
                        color: "#64748B",
                        fontWeight: "600",
                      }}
                    >
                      #
                    </th>

                    <th
                      className="py-3"
                      style={{
                        fontSize: "13px",
                        color: "#64748B",
                        fontWeight: "600",
                      }}
                    >
                      User
                    </th>

                    <th
                      className="py-3"
                      style={{
                        fontSize: "13px",
                        color: "#64748B",
                        fontWeight: "600",
                      }}
                    >
                      Group
                    </th>

                    <th
                      className="py-3 text-end px-4"
                      style={{
                        fontSize: "13px",
                        color: "#64748B",
                        fontWeight: "600",
                      }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {assignments.map(
                    (assignment, index) => (
                      <tr key={assignment.id}>

                        <td className="px-4">
                          <span
                            className="badge"
                            style={{
                              background: "#F1F5F9",
                              color: "#475569",
                              borderRadius: "7px",
                              fontWeight: "600",
                            }}
                          >
                            {index + 1}
                          </span>
                        </td>

                        <td>
                          <div className="d-flex align-items-center">

                            <div
                              className="d-flex align-items-center justify-content-center me-2"
                              style={{
                                width: "34px",
                                height: "34px",
                                borderRadius: "9px",
                                background: "#EEF2FF",
                                color: "#4F46E5",
                              }}
                            >
                              <MdPerson size={19} />
                            </div>

                            <div>
                              <div
                                className="fw-semibold"
                                style={{
                                  color: "#1E293B",
                                }}
                              >
                                {getUserName(
                                  assignment
                                )}
                              </div>

                              <small
                                className="text-muted"
                              >
                                User ID:{" "}
                                {assignment.user_id}
                              </small>
                            </div>

                          </div>
                        </td>

                        <td>

                          <span
                            className="badge d-inline-flex align-items-center"
                            style={{
                              background: "#ECFDF5",
                              color: "#047857",
                              borderRadius: "8px",
                              padding:
                                "8px 11px",
                              fontWeight: "600",
                            }}
                          >
                            <MdGroup
                              size={17}
                              className="me-1"
                            />

                            {getGroupName(
                              assignment
                            )}
                          </span>

                        </td>

                        <td className="text-end px-4">

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              removeAssignment(
                                assignment.id
                              )
                            }
                            disabled={
                              deletingId ===
                              assignment.id
                            }
                            style={{
                              borderRadius: "8px",
                              minWidth: "85px",
                            }}
                          >
                            {deletingId ===
                            assignment.id ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-1"
                                  role="status"
                                  aria-hidden="true"
                                />
                                Removing
                              </>
                            ) : (
                              <>
                                <MdDelete
                                  size={18}
                                  className="me-1"
                                />
                                Remove
                              </>
                            )}
                          </button>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default UserGroups;