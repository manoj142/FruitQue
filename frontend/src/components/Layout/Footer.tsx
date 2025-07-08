import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchStore } from "../../store/slices/storeSlice";
import Logo from "../UI/Logo";
import {
  MapPinIcon,
  EnvelopeIcon,
  HeartIcon,
  ShieldCheckIcon,
  TruckIcon
} from "@heroicons/react/24/outline";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

const Footer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { store } = useAppSelector((state) => state.store);

  useEffect(() => {
    dispatch(fetchStore());
  }, [dispatch]);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}{" "}
          <div>            <div className="flex items-center space-x-2 mb-4">
              <Logo size="md" showText={false} />
              <span className="text-xl font-bold">
                {store?.name || "FruitQue"}
              </span>
            </div>
            <p className="text-gray-300 mb-4">
              {store?.description ||
                "Fresh, quality fruits delivered right to your doorstep. Quality you can trust, flavors you'll love."}
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center text-green-400">
                <HeartIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">Eco-Friendly Delivery</span>
              </div>
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="text-gray-300">
              <p className="mb-2">Coming Soon:</p>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>• Product Categories</li>
                <li>• Seasonal Fruits</li>
                <li>• Custom Fruit Bowls</li>
                <li>• Subscription Plans</li>
              </ul>
            </div>
          </div>
          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <div className="text-gray-300">
              <p className="mb-2">Need Help?</p>
              <p className="text-sm text-gray-400 mb-3">
                Contact us through WhatsApp for quick support
              </p>
              <div className="text-sm text-gray-400">
                <p>• Quick Response</p>
                <p>• Order Tracking</p>
                <p>• Delivery Support</p>
              </div>
            </div>
          </div>
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
                <div className="text-gray-300">
                  <p>{store?.location || "123 Fresh Street"}</p>
                  <p>{store?.location ? "" : "Fruit Valley, FV 12345"}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaWhatsapp className="h-5 w-5 text-green-400 mr-3" />
                <div className="flex items-center space-x-3">
                  {store?.contact ? (
                    <a
                      href={`https://wa.me/${store.contact.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-green-400 transition-colors flex items-center space-x-2"
                      title="Contact us on WhatsApp"
                    >
                      <span>{store.contact}</span>
                    </a>
                  ) : (
                    <a
                      href="tel:+1234567890"
                      className="text-gray-300 hover:text-green-400 transition-colors"
                    >
                      +1 (234) 567-890
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-green-400 mr-3" />
                <a
                  href={`mailto:${store?.email || "hello@fruitbox.com"}`}
                  className="text-gray-300 hover:text-green-400 transition-colors"
                >
                  {store?.email || "hello@fruitbox.com"}
                </a>
              </div>
              {store?.instagram && (
                <div className="flex items-center">
                     <FaInstagram className="h-5 w-5 text-green-400 mr-3" />
                  <a
                    href={`https://instagram.com/${store.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-green-400 transition-colors"
                  >
                    @{store.instagram}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Features Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <TruckIcon className="h-8 w-8 text-green-400 mr-3" />
              <div>
                <h4 className="font-semibold">Morning Delivery</h4>
                <p className="text-gray-400 text-sm">
                  Fresh delivery 5.30AM - 11.30AM, always free! 😊
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-green-400 mr-3" />
              <div>
                <h4 className="font-semibold">Quality Guarantee</h4>
                <p className="text-gray-400 text-sm">
                  100% fresh or money back
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <HeartIcon className="h-8 w-8 text-green-400 mr-3" />
              <div>
                <h4 className="font-semibold">Eco-Friendly</h4>
                <p className="text-gray-400 text-sm">
                  Minimal plastic, maximum care
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 FruitQue. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Fueling Your Day, the Fresh Way
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
