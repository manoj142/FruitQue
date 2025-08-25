import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { fetchBowlProducts } from "../store/slices/productSlice";
import ProductCard from "../components/Product/ProductCard";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import type { RootState } from "../store";
import type { Product } from "../store/slices/productSlice";

const Products: React.FC = () => {
  const dispatch = useAppDispatch();
  const { bowlProducts, isLoading } = useAppSelector(
    (state: RootState) => state.products
  );

  useEffect(() => {
    dispatch(fetchBowlProducts({}));
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Promotional Banner */}
      <section className="w-full overflow-hidden">
        <img
          src="/test2.jpeg"
          alt="Fresh Delivery, Eco-Friendly Way"
          className="w-full h-auto max-h-[60vh] object-cover object-center"
        />
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Bowl Products Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🥗 Fresh Delicious Bowls
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bowlProducts.map((product: Product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          {bowlProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No bowl products available at the moment.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Products;
