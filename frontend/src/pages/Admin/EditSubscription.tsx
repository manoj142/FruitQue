import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import AdminSubscriptionForm from "../../components/Admin/AdminSubscriptionForm";

const EditSubscription: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/admin/subscriptions");
  };

  const handleSuccess = () => {
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
        Back to Subscription Management
      </button>

      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Subscription
          </h1>
          <p className="text-gray-600 mt-1">
            Update subscription details and preferences
          </p>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <AdminSubscriptionForm
            subscriptionId={id}
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
};

export default EditSubscription;
