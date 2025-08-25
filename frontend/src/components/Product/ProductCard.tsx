import React from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { addToCart, updateQuantity } from "../../store/slices/cartSlice";
import { Product } from "../../store/slices/productSlice";
import { toast } from "../UI/Toast";
import BowlCustomizationModal from "./BowlCustomizationModal";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);
  const [showCustomizationModal, setShowCustomizationModal] =
    React.useState(false);
  const addButtonRef = React.useRef<HTMLButtonElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const isAvailable = product.isAvailable !== false && product.stock > 0;

  // Check if this is a customizable bowl
  const isCustomizableBowl =
    product.productType === "bowl" && product.isCustomizable;

  // Check if this is a subscription product
  const isSubscriptionProduct = product.hasSubscription;
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAvailable || product.stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    // If it's a customizable bowl, open the customization modal
    if (isCustomizableBowl) {
      setShowCustomizationModal(true);
      return;
    } // For regular products, add directly to cart
    dispatch(
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0] || "",
        stock: product.stock,
        unit: product.unit,
        category: product.category,
        hasSubscription: product.hasSubscription,
      })
    );

    toast.success(`${product.name} added to cart!`);
  }; // Check if this product is already in cart
  // For customizable bowls, we need to count all instances (each customization is separate)
  // Customized bowls have IDs like: ${bowl._id}-${timestamp}
  const cartQuantity = isCustomizableBowl
    ? items
        .filter(
          (item) =>
            item.id === product._id || // Direct match for non-customized
            (item.customization &&
              item.customization.baseProduct === product._id) // Match customized bowls
        )
        .reduce((total, item) => total + item.quantity, 0)
    : items.find((item) => item.id === product._id)?.quantity || 0;

  const isInCart = cartQuantity > 0;
  // Debug logging
  React.useEffect(() => {
    console.log(`Product ${product.name}:`, {
      cartQuantity,
      isInCart,
      isCustomizableBowl,
      isSubscriptionProduct,
      itemsInCart: items.filter((item) => item.id === product._id),
    });
  }, [
    cartQuantity,
    isInCart,
    product.name,
    items,
    product._id,
    isCustomizableBowl,
    isSubscriptionProduct,
  ]);
  const handleIncreaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (cartQuantity >= product.stock) {
      toast.error("Cannot add more items. Stock limit reached.");
      return;
    }

    if (isCustomizableBowl) {
      // For customizable bowls, open the customization modal to add a new customized bowl
      setShowCustomizationModal(true);
    } else {
      // For regular products, increase quantity of existing item
      dispatch(
        updateQuantity({
          id: product._id,
          quantity: cartQuantity + 1,
        })
      );
    }
  };

  const handleDecreaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCustomizableBowl) {
      // For customizable bowls, find the most recent customized bowl and remove it
      const customizedBowls = items.filter(
        (item) =>
          item.customization && item.customization.baseProduct === product._id
      );
      const directBowls = items.filter((item) => item.id === product._id);

      // Remove the most recent item (either direct or customized)
      if (customizedBowls.length > 0) {
        // Remove the most recent customized bowl
        const mostRecentCustomized =
          customizedBowls[customizedBowls.length - 1];
        if (mostRecentCustomized.quantity > 1) {
          dispatch(
            updateQuantity({
              id: mostRecentCustomized.id,
              quantity: mostRecentCustomized.quantity - 1,
            })
          );
        } else {
          dispatch(
            updateQuantity({
              id: mostRecentCustomized.id,
              quantity: 0,
            })
          );
        }
      } else if (directBowls.length > 0) {
        // Remove from direct bowl
        const directBowl = directBowls[0];
        if (directBowl.quantity > 1) {
          dispatch(
            updateQuantity({
              id: directBowl.id,
              quantity: directBowl.quantity - 1,
            })
          );
        } else {
          dispatch(
            updateQuantity({
              id: directBowl.id,
              quantity: 0,
            })
          );
        }
      }
    } else {
      // For regular products, decrease quantity
      if (cartQuantity > 1) {
        dispatch(
          updateQuantity({
            id: product._id,
            quantity: cartQuantity - 1,
          })
        );
      } else {
        dispatch(
          updateQuantity({
            id: product._id,
            quantity: 0,
          })
        );
        toast.success(`${product.name} removed from cart!`);
      }
    }
  };
  return (
    <div className="group" ref={cardRef}>
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group-hover:border-green-300 group-hover:-translate-y-1">
        {/* Image Container */}
                  {/* Image Container */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-orange-50 h-48 flex items-center justify-center">
          <img
            src={
              product.images[0] ||
              "http://localhost:5000/api/placeholder/300/250"
            }
            alt={product.name}
            className="h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        {/* Content */}
        <div className="p-5">
          <h3 className="font-bold text-gray-900 mb-2 text-lg leading-tight">
            {product.name}
          </h3>          {/* Product Description */}
          {product.description && (
            <div className="mb-3 bg-gray-50 rounded-lg p-3 border-l-4 border-green-400">
              <div className="text-sm text-gray-700 leading-relaxed space-y-1">
                {product.description
                  .split(',')
                  .filter(point => point.trim())
                  .map((point, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-green-500 font-bold mt-0.5 text-xs">•</span>
                      <span className="flex-1">{point.trim()}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
          {/* Price */}
          <div className="mb-4">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-green-600">
                ₹{product.price > 0 ? product.price.toFixed(0) : "0"}
              </span>
            </div>
          </div>          {/* Add to Cart Button Logic:
              - Regular products: Show ADD button only when NOT in cart
              - Customizable bowls: Show ADD button only when NOT in cart (opens modal)
              - Subscription products: Show ADD button only when NOT in cart
          */}
          {!isInCart ? (
            <div className="flex justify-end mt-2">
              <button
                ref={addButtonRef}
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className={`px-5 py-2 rounded-lg text-xl font-medium ${
                  !isAvailable
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                ADD
              </button>
            </div>
          ) : null}
          {/* Quantity Controls - show if in cart and not subscription product */}
          {isInCart && !isSubscriptionProduct && (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-2 mt-2">
              <button
                onClick={handleDecreaseQuantity}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <span className="text-lg font-bold">-</span>
              </button>
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium text-green-700">
                  {cartQuantity} in cart
                </span>
                <span className="text-xs text-green-600">
                  ₹{(product.price * cartQuantity).toFixed(0)}
                </span>
              </div>
              <button
                onClick={handleIncreaseQuantity}
                disabled={cartQuantity >= product.stock}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                  cartQuantity >= product.stock
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                <span className="text-lg font-bold">+</span>
              </button>
            </div>
          )}
          {/* Message for Subscription Products */}
          {isInCart && isSubscriptionProduct && (
            <div className="flex items-center justify-center bg-purple-50 border border-purple-200 rounded-lg p-2 mt-2">
              <span className="text-sm font-medium text-purple-700">
                Added to cart
              </span>
            </div>
          )}
        </div>
      </div>
      {/* Customization Modal */}
      {isCustomizableBowl && (
        <BowlCustomizationModal
          isOpen={showCustomizationModal}
          onClose={() => setShowCustomizationModal(false)}
          bowl={product}
          cardRef={cardRef}
        />
      )}
    </div>
  );
};

export default ProductCard;
