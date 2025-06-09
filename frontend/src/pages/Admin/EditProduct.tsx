import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import ProductForm from "./ProductForm";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const EditProduct: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { products } = useSelector((state: RootState) => state.products);

  // Find the product to edit
  const product = products.find((p) => p._id === id);

  const handleSuccess = () => {
    navigate("/admin/productmanagement");
  };

  const handleCancel = () => {
    navigate("/admin/productmanagement");
  };

  const handleClose = () => {
    navigate("/admin/productmanagement");
  };

  if (!product) {
    return (
      <div>
        {/* Back Button */}
        <button
          onClick={handleClose}
          className="flex items-center text-green-600 hover:text-green-700 mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Product Management
        </button>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Product Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The product you're trying to edit could not be found.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={handleClose}
        className="flex items-center text-green-600 hover:text-green-700 mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Back to Product Management
      </button>

      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600 mt-1">
            Update {product.name} information
          </p>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <ProductForm
            product={product}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
