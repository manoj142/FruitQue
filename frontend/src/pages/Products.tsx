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
      <section className="py-12 bg-gradient-to-r from-green-400 to-emerald-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">
                🌿 Fresh Delivery, Eco-Friendly Way! 🌿
              </h2>
              <p className="text-xl text-green-50 mb-4">
                Free morning delivery • Minimal plastic packaging • Maximum
                freshness
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold mb-2">Free & Fast</h3>
                <p className="text-green-50">
                  Free delivery between 6AM - 10AM
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
                <div className="text-3xl mb-2">🌱</div>
                <h3 className="font-semibold mb-2">Planet Friendly</h3>
                <p className="text-green-50">
                  Biodegradable packaging, zero waste delivery
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
                <div className="text-3xl mb-2">✨</div>
                <h3 className="font-semibold mb-2">Always Fresh</h3>
                <p className="text-green-50">
                  Picked today, delivered today, enjoyed today!
                </p>
              </div>
            </div>
          </div>
        </div>
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
