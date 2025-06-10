import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  createProduct,
  updateProduct,
  fetchFruitProducts,
} from "../../store/slices/productSlice";
import { Product } from "../../store/slices/productSlice";

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSuccess,
  onCancel,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { fruitProducts, isLoading } = useSelector(
    (state: RootState) => state.products
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    productType: "bowl" as "fruit" | "bowl",
    price: 0,
    originalPrice: 0,
    discount: 0,
    images: [""],
    season: "",
    isSeasonal: false, // Bowl-specific fields
    isCustomizable: false,
    hasSubscription: false,
    subProducts: [] as string[],
    maxSubProducts: 5,
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  // Load fruit products on mount for bowl subproducts selection
  useEffect(() => {
    dispatch(fetchFruitProducts({}));
  }, [dispatch]); // Populate form when editing a product
  useEffect(() => {
    if (product) {
      console.log("Editing product with subProducts:", product.subProducts);
      setFormData({
        name: product.name || "",
        description: product.description || "",
        productType: product.productType || "bowl",
        price: product.price || 0,
        originalPrice: product.originalPrice || 0,
        discount: product.discount || 0,
        images:
          product.images && product.images.length > 0 ? product.images : [""],
        season: Array.isArray(product.season) ? product.season.join(", ") : "",
        isSeasonal: product.isSeasonal || false,
        isCustomizable: product.isCustomizable || false,
        hasSubscription: product.hasSubscription || false,
        subProducts:
          product.subProducts && Array.isArray(product.subProducts)
            ? product.subProducts.map((p) =>
                typeof p === "string" ? p : p._id
              )
            : [],
        maxSubProducts: product.maxSubProducts || 5,
      });
    }
  }, [product]);
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Product name is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Product description is required";
    }

    // Allow price to be 0 for fruit type (since they're not sold directly)
    if (formData.price < 0) {
      errors.price = "Price cannot be negative";
    }

    // For bowl type, price must be greater than 0
    if (
      formData.productType === "bowl" &&
      (!formData.price || formData.price <= 0)
    ) {
      errors.price = "Price must be greater than 0 for bowl products";
    }

    if (!formData.images[0] || !formData.images[0].trim()) {
      errors.images = "At least one image URL is required";
    } // Product type specific validation
    if (formData.productType === "fruit") {
      if (!formData.season.trim()) {
        errors.season = "Season is required for fruit products";
      }
    } else if (formData.productType === "bowl") {
      // Only require fruits for customizable bowls, not for subscription products
      if (formData.isCustomizable && formData.subProducts.length === 0) {
        errors.subProducts = "Please select fruits for customizable bowls";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prevent multiple API calls
    if (isLoading) {
      return;
    }

    try {
      // Prepare product data - convert season to array for API compatibility
      const productData = {
        name: formData.name,
        description: formData.description,
        productType: formData.productType,
        price: formData.price,
        originalPrice: formData.originalPrice,
        discount: formData.discount,
        images: formData.images.filter((img) => img.trim()),
        season: formData.season
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        isSeasonal: formData.isSeasonal,
        // Add default values for backend validation that expects these fields
        category: formData.productType === "fruit" ? "fruits" : "bowls",
        unit: "kg",
        stock: 100, // Include type-specific fields
        ...(formData.productType === "bowl"
          ? {
              isCustomizable: formData.isCustomizable,
              hasSubscription: formData.hasSubscription,
              subProducts: formData.subProducts,
              maxSubProducts: formData.maxSubProducts,
            }
          : {}),
      };
      if (product?._id) {
        // Convert string subProduct IDs to proper Product[] format for API
        const apiProductData = {
          ...productData,
          subProducts: productData.subProducts
            ? (productData.subProducts.map((id) => ({
                _id: id,
              })) as unknown as Product[])
            : [],
        };
        console.log(
          "Updating product with subProducts:",
          apiProductData.subProducts
        );
        await dispatch(
          updateProduct({ id: product._id, productData: apiProductData })
        ).unwrap();
      } else {
        // Convert string subProduct IDs to proper Product[] format for API
        const apiProductData = {
          ...productData,
          subProducts: productData.subProducts
            ? (productData.subProducts.map((id) => ({
                _id: id,
              })) as unknown as Product[])
            : [],
        };
        console.log(
          "Creating product with subProducts:",
          apiProductData.subProducts
        );
        await dispatch(createProduct(apiProductData)).unwrap();
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "number"
            ? value === ""
              ? ""
              : parseFloat(value) || 0
            : value,
      }));
    }
  };
  const handleSubProductChange = (fruitId: string, checked: boolean) => {
    console.log(
      `SubProduct change: ${fruitId} - ${checked ? "added" : "removed"}`
    );
    setFormData((prev) => {
      const newSubProducts = checked
        ? [...prev.subProducts, fruitId]
        : prev.subProducts.filter((id) => id !== fruitId);

      console.log("Updated subProducts:", newSubProducts);
      return {
        ...prev,
        subProducts: newSubProducts,
      };
    });
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const removeImageField = (index: number) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, images: newImages }));
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Type Selection */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Product Type
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="productType"
                value="fruit"
                checked={formData.productType === "fruit"}
                onChange={handleInputChange}
                className="text-blue-600"
              />
              <span className="font-medium">🍎 Fruit Product</span>
              <small className="text-gray-600">
                (Individual fruits for sale or use in bowls)
              </small>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="productType"
                value="bowl"
                checked={formData.productType === "bowl"}
                onChange={handleInputChange}
                className="text-blue-600"
              />
              <span className="font-medium">🥗 Bowl Product</span>
              <small className="text-gray-600">
                (Fruit bowls shown to customers)
              </small>
            </label>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  validationErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter product name"
              />
              {validationErrors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  validationErrors.description
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter product description"
              />
              {validationErrors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price * (₹)
                  {formData.productType === "fruit" && (
                    <small className="block text-gray-500">
                      Can be 0 for fruits used only in bowls
                    </small>
                  )}
                </label>{" "}
                <input
                  type="number"
                  name="price"
                  value={formData.price === 0 ? "" : formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    validationErrors.price
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter price"
                />
                {validationErrors.price && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.price}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Price (₹)
                </label>{" "}
                <input
                  type="number"
                  name="originalPrice"
                  value={
                    formData.originalPrice === 0 ? "" : formData.originalPrice
                  }
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter original price"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount (%)
              </label>{" "}
              <input
                type="number"
                name="discount"
                value={formData.discount === 0 ? "" : formData.discount}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter discount percentage"
              />
            </div>
          </div>

          {/* Season & Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Season & Settings
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Season * (comma separated)
              </label>
              <input
                type="text"
                name="season"
                value={formData.season}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  validationErrors.season ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="summer, winter, monsoon, year-round"
              />
              {validationErrors.season && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.season}
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isSeasonal"
                checked={formData.isSeasonal}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">
                Seasonal Product
              </label>
            </div>
          </div>
        </div>
        {/* Product Type Specific Fields */}
        {formData.productType === "bowl" && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🥗 Bowl Specific Details
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isCustomizable"
                  checked={formData.isCustomizable}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Customizable Bowl
                  <small className="block text-gray-500">
                    Customers can modify fruit selection
                  </small>
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="hasSubscription"
                  checked={formData.hasSubscription}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Subscription Available
                  <small className="block text-gray-500">
                    Offer as recurring subscription
                  </small>
                </label>
              </div>
            </div>
            {/* Max SubProducts field for customizable bowls */}
            {formData.isCustomizable && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Fruits Selectable
                  <small className="block text-gray-500">
                    Maximum number of different fruits customers can select
                  </small>
                </label>{" "}
                <input
                  type="number"
                  name="maxSubProducts"
                  value={
                    formData.maxSubProducts === 0 ? "" : formData.maxSubProducts
                  }
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  placeholder="5"
                />
              </div>
            )}{" "}
            {(formData.isCustomizable || formData.hasSubscription) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Fruits for this Bowl{" "}
                  {formData.isCustomizable && !formData.hasSubscription
                    ? "*"
                    : ""}
                  {formData.hasSubscription && !formData.isCustomizable && (
                    <span className="text-sm text-gray-500 font-normal">
                      {" "}
                      (Optional for subscription products)
                    </span>
                  )}
                  {formData.isCustomizable && (
                    <span className="text-sm text-gray-500 font-normal">
                      {" "}
                      (Required for customizable bowls)
                    </span>
                  )}
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {fruitProducts.length > 0 ? (
                    fruitProducts.map((fruit: Product) => {
                      // Debug which fruits are in the subProducts array
                      console.log(
                        `Fruit ${fruit.name} (${fruit._id}): ${
                          formData.subProducts.includes(fruit._id)
                            ? "selected"
                            : "not selected"
                        }`
                      );

                      return (
                        <div key={fruit._id} className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={formData.subProducts.includes(fruit._id)}
                            onChange={(e) =>
                              handleSubProductChange(
                                fruit._id,
                                e.target.checked
                              )
                            }
                            className="mr-2"
                          />
                          <span className="text-sm">{fruit.name}</span>
                          {fruit.season &&
                            Array.isArray(fruit.season) &&
                            fruit.season.length > 0 && (
                              <span className="ml-2 text-xs text-gray-500">
                                ({fruit.season.join(", ")})
                              </span>
                            )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No fruit products available. Create fruits first.
                    </p>
                  )}
                </div>
                {validationErrors.subProducts && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.subProducts}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        {/* Images */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Product Images
          </h3>
          <div className="space-y-2">
            {formData.images.map((image, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  placeholder="Enter image URL"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addImageField}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add Image
            </button>
            {validationErrors.images && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.images}
              </p>
            )}
          </div>
        </div>
        {/* Form Actions */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {isLoading
              ? "Saving..."
              : product
              ? "Update Product"
              : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
