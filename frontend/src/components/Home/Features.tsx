import React from "react";
import {
  TruckIcon,
  ShieldCheckIcon,
  HeartIcon,
  ClockIcon,
  SparklesIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

const Features: React.FC = () => {
  const features = [
    {
      icon: TruckIcon,
      title: "Free Delivery",
      description:
        "Free delivery on orders over ₹50. Fast and reliable service to your door.",
      color: "text-blue-500",
    },
    {
      icon: ShieldCheckIcon,
      title: "Quality Guarantee",
      description:
        "100% satisfaction guarantee. Fresh produce or your money back.",
      color: "text-green-500",
    },
    {
      icon: HeartIcon,
      title: "Farm Fresh",
      description:
        "Handpicked from local farms daily. Supporting sustainable agriculture.",
      color: "text-red-500",
    },
    {
      icon: ClockIcon,
      title: "24/7 Service",
      description:
        "Order anytime, anywhere. Customer support available round the clock.",
      color: "text-purple-500",
    },
    {
      icon: SparklesIcon,
      title: "100% Organic",
      description:
        "Certified organic fruits with no harmful pesticides or chemicals.",
      color: "text-emerald-500",
    },
    {
      icon: StarIcon,
      title: "Premium Quality",
      description:
        "Only the finest fruits make it to your basket. Quality you can taste.",
      color: "text-yellow-500",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose FruitQue?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're committed to delivering the freshest fruits with exceptional
            service
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300 group"
              >
                <div className="flex items-center mb-4">
                  <div
                    className={`p-3 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors`}
                  >
                    <IconComponent className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 ml-4">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Fresh from Farm to Your Table
              </h3>
              <p className="text-gray-600 mb-6">
                Our fruits are sourced directly from local farms and delivered
                within 24 hours of harvest. We work closely with farmers to
                ensure sustainable practices and the highest quality produce.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Pesticide-free farming methods
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Environmentally sustainable practices
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Supporting local farming communities
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Temperature-controlled storage and delivery
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <div className="text-3xl font-bold text-green-500 mb-2">
                  99%
                </div>
                <div className="text-gray-600 text-sm">
                  Customer Satisfaction
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <div className="text-3xl font-bold text-green-500 mb-2">
                  24h
                </div>
                <div className="text-gray-600 text-sm">Farm to Door</div>
              </div>
              <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <div className="text-3xl font-bold text-green-500 mb-2">0%</div>
                <div className="text-gray-600 text-sm">Harmful Chemicals</div>
              </div>
              <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <div className="text-3xl font-bold text-green-500 mb-2">5★</div>
                <div className="text-gray-600 text-sm">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
