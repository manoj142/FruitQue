/**
 * Admin Subscription Management Page
 *
 * This component is for ADMIN USERS ONLY to manage ALL subscriptions in the system.
 * It provides:
 * - System-wide subscription overview
 * - Admin analytics and statistics
 * - Ability to delete any subscription
 * - Filter and search across all users' subscriptions
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import saveAs from "file-saver";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  getAllSubscriptions,
  getDueSubscriptions,
  getSubscriptionStats,
  deleteSubscription,
} from "../../store/slices/subscriptionSlice";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import { toast } from "../../components/UI/Toast";

import {
  PlusIcon,
  EyeIcon,
  TrashIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import type { RootState } from "../../store";
import type { Subscription } from "../../services/subscriptionApi";

const AdminSubscriptions: React.FC = () => {
  const dispatch = useAppDispatch();
  const { subscriptions, dueSubscriptions, stats, loading, error, pagination } =
    useAppSelector((state: RootState) => state.subscriptions);
  const { user } = useAppSelector((state) => state.auth);
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    search: "",
    page: 1,
    limit: 10,
  });
  const [showDueOnly, setShowDueOnly] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === "admin") {
      dispatch(getSubscriptionStats());
      dispatch(getDueSubscriptions());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user?.role === "admin") {
      if (showDueOnly) {
        dispatch(getDueSubscriptions());
      } else {
        dispatch(getAllSubscriptions(filters));
      }
    }
  }, [dispatch, user, filters, showDueOnly]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };
  const handleDeleteSubscription = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this subscription? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeleteLoading(id);
    try {
      await dispatch(deleteSubscription(id)).unwrap();
      toast.success("Subscription deleted successfully");
    } catch (error) {
      toast.error("Failed to delete subscription");
    } finally {
      setDeleteLoading(null);
    }
  };
  const handleExport = (format: "csv" | "xlsx") => {
    // Prepare data for export - use the displaySubscriptions calculated below
    const currentDisplaySubscriptions = showDueOnly
      ? dueSubscriptions
      : subscriptions;
    const exportData = currentDisplaySubscriptions.map((subscription: any) => ({
      Name: subscription.name,
      Customer: `${subscription.customerDetails.firstName} ${subscription.customerDetails.lastName}`,
      Email: subscription.customerDetails.email,
      Phone: subscription.customerDetails.phone || "N/A",
      Type: getTypeDisplay(subscription.type),
      Status:
        subscription.status.charAt(0).toUpperCase() +
        subscription.status.slice(1),
      Amount: subscription.totalAmount,
      "Next Delivery": new Date(
        subscription.nextDeliveryDate
      ).toLocaleDateString(),
      Items: subscription.items
        .map(
          (item: any) =>
            `${item.product?.name || item.product} x${item.quantity}`
        )
        .join("; "),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Subscriptions");

    if (format === "csv") {
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(
        blob,
        `subscriptions-${new Date().toISOString().slice(0, 10)}.csv`
      );
    } else {
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      saveAs(
        blob,
        `subscriptions-${new Date().toISOString().slice(0, 10)}.xlsx`
      );
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

  if (user?.role !== "admin") {
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

  if (loading && !subscriptions.length && !dueSubscriptions.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  const displaySubscriptions = showDueOnly ? dueSubscriptions : subscriptions;
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 lg:mb-8 gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
              Subscription Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Manage all customer subscriptions
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleExport("csv")}
              className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap text-sm sm:text-base"
            >
              Download CSV
            </button>
            <button
              onClick={() => handleExport("xlsx")}
              className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap text-sm sm:text-base"
            >
              Download XLSX
            </button>
            <Link
              to="/admin/subscriptions/create"
              className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center whitespace-nowrap"
            >
              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base">Create Subscription</span>
            </Link>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
            {error}
          </div>
        )}
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100 text-green-600 flex-shrink-0">
                  <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                    Active Subscriptions
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {stats.statusStats.active}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 flex-shrink-0">
                  <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                    Paused Subscriptions
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {stats.statusStats.paused}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                  <CurrencyDollarIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                    Monthly Revenue
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    ₹{stats.totalActiveRevenue.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-red-100 text-red-600 flex-shrink-0">
                  <CalendarDaysIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                    Due Today
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {dueSubscriptions.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            {/* Search */}
            <div className="w-full">
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search subscriptions..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              >
                <option value="">All Types</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <button
                onClick={() => setShowDueOnly(!showDueOnly)}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm whitespace-nowrap ${
                  showDueOnly
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {showDueOnly ? "Show All" : "Due Only"}
              </button>
            </div>
          </div>
        </div>        {/* Subscriptions Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Delivery
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>              <tbody className="bg-white divide-y divide-gray-200">
                {displaySubscriptions.map((subscription: Subscription) => (
                  <tr key={subscription._id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 font-medium text-sm">
                            {subscription.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {subscription.name}
                          </div>
                          <div className="sm:hidden text-xs text-gray-500 truncate">
                            {subscription.customerDetails.firstName} {subscription.customerDetails.lastName}
                          </div>
                          <div className="sm:hidden text-xs text-gray-400 truncate">
                            {subscription.customerDetails.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {subscription.customerDetails.firstName} {subscription.customerDetails.lastName}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {subscription.customerDetails.email}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscription.customerDetails.phone || "N/A"}
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getTypeDisplay(subscription.type)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          subscription.status
                        )}`}
                      >
                        {subscription.status}
                      </span>
                      <div className="lg:hidden text-xs text-gray-500 mt-1">
                        {getTypeDisplay(subscription.type)}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{subscription.totalAmount}
                    </td>
                    <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscription.nextDeliveryDate
                        ? new Date(subscription.nextDeliveryDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/admin/subscriptions/${subscription._id}`}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() =>
                            handleDeleteSubscription(subscription._id)
                          }
                          disabled={deleteLoading === subscription._id}
                          className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                          title="Delete Subscription"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="sm:hidden text-xs text-gray-500 mt-1">
                        ₹{subscription.totalAmount} • {subscription.nextDeliveryDate
                          ? new Date(subscription.nextDeliveryDate).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </td>
                  </tr>
                ))}              </tbody>
            </table>
          </div>
          {displaySubscriptions.length === 0 && (
            <div className="text-center py-8 sm:py-12 px-4">
              <CalendarDaysIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                {showDueOnly
                  ? "No Due Subscriptions"
                  : "No Subscriptions Found"}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
                {showDueOnly
                  ? "There are no subscriptions due for delivery today."
                  : "No subscriptions match your current filters."}
              </p>
            </div>
          )}
          {/* Pagination */}
          {pagination && pagination.pages > 1 && !showDueOnly && (
            <div className="bg-white px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing
                    <span className="font-medium">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>
                    to
                    <span className="font-medium">
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}
                    </span>
                    of <span className="font-medium">{pagination.total}</span>
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                      .filter((page) => {
                        const current = pagination.page;
                        return (
                          page === 1 ||
                          page === pagination.pages ||
                          (page >= current - 1 && page <= current + 1)
                        );
                      })
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              ...
                            </span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pagination.page
                                ? "z-10 bg-green-50 border-green-500 text-green-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptions;
