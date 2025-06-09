/**
 * Admin Subscription Detail Page
 *
 * This component allows ADMIN USERS to view detailed information about any subscription in the system.
 * It provides:
 * - Complete subscription details view
 * - Customer information display
 * - Edit subscription functionality
 * - Admin-specific actions
 *
 * Note: This is different from the regular user subscription detail page which shows only user's own subscriptions.
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  getSubscriptionById,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  deleteSubscription,
} from "../../store/slices/subscriptionSlice";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import { toast } from "../../components/UI/Toast";
import {
  ArrowLeftIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  PauseIcon,
  PlayIcon,
  XMarkIcon,
  PencilIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { RootState } from "../../store";

const AdminSubscriptionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentSubscription, loading, error } = useAppSelector(
    (state: RootState) => state.subscriptions
  );
  const { user } = useAppSelector((state) => state.auth);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(getSubscriptionById(id));
    }
  }, [dispatch, id]);

  const handlePauseSubscription = async () => {
    if (!currentSubscription || actionLoading) return;

    setActionLoading("pause");
    try {
      await dispatch(pauseSubscription(currentSubscription._id)).unwrap();
      toast.success("Subscription paused successfully");
    } catch (error) {
      toast.error("Failed to pause subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResumeSubscription = async () => {
    if (!currentSubscription || actionLoading) return;

    setActionLoading("resume");
    try {
      await dispatch(resumeSubscription(currentSubscription._id)).unwrap();
      toast.success("Subscription resumed successfully");
    } catch (error) {
      toast.error("Failed to resume subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription || actionLoading) return;

    if (
      !confirm(
        "Are you sure you want to cancel this subscription? This action cannot be undone."
      )
    ) {
      return;
    }

    setActionLoading("cancel");
    try {
      await dispatch(cancelSubscription(currentSubscription._id)).unwrap();
      toast.success("Subscription cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSubscription = async () => {
    if (!currentSubscription || actionLoading) return;

    if (
      !confirm(
        "Are you sure you want to permanently delete this subscription? This action cannot be undone."
      )
    ) {
      return;
    }

    setActionLoading("delete");
    try {
      await dispatch(deleteSubscription(currentSubscription._id)).unwrap();
      toast.success("Subscription deleted successfully");
      navigate("/admin/subscriptions");
    } catch (error) {
      toast.error("Failed to delete subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const getTypeDisplay = (type: string) => {
    switch (type) {
      case "weekly":
        return "Weekly";
      case "biweekly":
        return "Bi-weekly";
      case "monthly":
        return "Monthly";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-8">
            You don't have permission to access this page
          </p>
          <Link
            to="/"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentSubscription) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Subscription Not Found
          </h1>
          <Link
            to="/admin/subscriptions"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Subscriptions
          </Link>
        </div>
      </div>
    );
  }
  // Removed the old pattern that showed edit form as full page
  // Now using modal pattern below

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/admin/subscriptions")}
        className="flex items-center text-green-600 hover:text-green-700 mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Back to Subscription Management
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Subscription Header */}
        <div className="px-6 py-6 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentSubscription.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Created on
                {new Date(currentSubscription.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Subscription ID: {currentSubscription._id}
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-3">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                  currentSubscription.status
                )}`}
              >
                {currentSubscription.status.charAt(0).toUpperCase() +
                  currentSubscription.status.slice(1)}
              </span>
              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {getTypeDisplay(currentSubscription.type)}
              </span>
            </div>
          </div>
        </div>
        {/* Subscription Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Items and Details */}
            <div className="space-y-6">
              {/* Subscription Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Items in this subscription
                </h3>
                <div className="space-y-3">
                  {currentSubscription.items.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={item.product.image || "/placeholder-fruit.jpg"}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {item.product.category}
                        </p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} • ₹{item.price.toFixed(2)}
                          each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 text-lg">
                          ₹{(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Total Amount:
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      ₹{currentSubscription.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Schedule */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Delivery Schedule
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <CalendarIcon className="w-5 h-5 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Next Delivery</p>
                      <p className="font-medium text-gray-900">
                        {new Date(
                          currentSubscription.nextDeliveryDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <CalendarIcon className="w-5 h-5 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(
                          currentSubscription.startDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {currentSubscription.lastDeliveryDate && (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <CalendarIcon className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Last Delivery</p>
                        <p className="font-medium text-gray-900">
                          {new Date(
                            currentSubscription.lastDeliveryDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {currentSubscription.endDate && (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <CalendarIcon className="w-5 h-5 text-red-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">End Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(
                            currentSubscription.endDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Customer & Delivery Info */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Customer Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start">
                    <UserIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {currentSubscription.customerDetails.firstName}
                        {currentSubscription.customerDetails.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-gray-900">
                        {currentSubscription.customerDetails.address}
                      </p>
                      <p className="text-gray-600">
                        {currentSubscription.customerDetails.city},
                        {currentSubscription.customerDetails.state}
                        {currentSubscription.customerDetails.zipCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <p className="text-gray-900">
                      {currentSubscription.customerDetails.phone}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <p className="text-gray-900">
                      {currentSubscription.customerDetails.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {currentSubscription.paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Instructions */}
              {currentSubscription.deliveryInstructions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Delivery Instructions
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900">
                      {currentSubscription.deliveryInstructions}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Admin Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={`/admin/subscriptions/${currentSubscription._id}/edit`}
              className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit Subscription
            </Link>

            {currentSubscription.status === "active" && (
              <button
                onClick={handlePauseSubscription}
                disabled={actionLoading === "pause"}
                className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <PauseIcon className="w-4 h-4 mr-2" />
                {actionLoading === "pause" ? "Pausing..." : "Pause"}
              </button>
            )}

            {currentSubscription.status === "paused" && (
              <button
                onClick={handleResumeSubscription}
                disabled={actionLoading === "resume"}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <PlayIcon className="w-4 h-4 mr-2" />
                {actionLoading === "resume" ? "Resuming..." : "Resume"}
              </button>
            )}

            {(currentSubscription.status === "active" ||
              currentSubscription.status === "paused") && (
              <button
                onClick={handleCancelSubscription}
                disabled={actionLoading === "cancel"}
                className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <XMarkIcon className="w-4 h-4 mr-2" />
                {actionLoading === "cancel" ? "Cancelling..." : "Cancel"}
              </button>
            )}

            <button
              onClick={handleDeleteSubscription}
              disabled={actionLoading === "delete"}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              {actionLoading === "delete" ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptionDetail;
