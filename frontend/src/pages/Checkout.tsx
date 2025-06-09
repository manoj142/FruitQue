import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { clearCart } from "../store/slices/cartSlice";
import { fetchStore } from "../store/slices/storeSlice";
import { toast } from "../components/UI/Toast";
import { sendOrderViaWhatsApp } from "../services/whatsapp";
import type { RootState } from "../store";
import type { CartItem } from "../store/slices/cartSlice";

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, total } = useAppSelector((state: RootState) => state.cart);
  const { store } = useAppSelector((state: RootState) => state.store);

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  // Fetch store data when component mounts
  useEffect(() => {
    dispatch(fetchStore());
  }, [dispatch]);
  const subtotal = total;
  const grandTotal = subtotal;
  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !shippingInfo.firstName ||
      !shippingInfo.lastName ||
      !shippingInfo.phone ||
      !shippingInfo.address
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Directly send to WhatsApp instead of going to payment step
    handleWhatsAppOrder();
  };

  const handleWhatsAppOrder = () => {
    console.log("WhatsApp button clicked!");
    console.log("Cart items:", items);
    console.log("Shipping info:", shippingInfo); // Convert cart items to WhatsApp order format
    const whatsappItems = items.map((item: CartItem) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      hasSubscription: item.hasSubscription, // Include subscription data
      customization: item.customization, // Include customization data
    }));

    // Customer info from shipping form
    const customerInfo = {
      firstName: shippingInfo.firstName,
      lastName: shippingInfo.lastName,
      email: shippingInfo.email,
      phone: shippingInfo.phone,
      address: shippingInfo.address,
      city: shippingInfo.city,
      state: shippingInfo.state,
      zipCode: shippingInfo.zipCode,
    };
    console.log("WhatsApp items:", whatsappItems);
    console.log("Customer info:", customerInfo);
    console.log("Grand total:", grandTotal);
    try {
      sendOrderViaWhatsApp(whatsappItems, customerInfo, grandTotal, 0, store);
      toast.success(
        "Order details sent to WhatsApp! We will contact you shortly for confirmation."
      );

      // Clear cart after sending to WhatsApp
      dispatch(clearCart());
      navigate("/");
    } catch (error) {
      console.error("WhatsApp error:", error);
      toast.error("Failed to open WhatsApp. Please try again.");
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-gray-600 mb-8">
            Add some items to your cart before checkout
          </p>
          <button
            onClick={() => navigate("/products")}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Shipping Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Delivery Information</h3>
            <p className="text-gray-600 mb-6">
              Please provide your delivery details. We'll send your order
              details via WhatsApp for confirmation.
            </p>
            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.firstName}
                    onChange={(e) =>
                      setShippingInfo({
                        ...shippingInfo,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.lastName}
                    onChange={(e) =>
                      setShippingInfo({
                        ...shippingInfo,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={shippingInfo.email}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={shippingInfo.phone}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={shippingInfo.address}
                  onChange={(e) =>
                    setShippingInfo({
                      ...shippingInfo,
                      address: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.city}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, city: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.state}
                    onChange={(e) =>
                      setShippingInfo({
                        ...shippingInfo,
                        state: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.zipCode}
                    onChange={(e) =>
                      setShippingInfo({
                        ...shippingInfo,
                        zipCode: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
                <span>Send Order via WhatsApp - ₹{grandTotal.toFixed(0)}</span>
              </button>
              <div className="text-xs text-gray-500 text-center mt-3">
                <p>
                  💬 Your order details will be sent via WhatsApp. We'll contact
                  you for confirmation and payment options (Cash on Delivery
                  available).
                </p>
              </div>
            </form>
          </div>
        </div>
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            {/* Subscription Notice */}
            {items.some((item) => item.hasSubscription) && (
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800 font-medium">
                  🔄 Subscription Order
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  This order contains subscription products. Total amount shown
                  is for the entire subscription. We'll contact you to confirm
                  delivery schedule and payment options.
                </p>
              </div>
            )}
            <div className="space-y-2 mb-4">
              {items.map((item: CartItem) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    {item.hasSubscription && (
                      <div className="text-xs text-purple-600">
                        🔄 Subscription
                      </div>
                    )}
                  </div>
                  <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>
            <hr className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>₹0.00</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>₹{grandTotal.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
