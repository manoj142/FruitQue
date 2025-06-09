import React from "react";
import { useNavigate } from "react-router-dom";
import ProductForm from "./ProductForm";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const CreateProduct: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/admin/productmanagement");
  };

  const handleCancel = () => {
    navigate("/admin/productmanagement");
  };

  const handleClose = () => {
    navigate("/admin/productmanagement");
  };

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
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Product
          </h1>
          <p className="text-gray-600 mt-1">
            Add a new product to your inventory
          </p>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <ProductForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;
