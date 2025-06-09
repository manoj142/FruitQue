import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Subscription, { ISubscription } from '../models/Subscription';
import Product from '../models/Product';
import User from '../models/User';
import { AuthenticatedRequest } from '../types';

// Create a new subscription (Admin only)
export const createSubscription = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const {
      name,
      type,
      items,
      customerDetails,
      paymentMethod,
      deliveryInstructions,
      startDate
    } = req.body;

    // Validate customer details
    if (!customerDetails || !customerDetails.firstName || !customerDetails.lastName || !customerDetails.email || !customerDetails.phone) {
      return res.status(400).json({ message: 'Customer details are required (firstName, lastName, email, phone)' });
    }

    // Validate products and calculate total
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      // Check if product ID is valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({ message: `Invalid product ID format: ${item.product}` });
      }
      
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      
      validatedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }    // Calculate next delivery date and end date
    const start = startDate ? new Date(startDate) : new Date();
    let nextDeliveryDate = new Date(start);
    
    // For daily deliveries, start the next day
    nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 1);
    
    // Calculate subscription end date based on type
    const endDate = new Date(start);
    switch (type) {
      case 'weekly':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'biweekly':
        endDate.setDate(endDate.getDate() + 14);
        break;
      case 'monthly':
        endDate.setDate(endDate.getDate() + 30);
        break;
    }    // Create subscription with customerDetails instead of user reference
    const subscriptionData: any = {
      customerDetails,
      name,
      type,
      items: validatedItems,
      totalAmount,
      startDate: start,
      endDate,
      nextDeliveryDate,
      paymentMethod: paymentMethod || 'cod',
      deliveryInstructions
    };

    // Only add createdBy if req.user exists and has a valid _id
    if (req.user && req.user._id) {
      subscriptionData.createdBy = req.user._id;
    }

    const subscription = new Subscription(subscriptionData);

    await subscription.save();
    
    // Populate product details only (no user details needed)
    await subscription.populate([
      { path: 'items.product', select: 'name price image category' }
    ]);

    return res.status(201).json({
      message: 'Subscription created successfully',
      subscription
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return res.status(500).json({ message: 'Server error creating subscription' });
  }
};

// Get all subscriptions (Admin only)
export const getAllSubscriptions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, type, page = 1, limit = 10, search } = req.query;
    
    const query: any = {};
    
    if (status) query.status = status;
    if (type) query.type = type;
    
    // Search by customer name, email, or subscription name
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'customerDetails.firstName': { $regex: search, $options: 'i' } },
        { 'customerDetails.lastName': { $regex: search, $options: 'i' } },
        { 'customerDetails.email': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const subscriptions = await Subscription.find(query)
      .populate('items.product', 'name price image category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Subscription.countDocuments(query);

    res.json({
      subscriptions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ message: 'Server error fetching subscriptions' });
  }
};

// Get user's subscriptions
export const getUserSubscriptions = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userEmail = req.user?.email;
    
    if (!userEmail) {
      return res.status(400).json({ 
        success: false,
        message: 'User email not found' 
      });
    }
    
    // Find subscriptions by customer email (case-insensitive)
    const subscriptions = await Subscription.find({ 
      'customerDetails.email': { $regex: new RegExp(`^${userEmail}$`, 'i') } 
    })
      .populate('items.product', 'name price images category productType')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'User subscriptions fetched successfully',
      data: {
        subscriptions,
        count: subscriptions.length
      }
    });
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error fetching user subscriptions',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get subscription by ID
export const getSubscriptionById = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const userEmail = req.user?.email;
    const userRole = req.user?.role;
    
    const subscription = await Subscription.findById(id)
      .populate('items.product', 'name price image category');

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check if user can access this subscription
    if (userRole !== 'admin' && subscription.customerDetails.email !== userEmail) {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.json({ subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return res.status(500).json({ message: 'Server error fetching subscription' });
  }
};

// Update subscription
export const updateSubscription = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userEmail = req.user?.email;
    const userRole = req.user?.role;

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check if user can update this subscription
    if (userRole !== 'admin' && subscription.customerDetails.email !== userEmail) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If updating items, recalculate total
    if (updates.items) {
      let totalAmount = 0;
      const validatedItems = [];

      for (const item of updates.items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ message: `Product not found: ${item.product}` });
        }
        
        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;
        
        validatedItems.push({
          product: product._id,
          quantity: item.quantity,
          price: product.price
        });
      }

      updates.items = validatedItems;
      updates.totalAmount = totalAmount;
    }

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).populate([
      { path: 'items.product', select: 'name price image category' }
    ]);

    return res.json({
      message: 'Subscription updated successfully',
      subscription: updatedSubscription
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return res.status(500).json({ message: 'Server error updating subscription' });
  }
};

// Pause subscription
export const pauseSubscription = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const userEmail = req.user?.email;
    const userRole = req.user?.role;

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check if user can pause this subscription
    if (userRole !== 'admin' && subscription.customerDetails.email !== userEmail) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({ message: 'Only active subscriptions can be paused' });
    }

    subscription.status = 'paused';
    await subscription.save();

    return res.json({ message: 'Subscription paused successfully', subscription });
  } catch (error) {
    console.error('Error pausing subscription:', error);
    return res.status(500).json({ message: 'Server error pausing subscription' });
  }
};

// Resume subscription
export const resumeSubscription = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const userEmail = req.user?.email;
    const userRole = req.user?.role;

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check if user can resume this subscription
    if (userRole !== 'admin' && subscription.customerDetails.email !== userEmail) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (subscription.status !== 'paused') {
      return res.status(400).json({ message: 'Only paused subscriptions can be resumed' });
    }

    subscription.status = 'active';
    await subscription.save();

    return res.json({ message: 'Subscription resumed successfully', subscription });
  } catch (error) {
    console.error('Error resuming subscription:', error);
    return res.status(500).json({ message: 'Server error resuming subscription' });
  }
};

// Cancel subscription
export const cancelSubscription = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const userEmail = req.user?.email;
    const userRole = req.user?.role;

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check if user can cancel this subscription
    if (userRole !== 'admin' && subscription.customerDetails.email !== userEmail) {
      return res.status(403).json({ message: 'Access denied' });
    }

    subscription.status = 'cancelled';
    subscription.endDate = new Date();
    await subscription.save();

    return res.json({ message: 'Subscription cancelled successfully', subscription });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return res.status(500).json({ message: 'Server error cancelling subscription' });
  }
};

// Delete subscription (Admin only)
export const deleteSubscription = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findByIdAndDelete(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    return res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return res.status(500).json({ message: 'Server error deleting subscription' });
  }
};

// Get subscriptions due for delivery (Admin only)
export const getDueSubscriptions = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);    const dueSubscriptions = await Subscription.find({
      status: 'active',
      nextDeliveryDate: {
        $gte: today,
        $lt: tomorrow
      }
    })
    .populate('items.product', 'name price image category')
    .sort({ nextDeliveryDate: 1 });

    return res.json({ subscriptions: dueSubscriptions });
  } catch (error) {
    console.error('Error fetching due subscriptions:', error);
    return res.status(500).json({ message: 'Server error fetching due subscriptions' });
  }
};

// Get subscription statistics (Admin only)
export const getSubscriptionStats = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const stats = await Promise.all([
      Subscription.countDocuments({ status: 'active' }),
      Subscription.countDocuments({ status: 'paused' }),
      Subscription.countDocuments({ status: 'cancelled' }),
      Subscription.countDocuments({ status: 'expired' }),
      Subscription.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ]),
      Subscription.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ])
    ]);

    const [active, paused, cancelled, expired, revenueResult, typeStats] = stats;

    return res.json({
      statusStats: { active, paused, cancelled, expired },
      totalActiveRevenue: revenueResult[0]?.totalRevenue || 0,
      typeStats: typeStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    return res.status(500).json({ message: 'Server error fetching subscription stats' });
  }
};

// Process delivery completion and update next delivery date
export const completeDelivery = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    
    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({ message: 'Only active subscriptions can have deliveries completed' });
    }

    // Update last delivery date
    subscription.lastDeliveryDate = new Date();
    
    // Calculate next delivery date using the model method
    const nextDelivery = subscription.calculateNextDeliveryDate();
    
    if (nextDelivery) {
      subscription.nextDeliveryDate = nextDelivery;
    } else {
      // Subscription has ended
      subscription.status = 'expired';
      subscription.nextDeliveryDate = subscription.endDate;
    }

    await subscription.save();

    return res.json({
      message: 'Delivery completed successfully',
      subscription
    });
  } catch (error) {
    console.error('Error completing delivery:', error);
    return res.status(500).json({ message: 'Server error completing delivery' });
  }
};

// Check and update expired subscriptions (utility function)
export const checkExpiredSubscriptions = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find subscriptions that have passed their end date but are still active
    const expiredSubscriptions = await Subscription.find({
      status: { $in: ['active', 'paused'] },
      endDate: { $lt: today }
    });

    // Update them to expired status
    if (expiredSubscriptions.length > 0) {
      await Subscription.updateMany(
        {
          status: { $in: ['active', 'paused'] },
          endDate: { $lt: today }
        },
        { status: 'expired' }
      );
    }

    return res.json({
      message: `${expiredSubscriptions.length} subscriptions marked as expired`,
      count: expiredSubscriptions.length
    });
  } catch (error) {
    console.error('Error checking expired subscriptions:', error);
    return res.status(500).json({ message: 'Server error checking expired subscriptions' });
  }
};
