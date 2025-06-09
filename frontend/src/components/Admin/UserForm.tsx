import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { RootState, AppDispatch } from "../../store";
import {
  createUser,
  updateUser,
  getUserById,
  clearSelectedUser,
  clearError,
  User,
} from "../../store/slices/userSlice";

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  password?: string;
  isEmailVerified: boolean;
}

const UserForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const { selectedUser, operationLoading, error } = useSelector(
    (state: RootState) => state.user
  );

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    phone: "",
    role: "user",
    password: "",
    isEmailVerified: false,
  });

  const [formErrors, setFormErrors] = useState<Partial<UserFormData>>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(clearError());

    if (isEditing && id) {
      dispatch(getUserById(id));
    } else {
      dispatch(clearSelectedUser());
    }

    return () => {
      dispatch(clearSelectedUser());
    };
  }, [dispatch, isEditing, id]);

  useEffect(() => {
    if (selectedUser && isEditing) {
      setFormData({
        name: selectedUser.name,
        email: selectedUser.email,
        phone: selectedUser.phone || "",
        role: selectedUser.role,
        isEmailVerified: selectedUser.isEmailVerified,
      });
    }
  }, [selectedUser, isEditing]);

  const validateForm = (): boolean => {
    const errors: Partial<UserFormData> = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!isEditing && !formData.password) {
      errors.password = "Password is required";
    } else if (
      !isEditing &&
      formData.password &&
      formData.password.length < 6
    ) {
      errors.password = "Password must be at least 6 characters long";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const inputValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: inputValue,
    }));

    // Clear specific field error when user starts typing
    if (formErrors[name as keyof UserFormData]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing && id) {
        const updateData: Partial<User> = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          isEmailVerified: formData.isEmailVerified,
        };

        await dispatch(updateUser({ id, userData: updateData })).unwrap();
      } else {
        const createData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          password: formData.password!,
          isEmailVerified: formData.isEmailVerified,
        };

        await dispatch(createUser(createData)).unwrap();
      }

      navigate("/admin/users");
    } catch (error) {
      // Error is handled by Redux
      console.error("Form submission error:", error);
    }
  };

  const handleCancel = () => {
    navigate("/admin/users");
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 max-w-full overflow-hidden">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {isEditing ? "Edit User" : "Create New User"}
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          {isEditing
            ? "Update user information and settings."
            : "Add a new user to the system."}
        </p>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                formErrors.name ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter full name"
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                formErrors.email ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter email address"
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter phone number"
            />
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Role *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        {/* Password - Only for new users */}
        {!isEditing && (
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 pr-10 ${
                  formErrors.password ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {formErrors.password && (
              <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Password must be at least 6 characters long
            </p>
          </div>
        )}
        {/* Email Verification Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isEmailVerified"
            name="isEmailVerified"
            checked={formData.isEmailVerified}
            onChange={handleInputChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label
            htmlFor="isEmailVerified"
            className="ml-2 block text-sm text-gray-700"
          >
            Email is verified
          </label>
        </div>
        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            disabled={operationLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={operationLoading}
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {operationLoading && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {isEditing ? "Update User" : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
