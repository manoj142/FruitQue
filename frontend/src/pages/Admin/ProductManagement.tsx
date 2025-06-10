import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../store";
import {
  fetchProducts,
  deleteProduct,
  setFilters,
  setCurrentPage,
  clearError,
} from "../../store/slices/productSlice";
import { Product } from "../../store/slices/productSlice";

const AdminProductManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { products, isLoading, error, pagination, filters } = useSelector(
    (state: RootState) => state.products
  );

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductType, setSelectedProductType] = useState<
    "all" | "fruit" | "bowl"
  >("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    loadProducts();
  }, [dispatch, pagination.currentPage, filters, selectedProductType]);

  const loadProducts = () => {
    const params = {
      page: pagination.currentPage,
      limit: pagination.limit,
      search: filters.search,
      inStock: filters.inStock,
      productType:
        selectedProductType !== "all" ? selectedProductType : undefined,
      sort: `${sortBy}:${sortOrder}`,
    };
    dispatch(fetchProducts(params));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchTerm }));
    dispatch(setCurrentPage(1));
  };
  // Category filter removed

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };
  const handleEdit = (product: Product) => {
    navigate(`/admin/products/${product._id}/edit`);
  };

  const handleDelete = async (productId: string) => {
    try {
      await dispatch(deleteProduct(productId)).unwrap();
      setDeleteConfirm(null);
      // Refresh the product list
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
        <button
          onClick={() => navigate("/admin/products/create")}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Add New Product
        </button>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => dispatch(clearError())}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
          {/* Product Type Filter */}
          <div className="lg:w-48">
            <select
              value={selectedProductType}
              onChange={(e) =>
                setSelectedProductType(
                  e.target.value as "all" | "fruit" | "bowl"
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Types</option>
              <option value="fruit">🍎 Fruits</option>
              <option value="bowl">🥗 Bowls</option>
            </select>
          </div>
        </div>
      </div>
      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1 font-medium text-gray-900 hover:text-green-600"
                >
                  Name {getSortIcon("name")}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort("productType")}
                  className="flex items-center gap-1 font-medium text-gray-900 hover:text-green-600"
                >
                  Type {getSortIcon("productType")}
                </button>
              </th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    <span className="ml-2">Loading products...</span>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No products found. Try adjusting your filters or add a new
                  product.
                </td>
              </tr>
            ) : (
              products
                .filter((product) => product && product._id)
                .map((product: Product) => (
                  <tr
                    key={product._id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {product?.name || "Unnamed Product"}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product?.description || "No description available"}
                        </div>
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="mt-2 w-12 h-12 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/api/placeholder/48/48";
                            }}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          product?.productType === "fruit"
                            ? "bg-green-100 text-green-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {product?.productType === "fruit"
                          ? "🍎 Fruit"
                          : "🥗 Bowl"}
                      </span>
                      {/* Additional type-specific info */}
                      {product?.productType === "fruit" && product?.season && (
                        <div className="text-xs text-gray-500 mt-1">
                          Season:
                          {Array.isArray(product.season)
                            ? product.season.join(", ")
                            : product.season}
                        </div>
                      )}
                      {product?.productType === "bowl" && (
                        <div className="text-xs text-gray-500 mt-1 space-y-1">
                          {product?.isCustomizable && (
                            <div>🎨 Customizable</div>
                          )}
                          {product?.hasSubscription && (
                            <div>📅 Subscription</div>
                          )}
                          {product?.subProducts &&
                            product.subProducts.length > 0 && (
                              <div>{product.subProducts.length} fruits</div>
                            )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          (product?.stock || 0) > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {(product?.stock || 0) > 0
                          ? "In Stock"
                          : "Out of Stock"}
                      </span>
                      {product?.isOrganic && (
                        <div className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full mt-1 mr-1">
                          Organic
                        </div>
                      )}
                      {product?.isSeasonal && (
                        <div className="inline-block px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full mt-1">
                          Seasonal
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            product._id && setDeleteConfirm(product._id)
                          }
                          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 border rounded-lg ${
                  page === pagination.currentPage
                    ? "bg-green-500 text-white border-green-500"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
      {/* Summary */}
      <div className="mt-4 text-sm text-gray-600 text-center">
        Showing {products.length} of {pagination.totalProducts} products
      </div>      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-2 sm:p-4">
          <div 
            className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-md mx-2 sm:mx-auto transform transition-all duration-300 ease-out shadow-2xl border border-white border-opacity-20"
            onClick={(e) => e.stopPropagation()}
          >            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100 border-opacity-30">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-red-100 bg-opacity-80 rounded-full backdrop-blur-sm">
                <svg 
                  className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center">
                Delete Product
              </h3>
            </div>            {/* Content */}
            <div className="p-4 sm:p-6">
              <p className="text-sm sm:text-base text-gray-600 text-center leading-relaxed">
                Are you sure you want to delete this product? This action cannot be undone and will permanently remove all associated data.
              </p>
            </div>            {/* Actions */}
            <div className="p-4 sm:p-6 bg-gray-50 bg-opacity-60 backdrop-blur-sm rounded-b-xl sm:rounded-b-2xl flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 border-opacity-60 rounded-lg sm:rounded-xl text-gray-700 font-medium bg-white bg-opacity-80 hover:bg-opacity-100 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 backdrop-blur-sm text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 bg-opacity-90 text-white rounded-lg sm:rounded-xl font-medium hover:bg-opacity-100 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm text-sm sm:text-base"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManagement;
