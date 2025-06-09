import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { fetchUserOrders } from "../store/slices/orderSlice";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import { EyeIcon, ReceiptPercentIcon } from "@heroicons/react/24/outline";
import type { RootState } from "../store";
import type { Order } from "../store/slices/orderSlice";

const Orders: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, isLoading } = useAppSelector(
    (state: RootState) => state.orders
  );
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserOrders());
    }
  }, [dispatch, user]);

  const getStatusColor = (status: string) => {
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please Login
          </h1>
          <p className="text-gray-600 mb-8">
            You need to be logged in to view your orders
          </p>
          <Link
            to="/login"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <Link
          to="/products"
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <ReceiptPercentIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Orders Yet
          </h2>
          <p className="text-gray-600 mb-8">
            You haven't placed any orders yet. Start shopping to see your orders
            here!
          </p>
          <Link
            to="/products"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: Order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #
                      {order.orderNumber || order._id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0 flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.orderStatus || order.status || "pending"
                      )}`}
                    >
                      {(order.orderStatus || order.status || "pending")
                        .charAt(0)
                        .toUpperCase() +
                        (order.orderStatus || order.status || "pending").slice(
                          1
                        )}
                    </span>
                    <Link
                      to={`/orders/${order._id}`}
                      className="text-green-600 hover:text-green-700 flex items-center"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      View Details
                    </Link>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Order Items */}
                  <div className="lg:col-span-2">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Items ({(order.orderItems || order.items || []).length})
                    </h4>
                    <div className="space-y-3">
                      {(order.orderItems || order.items || [])
                        .slice(0, 3)
                        .map((item: any, index: number) => {
                          const productInfo =
                            typeof item.product === "object"
                              ? item.product
                              : null;
                          return (
                            <div
                              key={index}
                              className="flex items-center space-x-3"
                            >
                              
                              <img
                                src={
                                  productInfo?.images?.[0] ||
                                  "http://localhost:5000/api/placeholder/300/250"
                                }
                                alt={
                                  productInfo?.name || item.name || "Product"
                                }
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {productInfo?.name || item.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Quantity: {item.quantity} × ₹
                                  {item.price.toFixed(2)}
                                </p>
                              </div>
                              <p className="font-semibold text-gray-900">
                                ₹
                                {(
                                  item.totalPrice || item.quantity * item.price
                                ).toFixed(2)}
                              </p>
                            </div>
                          );
                        })}
                      {(order.orderItems || order.items || []).length > 3 && (
                        <p className="text-sm text-gray-600">
                          +{(order.orderItems || order.items || []).length - 3}
                          more items
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Order Summary */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Order Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>
                          ₹
                          {(
                            order.pricing?.subtotal ||
                            order.totalAmount - (order.pricing?.shipping || 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>
                          ₹{(order.pricing?.shipping || 50).toFixed(2)}
                        </span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>₹{order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                    {/* Delivery Address */}
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 mb-2">
                        Delivery Address
                      </h5>
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress.firstName || ""}
                        {order.shippingAddress.lastName || ""}
                        <br />
                        {order.shippingAddress.street ||
                          order.shippingAddress.address}
                        <br />
                        {order.shippingAddress.city},
                        {order.shippingAddress.state}
                        {order.shippingAddress.zipCode}
                      </p>
                    </div>
                    {/* Estimated Delivery */}
                    {(order.orderStatus || order.status || "pending") !==
                      "cancelled" &&
                      (order.orderStatus || order.status || "pending") !==
                        "delivered" && (
                        <div className="mt-4">
                          <h5 className="font-medium text-gray-900 mb-2">
                            Estimated Delivery
                          </h5>
                          <p className="text-sm text-gray-600">
                            {new Date(
                              Date.now() + 3 * 24 * 60 * 60 * 1000
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to={`/orders/${order._id}`}
                    className="flex-1 bg-green-600 text-white text-center py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View Full Details
                  </Link>
                  {(order.orderStatus || order.status || "pending") ===
                    "delivered" && (
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      Reorder Items
                    </button>
                  )}
                  {((order.orderStatus || order.status || "pending") ===
                    "pending" ||
                    (order.orderStatus || order.status || "pending") ===
                      "processing") && (
                    <button className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
