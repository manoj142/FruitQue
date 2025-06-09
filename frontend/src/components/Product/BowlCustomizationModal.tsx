import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAppDispatch } from "../../hooks/redux";
import { addToCart } from "../../store/slices/cartSlice";
import { Product } from "../../store/slices/productSlice";
import { toast } from "../UI/Toast";

interface BowlCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bowl: Product;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

interface SelectedFruit {
  fruit: Product;
  quantity: number;
}

const BowlCustomizationModal: React.FC<BowlCustomizationModalProps> = ({
  isOpen,
  onClose,
  bowl,
}) => {
  const dispatch = useAppDispatch();
  const [selectedFruits, setSelectedFruits] = useState<SelectedFruit[]>([]);
  const [totalPrice, setTotalPrice] = useState(bowl.price);

  // Initialize with empty selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFruits([]); // Start with empty selection
      setTotalPrice(bowl.price); // Start with base bowl price
    }
  }, [isOpen, bowl.price]);

  // Calculate total price when selected fruits change
  useEffect(() => {
    const fruitsTotal = selectedFruits.reduce((total, item) => {
      // For fruits with actual price, charge 10% as add-on fee
      // For fruits with 0 or undefined price, they are free add-ons
      const addOnPrice =
        item.fruit.price && item.fruit.price > 0
          ? item.fruit.price * 0.1 // 10% of fruit price
          : 0; // Completely free for fruits with 0 price
      return total + addOnPrice * item.quantity;
    }, 0);
    setTotalPrice(bowl.price + fruitsTotal);
  }, [selectedFruits, bowl.price]);
  const handleFruitSelection = (fruitId: string) => {
    setSelectedFruits((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.fruit._id === fruitId
      );

      if (existingIndex >= 0) {
        // Remove if already selected
        return prev.filter((item) => item.fruit._id !== fruitId);
      } else {
        // Check if adding a new fruit would exceed the maximum limit
        const maxSubProducts = bowl.maxSubProducts || 5; // Default to 5 if not set

        if (prev.length >= maxSubProducts) {
          toast.error(
            `You can only select up to ${maxSubProducts} different fruits for this bowl`
          );
          return prev;
        }

        const fruit = bowl.subProducts?.find((f) => f._id === fruitId);
        if (fruit) {
          return [...prev, { fruit, quantity: 1 }]; // Always quantity 1
        }
      }
      return prev;
    });
  };
  const handleAddToCart = () => {
    // Only allow adding if at least one fruit is selected
    if (selectedFruits.length === 0) {
      toast.error("Please select at least one fruit to customize your bowl");
      return;
    }
    const customizedBowlName = `${bowl.name} (Customized)`;
    const fruitsDescription = selectedFruits
      .map((item) => item.fruit.name)
      .join(", "); // Add the customized bowl to cart
    dispatch(
      addToCart({
        id: `${bowl._id}-${Date.now()}`, // Unique ID for customized bowl
        name: customizedBowlName,
        price: totalPrice,
        image: bowl.images[0] || "",
        stock: bowl.stock,
        unit: bowl.unit,
        category: bowl.category,
        hasSubscription: bowl.hasSubscription,
        // Add custom properties to track customization
        customization: {
          baseProduct: bowl._id,
          selectedFruits: selectedFruits.map((item) => ({
            fruitId: item.fruit._id,
            fruitName: item.fruit.name,
            quantity: item.quantity,
          })),
        },
      })
    );

    const message = `${customizedBowlName} added to cart! Includes: ${fruitsDescription}`;

    toast.success(message);
    onClose();
  };
  const isSelected = (fruitId: string) => {
    return selectedFruits.some((item) => item.fruit._id === fruitId);
  };
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden shadow-xl relative border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-bold text-gray-900">
            Customize {bowl.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        {/* Scrollable Content */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 120px)" }}
        >
          {/* Fruit Selection */}
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Select additional fruits for your bowl:
              </p>
              <p className="text-sm text-gray-500">
                {selectedFruits.length}/{bowl.maxSubProducts || 5} selected
              </p>
            </div>

            <div className="space-y-3">
              {bowl.subProducts?.map((fruit) => {
                const selected = isSelected(fruit._id);
                const maxSubProducts = bowl.maxSubProducts || 5;
                const isAtLimit =
                  selectedFruits.length >= maxSubProducts && !selected;

                // For fruits with actual price, charge 10% as add-on fee
                // For fruits with 0 or undefined price, they are free add-ons
                const addOnPrice =
                  fruit.price && fruit.price > 0 ? fruit.price * 0.1 : 0;

                return (
                  <div
                    key={fruit._id}
                    onClick={() =>
                      !isAtLimit && handleFruitSelection(fruit._id)
                    }
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors cursor-pointer ${
                      selected
                        ? "border-green-500 bg-green-50"
                        : isAtLimit
                        ? "border-gray-200 bg-gray-100 cursor-not-allowed opacity-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          fruit.images?.[0] ||
                          "http://localhost:5000/api/placeholder/60/60"
                        }
                        alt={fruit.name}
                        className="w-10 h-10 rounded-md object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">
                          {fruit.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {addOnPrice > 0
                            ? `₹${addOnPrice.toFixed(0)} per serving`
                            : "Free add-on"}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 border-2 rounded transition-colors ${
                        selected
                          ? "bg-green-500 border-green-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selected && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          {selectedFruits.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Bowl</span>
                  <span>₹{bowl.price}</span>
                </div>
                {selectedFruits.map((item) => {
                  // For fruits with actual price, charge 10% as add-on fee
                  // For fruits with 0 or undefined price, they are free add-ons
                  const addOnPrice =
                    item.fruit.price && item.fruit.price > 0
                      ? item.fruit.price * 0.1
                      : 0;
                  return (
                    <div
                      key={item.fruit._id}
                      className="flex justify-between text-gray-600"
                    >
                      <span>{item.fruit.name}</span>
                      <span>
                        {addOnPrice > 0 ? `₹${addOnPrice.toFixed(0)}` : "Free"}
                      </span>
                    </div>
                  );
                })}
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-green-600">
                      ₹{totalPrice.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white">
          {/* Validation message */}
          {selectedFruits.length === 0 && (
            <p className="text-sm text-red-600 mb-3 text-center">
              Please select at least one fruit to customize your bowl
            </p>
          )}
          <button
            onClick={handleAddToCart}
            disabled={selectedFruits.length === 0}
            className={`w-full px-4 py-3 rounded-lg transition-colors font-medium ${
              selectedFruits.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {selectedFruits.length === 0
              ? "Select fruits to add to cart"
              : `Add to Cart - ₹${totalPrice.toFixed(0)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BowlCustomizationModal;
