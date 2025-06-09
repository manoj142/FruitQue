import React from "react";

const About: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About FruitQue
          </h1>
          <p className="text-2xl font-semibold text-green-600 mb-4 italic">
            "Fueling your day, the fresh way"
          </p>
          <p className="text-xl text-gray-600 leading-relaxed">
            Your trusted partner for fresh, healthy, and delicious fruit bowls
            delivered right to your doorstep
          </p>
        </div>
        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              FruitQue was born from a simple belief: everyone deserves access
              to fresh, nutritious fruit bowls without the hassle of
              preparation. We started as a small family business with a passion
              for healthy living and have grown into a trusted community of
              health-conscious food lovers.
            </p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Our journey began when we realized how difficult it can be to
              maintain a healthy diet in today's busy world. We decided to
              bridge that gap by crafting the freshest fruit bowls directly to
              your home, making healthy eating convenient and enjoyable.
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-yellow-50 p-8 rounded-lg">
            <div className="text-center">
              <div className="text-6xl mb-4">🥭</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Fresh & Natural
              </h3>
              <p className="text-gray-600">
                Fresh fruit bowls crafted daily with handpicked premium fruits
              </p>
            </div>
          </div>
        </div>
        {/* Features Section */}
        <div className="mb-12">
          
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Why Choose FruitQue?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Fast Delivery
              </h3>
              <p className="text-gray-600">
                Same-day delivery within the city. Fresh fruit bowls delivered
                to your doorstep.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Eco-Friendly Delivery
              </h3>
              <p className="text-gray-600">
                Sustainable packaging and carbon-neutral delivery options for
                environmentally conscious customers.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Best Prices
              </h3>
              <p className="text-gray-600">
                Competitive pricing with regular discounts and subscription
                savings.
              </p>
            </div>
          </div>
        </div>
        {/* Mission Section */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 rounded-lg mb-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-xl leading-relaxed max-w-3xl mx-auto">
              To make healthy eating accessible, convenient, and enjoyable for
              everyone by delivering the freshest fruit bowls and promoting a
              healthier lifestyle in our community.
            </p>
          </div>
        </div>
        {/* Values Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="text-2xl">✨</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Quality First
                </h3>
                <p className="text-gray-600">
                  We carefully select only the finest ingredients for our fruit
                  bowls, ensuring every delivery meets our high standards.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-2xl">🤝</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Customer Care
                </h3>
                <p className="text-gray-600">
                  Your satisfaction is our priority. We're here to help with any
                  questions or concerns.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-2xl">🌍</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Sustainability
                </h3>
                <p className="text-gray-600">
                  We use eco-friendly packaging to protect our planet and
                  promote sustainable practices.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-2xl">⚡</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Innovation
                </h3>
                <p className="text-gray-600">
                  Constantly improving our services and technology to serve you
                  better.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Contact CTA */}
        <div className="text-center bg-gray-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Have Questions?
          </h2>
          <p className="text-gray-600 mb-6">
            We'd love to hear from you! Get in touch with our friendly team.
          </p>
          <div className="flex justify-center space-x-4">
            
            <a
              href="mailto:info@fruitque.com"
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              Contact Us
            </a>
            <a
              href="/"
              className="border border-green-500 text-green-500 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors"
            >
              Shop Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
