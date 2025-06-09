import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../store/slices/cartSlice";
import { TrashIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import type { RootState } from "../store";
import type { CartItem } from "../store/slices/cartSlice";

const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, total } = useAppSelector((state: RootState) => state.cart);

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(updateQuantity({ id, quantity }));
    }
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-gray-600 mb-8">
            Start shopping to add items to your cart
          </p>
          <Link
            to="/products"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-8 gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Shopping Cart
        </h1>
        <button
          onClick={handleClearCart}
          className="text-red-600 hover:text-red-700 text-sm self-start sm:self-center"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            
            {items.map((item: CartItem) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-6 border-b border-gray-200 last:border-b-0 gap-4"
              >
                {/* Product Image and Info */}
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                  <img
                    src={
                      item.image ||
                      "http://localhost:5000/api/placeholder/300/250"
                    }
                    alt={item.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      ₹{(item.price || 0).toFixed(2)}
                    </p>

                    {/* Show subscription indicator */}
                    {item.hasSubscription && (
                      <div className="mt-1">
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          🔄 Subscription Product
                        </span>
                      </div>
                    )}

                    {/* Show customization details for customized bowls */}
                    {item.customization && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 font-medium">
                          Customized with:
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.customization.selectedFruits.map(
                            (fruit, index) => (
                              <span
                                key={index}
                                className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                              >
                                {fruit.fruitName} x{fruit.quantity}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quantity Controls and Actions */}
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>

                    <span className="w-12 text-center font-semibold">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-base sm:text-lg font-semibold text-gray-900">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-700 mt-1"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4">
              Order Summary
            </h3>

            {/* Subscription Notice */}
            {items.some((item) => item.hasSubscription) && (
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800 font-medium">
                  🔄 Subscription Order
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  This order contains subscription products. We'll contact you
                  to confirm delivery schedule.
                </p>
              </div>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>₹0.00</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Proceed to Checkout
            </button>

            <Link
              to="/products"
              className="block text-center text-green-600 hover:text-green-700 mt-4"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
