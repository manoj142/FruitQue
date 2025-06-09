import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-green-50 to-emerald-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Fresh Fruits
              <span className="text-green-500 block">Delivered Daily</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-lg">
              Farm-fresh, organic fruits delivered straight to your doorstep. 
              Quality guaranteed, taste perfected.
            </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl"
              >
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                Shop Now
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">1000+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">50+</div>
                <div className="text-gray-600">Fruit Varieties</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">24/7</div>
                <div className="text-gray-600">Fresh Delivery</div>
              </div>
            </div>
          </div>

          {/* Image Content */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-green-400/20 to-emerald-400/20 rounded-3xl transform rotate-6"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-red-100 to-red-200 rounded-2xl p-6 text-center">
                    <div className="text-4xl mb-2">🍎</div>
                    <div className="font-semibold text-gray-800">Fresh Apples</div>
                    <div className="text-green-500 font-bold">₹2.99/lb</div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-2xl p-6 text-center">
                    <div className="text-4xl mb-2">🍊</div>
                    <div className="font-semibold text-gray-800">Sweet Oranges</div>
                    <div className="text-green-500 font-bold">₹3.49/lb</div>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl p-6 text-center">
                    <div className="text-4xl mb-2">🍌</div>
                    <div className="font-semibold text-gray-800">Ripe Bananas</div>
                    <div className="text-green-500 font-bold">₹1.99/lb</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-2xl p-6 text-center">
                    <div className="text-4xl mb-2">🍇</div>
                    <div className="font-semibold text-gray-800">Fresh Grapes</div>
                    <div className="text-green-500 font-bold">₹4.99/lb</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-20 h-20 bg-green-200 rounded-full opacity-50 animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-16 h-16 bg-emerald-200 rounded-full opacity-50 animate-pulse"></div>
    </section>
  );
};

export default Hero;
