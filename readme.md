# FruitMix - Online Fruit Ordering Platform

A modern full-stack application for online fruit ordering with WhatsApp integration and subscription management.

## 🚀 Project Structure

```
FruitMix/
├── frontend/          # React + TypeScript frontend application
├── backend/           # Node.js + Express + TypeScript backend API
└── README.md         # This file
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **bcrypt** for password hashing

## 🌟 Key Features

- 🛒 **Product Catalog** - Browse and filter fruits with detailed information
- 👤 **User Authentication** - Secure registration and login system
- 🛍️ **Shopping Cart** - Add, remove, and manage items
- 📱 **WhatsApp Integration** - Send orders directly via WhatsApp
- 💳 **Subscription System** - Monthly fruit subscription plans
- 🏪 **Store Management** - Dynamic store information and contact details
- 📱 **Responsive Design** - Mobile-first approach with modern UI

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FruitMix
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📱 WhatsApp Integration

The application integrates with WhatsApp Business API to:
- Send order details directly to store WhatsApp
- Use dynamic store contact information
- Format orders in a readable WhatsApp message format

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fruitmix
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_WHATSAPP_BUSINESS_PHONE=+1234567890
```

## 📦 Available Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@fruitmix.com or create an issue in the repository.
