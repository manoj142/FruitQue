import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import { RootState, AppDispatch } from "../../store";
import {
  getUserById,
  deleteUser,
  clearSelectedUser,
} from "../../store/slices/userSlice";

const UserDetail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { selectedUser, operationLoading, error } = useSelector(
    (state: RootState) => state.user
  );

  useEffect(() => {
    if (id) {
      dispatch(getUserById(id));
    }

    return () => {
      dispatch(clearSelectedUser());
    };
  }, [dispatch, id]);
  const handleDeleteUser = async () => {
    if (
      selectedUser &&
      window.confirm(
        `Are you sure you want to delete user "${selectedUser.name}"?`
      )
    ) {
      try {
        await dispatch(deleteUser(selectedUser._id)).unwrap();
        navigate("/admin/users");
      } catch (error) {
        // Error handled by Redux
      }
    }
  };

  if (operationLoading && !selectedUser) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error && !selectedUser) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading User
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/admin/users"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            User Not Found
          </h3>
          <p className="text-gray-600 mb-4">
            The user you're looking for doesn't exist.
          </p>
          <Link
            to="/admin/users"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Back to Users
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center mb-4 sm:mb-0 min-w-0 flex-1">
          <Link
            to="/admin/users"
            className="text-gray-500 hover:text-gray-700 mr-4 flex-shrink-0"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            User Details
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <Link
            to={`/admin/users/${selectedUser._id}/edit`}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors text-center"
          >
            Edit User
          </Link>
          <button
            onClick={handleDeleteUser}
            disabled={operationLoading}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
          >
            Delete User
          </button>
        </div>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      {/* User Information */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Section */}
        <div className="xl:col-span-2">
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4 sm:mb-0 sm:mr-4 flex-shrink-0">
                <span className="text-green-600 font-semibold text-xl">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  {selectedUser.name}
                </h2>
                <p className="text-gray-600 truncate">{selectedUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Email Address
                </label>
                <p className="text-gray-900 truncate">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Phone Number
                </label>
                <p className="text-gray-900 truncate">
                  {selectedUser.phone || "Not provided"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Role
                </label>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    selectedUser.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {selectedUser.role}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Email Status
                </label>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    selectedUser.isEmailVerified
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {selectedUser.isEmailVerified
                    ? "Verified"
                    : "Pending Verification"}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Member Since
                </label>
                <p className="text-gray-900 text-sm">
                  {selectedUser.createdAt
                    ? new Date(selectedUser.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  User ID
                </label>
                <p className="text-gray-900 font-mono text-xs truncate">
                  {selectedUser._id}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Stats Section */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Account Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Account Status</span>
                <span className="text-green-600 font-medium text-sm">
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Total Orders</span>
                <span className="font-medium text-sm">Coming Soon</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">
                  Active Subscriptions
                </span>
                <span className="font-medium text-sm">Coming Soon</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              
              <Link
                to={`/admin/users/${selectedUser._id}/edit`}
                className="block w-full text-center bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md font-medium transition-colors text-sm"
              >
                Edit Profile
              </Link>
              <button
                onClick={() => {
                  // TODO: Implement reset password functionality
                  alert("Reset password functionality coming soon");
                }}
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-medium transition-colors text-sm"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
