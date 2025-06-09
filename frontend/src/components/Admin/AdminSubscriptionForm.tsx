import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  createSubscription,
  updateSubscription,
} from "../../store/slices/subscriptionSlice";
import { fetchProducts, Product } from "../../store/slices/productSlice";
import LoadingSpinner from "../UI/LoadingSpinner";

interface AdminSubscriptionFormProps {
  subscriptionId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AdminSubscriptionForm({
  subscriptionId,
  onClose,
  onSuccess,
}: AdminSubscriptionFormProps) {
  const dispatch = useAppDispatch();
  const { subscriptions, loading } = useAppSelector(
    (state) => state.subscriptions
  );
  const { products } = useAppSelector((state) => state.products);

  const [isEditing, setIsEditing] = useState(false);
  const [existingSubscription, setExistingSubscription] = useState<any>(null);

  // Customer Details State
  const [customerDetails, setCustomerDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });
  const [formData, setFormData] = useState({
    type: "weekly" as "weekly" | "biweekly" | "monthly",
    status: "active" as "active" | "paused" | "cancelled",
    items: [] as { product: string; quantity: number }[],
    deliveryInstructions: "",
    paymentMethod: "cod" as "cod" | "online" | "upi",
    startDate: new Date().toISOString().split("T")[0],
  });

  const [selectedProducts, setSelectedProducts] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);

  // Handle editing mode
  useEffect(() => {
    if (subscriptionId && subscriptions) {
      const subscription = subscriptions.find(
        (sub: any) => sub._id === subscriptionId
      );
      if (subscription) {
        setIsEditing(true);
        setExistingSubscription(subscription);

        // Set customer details from existing subscription
        setCustomerDetails({
          firstName: subscription.customerDetails?.firstName || "",
          lastName: subscription.customerDetails?.lastName || "",
          email: subscription.customerDetails?.email || "",
          phone: subscription.customerDetails?.phone || "",
          address: subscription.customerDetails?.address || "",
          city: subscription.customerDetails?.city || "",
          state: subscription.customerDetails?.state || "",
          zipCode: subscription.customerDetails?.zipCode || "",
          country: subscription.customerDetails?.country || "India",
        });
        setFormData({
          type: subscription.type || "weekly",
          status: subscription.status || "active",
          items: subscription.items || [],
          deliveryInstructions: subscription.deliveryInstructions || "",
          paymentMethod: subscription.paymentMethod || "cod",
          startDate: subscription.startDate
            ? new Date(subscription.startDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        });
      }
    }
  }, [subscriptionId, subscriptions]);
  useEffect(() => {
    if (existingSubscription) {
      const productQuantities: { [key: string]: number } = {};
      existingSubscription.items.forEach((item: any) => {
        // Handle both populated and non-populated product references
        const productId =
          typeof item.product === "string" ? item.product : item.product._id;
        productQuantities[productId] = item.quantity;
      });
      setSelectedProducts(productQuantities);
    }
  }, [existingSubscription]);
  const handleProductQuantityChange = (productId: string, quantity: number) => {
    const newSelectedProducts = {
      ...selectedProducts,
      [productId]: quantity,
    };

    setSelectedProducts(newSelectedProducts);

    const items = Object.entries(newSelectedProducts)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, quantity]) => ({
        product: productId,
        quantity,
      }));

    setFormData((prev) => ({ ...prev, items }));
  };
  const calculateTotal = () => {
    return Object.entries(selectedProducts).reduce(
      (total, [productId, quantity]) => {
        const product = products.find((p: any) => p._id === productId);
        return total + (product ? product.price * quantity : 0);
      },
      0
    );
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate customer details
    if (
      !customerDetails.firstName ||
      !customerDetails.lastName ||
      !customerDetails.email ||
      !customerDetails.phone
    ) {
      alert("Please fill in all required customer details");
      return;
    }

    if (formData.items.length === 0) {
      alert("Please select at least one product");
      return;
    }

    try {
      if (isEditing && subscriptionId) {
        const updateData = {
          type: formData.type,
          items: formData.items,
          customerDetails: customerDetails,
          paymentMethod: formData.paymentMethod,
          deliveryInstructions: formData.deliveryInstructions,
          status: formData.status,
        };
        await dispatch(
          updateSubscription({ id: subscriptionId, data: updateData })
        ).unwrap();
      } else {
        const createData = {
          name: `${formData.type} subscription for ${customerDetails.firstName} ${customerDetails.lastName}`,
          type: formData.type,
          items: formData.items,
          customerDetails: customerDetails,
          paymentMethod: formData.paymentMethod,
          deliveryInstructions: formData.deliveryInstructions,
          startDate: formData.startDate,
        };
        await dispatch(createSubscription(createData)).unwrap();
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving subscription:", error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          {isEditing ? "Edit Subscription" : "Create New Subscription"}
        </h2>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Customer Details */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Customer Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={customerDetails.firstName}
                onChange={(e) =>
                  setCustomerDetails((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={customerDetails.lastName}
                onChange={(e) =>
                  setCustomerDetails((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={customerDetails.email}
                onChange={(e) =>
                  setCustomerDetails((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                value={customerDetails.phone}
                onChange={(e) =>
                  setCustomerDetails((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                value={customerDetails.address}
                onChange={(e) =>
                  setCustomerDetails((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={customerDetails.city}
                onChange={(e) =>
                  setCustomerDetails((prev) => ({
                    ...prev,
                    city: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                value={customerDetails.state}
                onChange={(e) =>
                  setCustomerDetails((prev) => ({
                    ...prev,
                    state: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                value={customerDetails.zipCode}
                onChange={(e) =>
                  setCustomerDetails((prev) => ({
                    ...prev,
                    zipCode: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={customerDetails.country}
                onChange={(e) =>
                  setCustomerDetails((prev) => ({
                    ...prev,
                    country: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subscription Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subscription Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value as any,
                }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          {/* Subscription Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as any,
                }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  paymentMethod: e.target.value as any,
                }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="cod">Cash on Delivery</option>
              <option value="online">Online Payment</option>
              <option value="upi">UPI</option>
            </select>
          </div>
        </div>

        {/* Product Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Products
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
            {products
              .filter((product: Product) => product.hasSubscription)
              .map((product: Product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-gray-600">
                      ₹{product.price} per {product.unit}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleProductQuantityChange(
                          product._id,
                          Math.max(0, (selectedProducts[product._id] || 0) - 1)
                        )
                      }
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">
                      {selectedProducts[product._id] || 0}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleProductQuantityChange(
                          product._id,
                          (selectedProducts[product._id] || 0) + 1
                        )
                      }
                      className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
          </div>
          {formData.items.length > 0 && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <p className="font-medium text-green-800">
                Total: ₹{calculateTotal().toFixed(2)} per delivery
              </p>
            </div>
          )}
        </div>

        {/* Delivery Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Instructions (Optional)
          </label>
          <textarea
            placeholder="Any special delivery instructions..."
            value={formData.deliveryInstructions}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                deliveryInstructions: e.target.value,
              }))
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              loading ||
              formData.items.length === 0 ||
              !customerDetails.firstName ||
              !customerDetails.lastName ||
              !customerDetails.email
            }
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Saving..."
              : isEditing
              ? "Update Subscription"
              : "Create Subscription"}
          </button>
        </div>
      </form>
    </div>
  );
}
