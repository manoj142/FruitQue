import React, { useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import { fetchUserStats } from "../../store/slices/userSlice";
import { fetchProductStats } from "../../store/slices/productSlice";
import { fetchOrderStats } from "../../store/slices/orderSlice";
import { getSubscriptionStats } from "../../store/slices/subscriptionSlice";
import AdminSubscriptions from "./SubscriptionManagement";
import AdminCreateSubscription from "./CreateSubscription";
import AdminEditSubscription from "./EditSubscription";
import AdminSubscriptionDetail from "./SubscriptionDetail";
import AdminProductManagement from "./ProductManagement";
import AdminCreateProduct from "./CreateProduct";
import AdminEditProduct from "./EditProduct";
import UserManagement from "./UserManagement";
import UserForm from "../../components/Admin/UserForm";
import UserDetail from "./UserDetail";
import StoreManagement from "./StoreManagement";

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Get stats from Redux store
  const userStats = useAppSelector((state) => state.user.stats);
  const productStats = useAppSelector((state) => state.products.stats);
  const orderStats = useAppSelector((state) => state.orders.stats);
  const subscriptionStats = useAppSelector(
    (state) => state.subscriptions.stats
  );

  // Fetch all stats on component mount
  useEffect(() => {
    dispatch(fetchUserStats());
    dispatch(fetchProductStats());
    dispatch(fetchOrderStats());
    dispatch(getSubscriptionStats());
  }, [dispatch]);

  const isActive = (path: string) => {
    if (path === "/admin" && location.pathname === "/admin") return true;
    if (path !== "/admin" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Panel</h2>
          <nav className="space-y-2">
            <Link
              to="/admin"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive("/admin")
                  ? "bg-green-500 text-white"
                  : "text-gray-700 hover:bg-green-50 hover:text-green-600"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/admin/subscriptions"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive("/admin/subscriptions")
                  ? "bg-green-500 text-white"
                  : "text-gray-700 hover:bg-green-50 hover:text-green-600"
              }`}
            >
              Subscriptions
            </Link>
            <Link
              to="/admin/orders"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive("/admin/orders")
                  ? "bg-green-500 text-white"
                  : "text-gray-700 hover:bg-green-50 hover:text-green-600"
              }`}
            >
              Orders
            </Link>
            <Link
              to="/admin/productmanagement"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive("/admin/productmanagement")
                  ? "bg-green-500 text-white"
                  : "text-gray-700 hover:bg-green-50 hover:text-green-600"
              }`}
            >
              Products
            </Link>
            <Link
              to="/admin/users"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive("/admin/users")
                  ? "bg-green-500 text-white"
                  : "text-gray-700 hover:bg-green-50 hover:text-green-600"
              }`}
            >
              Users
            </Link>
            <Link
              to="/admin/store"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive("/admin/store")
                  ? "bg-green-500 text-white"
                  : "text-gray-700 hover:bg-green-50 hover:text-green-600"
              }`}
            >
              Store Management
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Admin Dashboard
                  </h1>

                  {/* Dashboard Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100">Total Orders</p>
                          <p className="text-2xl font-bold">
                            {orderStats?.totalOrders || 0}
                          </p>
                        </div>
                        <div className="text-3xl opacity-80">📦</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100">Active Subscriptions</p>
                          <p className="text-2xl font-bold">
                            {subscriptionStats?.active || 0}
                          </p>
                        </div>
                        <div className="text-3xl opacity-80">🔄</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-100">Total Products</p>
                          <p className="text-2xl font-bold">
                            {productStats?.totalProducts || 0}
                          </p>
                        </div>
                        <div className="text-3xl opacity-80">🥕</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100">Total Users</p>
                          <p className="text-2xl font-bold">
                            {userStats?.totalUsers || 0}
                          </p>
                        </div>
                        <div className="text-3xl opacity-80">👥</div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link
                      to="/admin/subscriptions"
                      className="block p-6 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Manage Subscriptions
                      </h3>
                      <p className="text-gray-600">
                        View and manage customer subscriptions
                      </p>
                    </Link>
                    <Link
                      to="/admin/orders"
                      className="block p-6 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Process Orders
                      </h3>
                      <p className="text-gray-600">
                        View and update order statuses
                      </p>
                    </Link>
                    <Link
                      to="/admin/productmanagement"
                      className="block p-6 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Manage Products
                      </h3>
                      <p className="text-gray-600">
                        Add, edit, and remove products
                      </p>
                    </Link>
                  </div>
                </div>
              }
            />
            <Route path="/subscriptions" element={<AdminSubscriptions />} />
            <Route
              path="/subscriptions/create"
              element={<AdminCreateSubscription />}
            />
            <Route
              path="/subscriptions/:id/edit"
              element={<AdminEditSubscription />}
            />
            <Route
              path="/subscriptions/:id"
              element={<AdminSubscriptionDetail />}
            />
            <Route
              path="/orders"
              element={
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Order Management
                  </h1>
                  <p className="text-gray-600">
                    Order management coming soon...
                  </p>
                </div>
              }
            />
            <Route
              path="/productmanagement"
              element={<AdminProductManagement />}
            />
            <Route path="/products/create" element={<AdminCreateProduct />} />
            <Route
              path="/products/:id/edit"
              element={<AdminEditProduct />}
            />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/users/create" element={<UserForm />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/users/:id/edit" element={<UserForm />} />
            <Route path="/store" element={<StoreManagement />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
