import React, { useEffect      {/* Promotional Banner */}
      <section className="w-full">
        <div className="w-full">
          <img
            src="/promotional-banner.jpg"
            alt="Fresh Delivery, Eco-Friendly Way"
            className="w-full h-auto max-h-[50vh] object-contain bg-gradient-to-r from-orange-300 to-yellow-400"
          />
        </div>
      </section>eact";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { fetchSeasonalProducts } from "../store/slices/productSlice";
import ProductCard from "../components/Product/ProductCard";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import Hero from "../components/Home/Hero";
import Features from "../components/Home/Features";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const { seasonalProducts, isLoading } = useAppSelector(
    (state) => state.products
  );

  useEffect(() => {
    dispatch(fetchSeasonalProducts());
  }, [dispatch]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero /> {/* Features Section */}
      <Features />
      {/* Promotional Banner */}
      <section className="w-full">
        <div className="w-full">
          <img
            src="/promotional-banner.jpg"
            alt="Fresh Delivery, Eco-Friendly Way"
            className="w-full h-auto min-h-[200px] sm:min-h-[250px] md:h-[300px] lg:h-[350px] xl:h-[400px] max-h-[50vh] object-cover object-center bg-gradient-to-r from-orange-300 to-yellow-400"
          />
        </div>
      </section>
      {/* Seasonal Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Seasonal Favorites
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Fresh seasonal fruits at their peak flavor and nutritional value
            </p>
          </div>

          {isLoading ? (
            <LoadingSpinner className="py-12" />
          ) : (
            <>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {seasonalProducts && seasonalProducts.length > 0 ? (
                  seasonalProducts
                    .slice(0, 8)
                    .map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">
                      No seasonal products available at the moment.
                    </p>
                  </div>
                )}
              </div>
              <div className="text-center">
                <Link
                  to="/products?seasonal=true"
                  className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors"
                >
                  View All Seasonal Products
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
      {/* Newsletter Section */}
      <section className="py-16 bg-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Fresh with Our Newsletter
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Get the latest updates on seasonal fruits, special offers, and
            healthy recipes
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-l-lg border-0 focus:ring-2 focus:ring-green-300 focus:outline-none"
              />
              <button className="px-6 py-3 bg-green-600 text-white font-medium rounded-r-lg hover:bg-green-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
