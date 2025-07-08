import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchStoreAdmin,
  createOrUpdateStore,
  clearError,
} from "../../store/slices/storeSlice";
import LoadingSpinner from "../../components/UI/LoadingSpinner";

const StoreManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { store, loading, error } = useAppSelector((state) => state.store);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    contact: "",
    email: "",
    instagram: "",
    description: "",
    openingTime: "09:00",
    closingTime: "20:00",
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    dispatch(fetchStoreAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || "",
        location: store.location || "",
        contact: store.contact || "",
        email: store.email || "",
        instagram: store.instagram || "",
        description: store.description || "",
        openingTime: store.openingTime || "09:00",
        closingTime: store.closingTime || "20:00",
      });
    }
  }, [store]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      await dispatch(createOrUpdateStore(formData)).unwrap();
      setIsEditing(false);
    } catch (error) {
      // Error is handled by Redux
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (store) {
      setFormData({
        name: store.name || "",
        location: store.location || "",
        contact: store.contact || "",
        email: store.email || "",
        instagram: store.instagram || "",
        description: store.description || "",
        openingTime: store.openingTime || "09:00",
        closingTime: store.closingTime || "20:00",
      });
    } else {
      setFormData({
        name: "",
        location: "",
        contact: "",
        email: "",
        instagram: "",
        description: "",
        openingTime: "09:00",
        closingTime: "20:00",
      });
    }
  };

  if (loading && !store) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
        {store && !isEditing && (
          <button
            onClick={handleEdit}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Edit Store Details
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {!store && !isEditing ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Store Configured
          </h2>
          <p className="text-gray-600 mb-6">
            Set up your store details to get started.
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            Setup Store
          </button>
        </div>
      ) : isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Store Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter store name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label
                htmlFor="contact"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Contact Number *
              </label>
              <input
                type="tel"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter contact number"
              />
            </div>

            <div>
              <label
                htmlFor="instagram"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Instagram Handle
              </label>
              <input
                type="text"
                id="instagram"
                name="instagram"
                value={formData.instagram}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="@yourstorehandle"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="openingTime"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Opening Time
              </label>
              <input
                type="time"
                id="openingTime"
                name="openingTime"
                value={formData.openingTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="closingTime"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Closing Time
              </label>
              <input
                type="time"
                id="closingTime"
                name="closingTime"
                value={formData.closingTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter store location/address"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Brief description about your store"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : store ? "Update Store" : "Create Store"}
            </button>
            {store && (
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Store Name
              </h3>
              <p className="text-lg font-semibold text-gray-900">
                {store?.name}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Email</h3>
              <p className="text-lg text-gray-900">{store?.email}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Contact
              </h3>
              <p className="text-lg text-gray-900">{store?.contact}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Instagram
              </h3>
              <p className="text-lg text-gray-900">
                {store?.instagram || "Not set"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Store Hours
              </h3>
              <p className="text-lg text-gray-900">
                {store?.openingTime || "09:00"} - {store?.closingTime || "20:00"}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
            <p className="text-lg text-gray-900">{store?.location}</p>
          </div>

          {store?.description && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Description
              </h3>
              <p className="text-lg text-gray-900">{store.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoreManagement;
