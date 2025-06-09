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
      </div>
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManagement;
