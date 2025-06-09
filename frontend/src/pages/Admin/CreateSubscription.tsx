/**
 * Admin Subscription Creation Page
 *
 * This component allows ADMIN USERS to create subscriptions for any user in the system.
 * It provides:
 * - User selection dropdown
 * - Product selection with quantities
 * - Delivery address input
 * - Payment method selection
 * - Subscription type configuration
 *
 * Note: This is different from the regular user subscription creation page.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import AdminSubscriptionForm from "../../components/Admin/AdminSubscriptionForm";
import { toast } from "../../components/UI/Toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const AdminCreateSubscription: React.FC = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/admin/subscriptions");
  };

  const handleSuccess = () => {
    toast.success("Subscription created successfully");
    navigate("/admin/subscriptions");
  };
  return (
    <div>
      {/* Back Button */}
      <button
        onClick={handleClose}
        className="flex items-center text-green-600 hover:text-green-700 mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Back to Subscriptions
      </button>

      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Subscription
          </h1>
          <p className="text-gray-600 mt-1">
            Add a new subscription for a customer
          </p>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <AdminSubscriptionForm
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminCreateSubscription;
