import { WHATSAPP_CONFIG, formatPhoneForWhatsApp } from "../config/whatsapp";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  hasSubscription?: boolean;
  customization?: {
    baseProduct: string;
    selectedFruits: Array<{
      fruitId: string;
      fruitName: string;
      quantity: number;
    }>;
  };
}

export interface User {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface Store {
  _id: string;
  name: string;
  location: string;
  contact: string;
  email: string;
  instagram?: string;
  description?: string;
  isActive: boolean;
}

// Helper functions to reduce code duplication
const generateCustomerDetails = (user: User | null): string => {
  let section = `👤 *Customer Details:*\n`;
  const customerName =
    user?.name ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    "Customer";
  section += `Name: ${customerName}\n`;
  section += `Email: ${user?.email || "Not provided"}\n`;
  section += `Phone: ${user?.phone || "Not provided"}\n\n`;
  return section;
};

const generateItemsList = (
  items: OrderItem[],
  isSubscription: boolean = false
): string => {
  const sectionTitle = isSubscription
    ? `📦 *Subscription Items:*\n`
    : `📦 *Order Items:*\n`;
  let section = sectionTitle;

  items.forEach((item, index) => {
    section += `${index + 1}. ${item.name}`;

    if (isSubscription && item.hasSubscription) {
      section += ` 🔄 *(Subscription Product)*`;
    }

    section += `\n`;
    section += `   Quantity: ${item.quantity}\n`;

    const priceLabel = isSubscription
      ? `   Price: ₹${item.price} (total subscription)\n`
      : `   Price: ₹${item.price}\n`;
    section += priceLabel;

    // Add customization details for customized bowls
    if (item.customization && item.customization.selectedFruits.length > 0) {
      section += `   🥗 *Customized with:*\n`;
      item.customization.selectedFruits.forEach((fruit) => {
        section += `      • ${fruit.fruitName} (${fruit.quantity})\n`;
      });
    }

    section += `   Subtotal: ₹${(item.price * item.quantity).toFixed(2)}\n\n`;
  });

  return section;
};

const generateOrderSummary = (
  total: number,
  isSubscription: boolean = false
): string => {
  const summaryTitle = isSubscription
    ? `💰 *Subscription Summary:*\n`
    : `💰 *Order Summary:*\n`;
  let section = summaryTitle;

  if (isSubscription) {
    section += `Total Subscription Amount: ₹${total.toFixed(2)}\n`;
    section += `Shipping: ₹0.00\n`;
    section += `*Total Amount: ₹${total.toFixed(2)}*\n\n`;
  } else {
    section += `Subtotal: ₹${total.toFixed(2)}\n`;
    section += `Shipping: ₹0.00\n`;
    section += `*Total: ₹${total.toFixed(2)}*\n\n`;
  }

  return section;
};

const generatePaymentInfo = (isSubscription: boolean = false): string => {
  let section = `💳 *Payment Options:*\n`;
  section += `We accept the following payment methods:\n`;
  section += `• 💰 Cash on Delivery (COD)\n`;
  section += `• 💻 Online Payment (UPI)\n\n`;
  
  if (isSubscription) {
    section += `*For subscriptions:* We recommend online payment for convenience\n\n`;
  } else {
    section += `*Please let us know your preferred payment method*\n\n`;
  }
  
  return section;
};

const generateDeliveryAddress = (user: User | null): string => {
  let section = `📍 *Delivery Address:*\n`;

  if (user?.address || user?.city || user?.state || user?.zipCode) {
    section += `${user.address || "Not provided"}\n`;
    section += `${user.city || "Not provided"}, ${
      user.state || "Not provided"
    } ${user.zipCode || ""}\n\n`;
  } else {
    section += `Please provide your complete delivery address\n\n`;
  }

  return section;
};

const generateSubscriptionDetails = (): string => {
  let section = `🔄 *Subscription Details:*\n`;
  section += `📅 *Delivery Frequency:* We will confirm the delivery schedule with you\n`;
  section += `📦 *Delivery Pattern:* Regular deliveries as per your preference\n`;
  section += `⏰ *Start Date:* We will contact you to confirm the start date\n`;
  section += `🔔 *Notifications:* You'll receive delivery reminders via WhatsApp\n\n`;
  return section;
};

const generateSubscriptionNextSteps = (): string => {
  let section = `📞 *Next Steps:*\n`;
  section += `We will contact you shortly to:\n`;
  section += `• Confirm your subscription preferences\n`;
  section += `• Set up your delivery schedule\n`;
  section += `• Answer any questions you may have\n\n`;
  return section;
};

export const generateWhatsAppOrderMessage = (
  items: OrderItem[],
  user: User | null,
  total: number,
  _shipping: number = 0.0
): string => {
  // Check if any items have subscription capability
  const hasSubscriptionItems = items.some((item) => item.hasSubscription);

  if (hasSubscriptionItems) {
    return generateWhatsAppSubscriptionMessage(items, user, total, _shipping);
  } else {
    return generateWhatsAppRegularOrderMessage(items, user, total, _shipping);
  }
};

export const generateWhatsAppRegularOrderMessage = (
  items: OrderItem[],
  user: User | null,
  total: number,
  _shipping: number = 0.0
): string => {
  let message = `🛒 *New Order from ${WHATSAPP_CONFIG.businessName}*\n\n`;

  // Build message using helper functions
  message += generateCustomerDetails(user);
  message += generateItemsList(items, false);
  message += generateOrderSummary(total, false);
  message += generatePaymentInfo(false);
  message += generateDeliveryAddress(user);

  message += `⏰ *Preferred Delivery Time:*\n`;
  message += `Please let us know your preferred delivery time\n\n`;

  message += `📱 *Ordered via ${WHATSAPP_CONFIG.businessName} Website*`;

  return message;
};

export const generateWhatsAppSubscriptionMessage = (
  items: OrderItem[],
  user: User | null,
  total: number,
  _shipping: number = 0.0
): string => {
  let message = `🔔 *New Subscription Order from ${WHATSAPP_CONFIG.businessName}*\n\n`;

  // Build message using helper functions
  message += generateCustomerDetails(user);
  message += generateItemsList(items, true);
  message += generateOrderSummary(total, true);
  message += generatePaymentInfo(true);
  message += generateSubscriptionDetails();
  message += generateDeliveryAddress(user);
  message += generateSubscriptionNextSteps();

  message += `📱 *Subscription Order via ${WHATSAPP_CONFIG.businessName} Website*`;

  return message;
};

export const openWhatsAppWithMessage = (message: string, store?: Store | null): void => {
  // Use store contact number if available, otherwise fall back to config
  let businessPhone = store?.contact || WHATSAPP_CONFIG.businessPhone;
  
  // Format the phone number for WhatsApp
  businessPhone = formatPhoneForWhatsApp(businessPhone);
  
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${businessPhone}?text=${encodedMessage}`;

  // Debug logging
  console.log("WhatsApp Debug Info:");
  console.log("Store contact (raw):", store?.contact);
  console.log("Business Phone (formatted):", businessPhone);
  console.log("Generated URL:", whatsappUrl);
  console.log("Message length:", message.length);

  // Try multiple methods to open WhatsApp
  try {
    // Method 1: window.open
    const newWindow = window.open(whatsappUrl, "_blank");

    if (!newWindow) {
      // Method 2: If popup blocked, try location.href
      console.log("Popup blocked, trying location.href...");
      window.location.href = whatsappUrl;
    } else {
      console.log("WhatsApp opened successfully via window.open");
    }
  } catch (error) {
    console.error("Error opening WhatsApp:", error);
    // Method 3: Fallback - create and click a link
    const link = document.createElement("a");
    link.href = whatsappUrl;
    link.target = "_blank";
    link.click();
  }
};

export const sendOrderViaWhatsApp = (
  items: OrderItem[],
  user: User | null,
  total: number,
  _shipping: number = 0.0, // Using underscore to indicate intentionally unused parameter
  store?: Store | null
): void => {
  const message = generateWhatsAppOrderMessage(items, user, total, _shipping);
  openWhatsAppWithMessage(message, store);
};
