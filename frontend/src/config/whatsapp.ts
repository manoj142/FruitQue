export const WHATSAPP_CONFIG = {
  // Fallback business WhatsApp number (include country code without +)
  // This will be used if store contact is not available
  businessPhone: '917997107546',
  
  // Business details
  businessName: 'FruitQue',
  businessAddress: 'Your Business Address Here',
  
  // Default messages
  defaultMessage: 'Hi! I have a question about FruitQue delivery service.',
  
  // Business hours
  businessHours: {
    weekdays: '9:00 AM - 8:00 PM',
    weekends: '10:00 AM - 6:00 PM'
  },
  
  // Delivery areas (you can expand this)
  deliveryAreas: [
    'Downtown',
    'City Center', 
    'Suburbs',
    'Metro Area'
  ]
};

// Helper function to format phone number for WhatsApp
export const formatPhoneForWhatsApp = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');
  
  // If it starts with 0, replace with country code
  if (cleaned.startsWith('0')) {
    cleaned = '91' + cleaned.substring(1);
  }
  
  // If it doesn't start with country code, add it
  if (!cleaned.startsWith('91') && cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  
  return cleaned;
};
