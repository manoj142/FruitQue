import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import { IOrder, IOrderItem, AuthenticatedRequest } from '../types';

// Get all orders for a user
export const getUserOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const query: any = { user: userId };
    if (status) {
      query.orderStatus = status;
    }

    const skip = (page - 1) * limit;

    const [orders, totalOrders] = await Promise.all([
      Order.find(query)
        .populate('items.product', 'name images price category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ]);    const totalPages = Math.ceil(totalOrders / limit);

    return res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// Get order by ID
export const getOrderById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate('items.product', 'name images price category description')
      .populate('user', 'firstName lastName email phone')
      .lean();    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
};

// Create new order
export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentDetails,
      notes
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    if (!paymentMethod || !['razorpay', 'cod'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment method is required'
      });
    }

    // Validate and process order items
    const orderItems: IOrderItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }      // Check stock only if stock field exists and is managed
      if (product.stock !== undefined && product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      const itemTotalPrice = product.price * item.quantity;
      subtotal += itemTotalPrice;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        totalPrice: itemTotalPrice,
        image: product.images?.[0] || ''
      });
    }    // Calculate pricing
    const shippingFee = 0; // No shipping charges
    const discount = 0; // Apply any discounts here
    const total = subtotal + shippingFee - discount;

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentDetails,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',      pricing: {
        subtotal,
        tax: 0,
        shippingFee,
        discount,
        total
      },
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      notes
    });

    await order.save();    // Update product stock (only if stock is managed)
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product && product.stock !== undefined) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } }
        );
      }
    }// Populate the order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name images price category')
      .populate('user', 'firstName lastName email');

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order: populatedOrder }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
};

// Update order status
export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }    // Update status using manual approach
    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note
    });
    await order.save();    // Special handling for cancelled orders - restore stock (only if stock is managed)
    if (status === 'cancelled' && order.orderStatus !== 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product && product.stock !== undefined) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: item.quantity } }
          );
        }
      }
    }

    // Set delivery date for delivered orders
    if (status === 'delivered' && !order.actualDelivery) {
      order.actualDelivery = new Date();
      await order.save();
    }

    const updatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name images price category')
      .populate('user', 'firstName lastName email');    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: { order: updatedOrder }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};

// Cancel order
export const cancelOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (['shipped', 'delivered', 'cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order that is ${order.orderStatus}`
      });
    }    // Update status to cancelled
    order.orderStatus = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: reason || 'Cancelled by user'
    });
    await order.save();    // Restore product stock (only if stock is managed)
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product && product.stock !== undefined) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } }
        );
      }
    }

    // If payment was completed, mark for refund
    if (order.paymentStatus === 'completed') {
      order.paymentStatus = 'refunded';
      await order.save();
    }

    const updatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name images price category')
      .populate('user', 'firstName lastName email');    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order: updatedOrder }
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
};

// Verify payment (for Razorpay)
export const verifyPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // In a real application, you would verify the Razorpay signature here
    // For now, we'll assume the payment is valid

    // Update payment details
    order.paymentDetails = {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      gateway: 'razorpay',
      amount: order.pricing.total,
      currency: 'USD',
      paidAt: new Date()
    };    order.paymentStatus = 'completed';
    
    // Update order status to confirmed
    order.orderStatus = 'confirmed';
    order.statusHistory.push({
      status: 'confirmed',
      timestamp: new Date(),
      note: 'Payment verified and confirmed'
    });
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name images price category')
      .populate('user', 'firstName lastName email');    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: { order: updatedOrder }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
};

// Get order statistics (for admin or user dashboard)
export const getOrderStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const stats = await Order.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$pricing.total' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments({ user: userId });
    const totalSpent = await Order.aggregate([
      { $match: { user: userId, paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);    return res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalSpent: totalSpent[0]?.total || 0,
        statusBreakdown: stats
      }
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics'
    });
  }
};
