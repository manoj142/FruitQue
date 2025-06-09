import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { logout, updateProfile } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "../components/UI/Toast";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address:
      user?.address ||
      (user?.addresses && user.addresses.length > 0
        ? user.addresses[0].street
        : ""),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      // Prepare the data for update
      const dataToUpdate = {
        ...formData,
        // Format address appropriately for the backend
        address: formData.address,
      };

      await dispatch(updateProfile(dataToUpdate)).unwrap();
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };
  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    toast.success("Logged out successfully!");
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please Login
          </h1>
          <button
            onClick={() => navigate("/login")}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 px-6 py-8 text-white">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mr-6">
                <UserIcon className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-green-100">{user.email}</p>
                <p className="text-green-100 text-sm">
                  Member since
                  {new Date(user.createdAt || "").toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Profile Information
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <UserIcon className="w-4 h-4 inline mr-1" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <PhoneIcon className="w-4 h-4 inline mr-1" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">
                    {user.phone || "Not provided"}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPinIcon className="w-4 h-4 inline mr-1" />
                  Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">
                    {user.address ||
                      (user.addresses && user.addresses.length > 0
                        ? user.addresses[0].street
                        : "Not provided")}
                  </p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Account Actions */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/orders")}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Order History
              </button>
              <button
                onClick={() => navigate("/change-password")}
                className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-gray-600">Total Orders</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">₹0.00</div>
            <div className="text-gray-600">Total Spent</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-gray-600">Loyalty Points</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
