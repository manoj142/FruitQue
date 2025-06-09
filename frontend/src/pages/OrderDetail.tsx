import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { fetchOrderById } from "../store/slices/orderSlice";
import type { RootState } from "../store";
import type { OrderItem } from "../store/slices/orderSlice";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import {
  ArrowLeftIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentOrder, isLoading } = useAppSelector(
    (state: RootState) => state.orders
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id));
    }
  }, [dispatch, id]);
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "pending":
        return <ClockIcon className="w-5 h-5" />;
      case "processing":
        return <ClockIcon className="w-5 h-5" />;
      case "shipped":
        return <TruckIcon className="w-5 h-5" />;
      case "delivered":
        return <CheckCircleIcon className="w-5 h-5" />;
      default:
        return <ClockIcon className="w-5 h-5" />;
    }
  };

  const getOrderProgress = (status?: string) => {
    const steps = ["pending", "processing", "shipped", "delivered"];
    const currentIndex = status ? steps.indexOf(status) : -1;
    return steps.map((step, index) => ({
      name: step.charAt(0).toUpperCase() + step.slice(1),
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Order Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The order you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Link
            to="/orders"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  // Get the actual status from either status or orderStatus field
  const orderStatus =
    currentOrder.status || currentOrder.orderStatus || "pending";
  const orderProgress = getOrderProgress(orderStatus);

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-green-600 hover:text-green-700 mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Back to Orders
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Order Header */}
        <div className="px-6 py-6 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{currentOrder._id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-gray-600 mt-1">
                Placed on
                {new Date(currentOrder.createdAt).toLocaleDateString()} at
                {new Date(currentOrder.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-3">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${getStatusColor(
                  orderStatus
                )}`}
              >
                {getStatusIcon(orderStatus)}
                <span className="ml-2">
                  {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Order Progress */}
        {orderStatus !== "cancelled" && (
          <div className="px-6 py-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Progress
            </h3>
            <div className="flex items-center space-x-4">
              {orderProgress.map((step, index) => (
                <React.Fragment key={step.name}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircleIcon className="w-6 h-6" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm ${
                        step.completed
                          ? "text-green-600 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < orderProgress.length - 1 && (
                    <div
                      className={`flex-1 h-1 rounded ${
                        step.completed ? "bg-green-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Order Items */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Items ({currentOrder.items?.length || 0})
              </h3>
              <div className="space-y-4">
                {currentOrder.items && currentOrder.items.length > 0 ? (
                  currentOrder.items.map((item: OrderItem, index: number) => {
                    const productInfo =
                      typeof item.product === "object" ? item.product : null;
                    return (
                      <div
                        key={index}
                        className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                      >
                        <img
                          src={
                            productInfo?.images?.[0] ||
                            "http://localhost:5000/api/placeholder/300/250"
                          }
                          alt={productInfo?.name || item.name || "Product"}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {productInfo?.name || item.name}
                          </h4>
                          <p className="text-gray-600">
                            SKU:
                            {productInfo?._id ||
                              (typeof item.product === "string"
                                ? item.product
                                : "N/A")}
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ${(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No items found in this order.
                    </p>
                  </div>
                )}
              </div>
            </div>
            {/* Order Summary & Details */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${currentOrder.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>₹0.00</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>${currentOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Shipping Address
                </h3>
                <div className="text-sm text-gray-700">
                  <p className="font-medium">
                    {currentOrder.shippingAddress.firstName}
                    {currentOrder.shippingAddress.lastName}
                  </p>
                  <p>{currentOrder.shippingAddress.address}</p>
                  <p>
                    {currentOrder.shippingAddress.city},
                    {currentOrder.shippingAddress.state}
                    {currentOrder.shippingAddress.zipCode}
                  </p>
                  <p className="mt-2">
                    <span className="font-medium">Email:</span>
                    {currentOrder.shippingAddress.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>
                    {currentOrder.shippingAddress.phone}
                  </p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Method
                </h3>
                <div className="text-sm text-gray-700">
                  <p className="capitalize">{currentOrder.paymentMethod}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Payment processed securely
                  </p>
                </div>
              </div>

              {/* Delivery Information */}
              {currentOrder.status !== "cancelled" && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Delivery Information
                  </h3>
                  <div className="text-sm text-gray-700">
                    {currentOrder.status === "delivered" ? (
                      <p className="text-green-600 font-medium">
                        Delivered on
                        {new Date(
                          currentOrder.deliveredAt || ""
                        ).toLocaleDateString()}
                      </p>
                    ) : (
                      <p>
                        Estimated delivery:
                        <span className="font-medium">
                          {new Date(
                            Date.now() + 3 * 24 * 60 * 60 * 1000
                          ).toLocaleDateString()}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              Download Invoice
            </button>
            {currentOrder.status === "delivered" && (
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Reorder Items
              </button>
            )}
            {(currentOrder.status === "pending" ||
              currentOrder.status === "processing") && (
              <button className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                Cancel Order
              </button>
            )}
            <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
