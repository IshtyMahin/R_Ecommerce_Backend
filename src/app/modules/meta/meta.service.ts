import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/appError';
import { Order } from '../order/order.model';
import { IJwtPayload } from '../auth/auth.interface';
import User from '../user/user.model';
import { Product } from '../product/product.model';
import { Payment } from '../payment/payment.model';
import { Types } from 'mongoose';


const getMetaData = async (query: Record<string, unknown>, authUser: IJwtPayload) => {
   const { startDate, endDate } = query;
 
   if (authUser.role === 'admin') {
     const totalUsers = await User.countDocuments();
     const totalOrders = await Order.countDocuments();
     const totalProducts = await Product.countDocuments();
 
     const totalRevenue = await Order.aggregate([
       { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
     ]);
 
     const totalPayments = await Payment.countDocuments();
 
     const paymentStatusCounts = await Payment.aggregate([
       { $group: { _id: '$status', totalPayments: { $sum: 1 } } },
       { $project: { status: '$_id', totalPayments: 1, _id: 0 } },
     ]);
 
     const orderStatusCounts = await Order.aggregate([
       { $group: { _id: '$status', count: { $sum: 1 } } },
       { $project: { status: '$_id', count: 1, _id: 0 } },
     ]);
 
     const today = new Date();
     const startOfDay = new Date(today.setHours(0, 0, 0, 0));
     const endOfDay = new Date(today.setHours(23, 59, 59, 999));
 
     const todaysSales = await Order.aggregate([
       { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
       { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } },
     ]);
 
     const monthlySales = await Order.aggregate([
       {
         $group: {
           _id: { 
             month: { $month: '$createdAt' },
             year: { $year: '$createdAt' }
           },
           totalSales: { $sum: '$totalAmount' },
           orderCount: { $sum: 1 }
         }
       },
       { 
         $project: { 
           month: '$_id.month', 
           year: '$_id.year',
           totalSales: 1, 
           orderCount: 1, 
           _id: 0 
         } 
       },
       { $sort: { year: 1, month: 1 } }
     ]);
 
     // Get current year
     const currentYear = new Date().getFullYear();
     
     // Fill in missing months for the current year
     const completeMonthlySales = Array.from({ length: 12 }, (_, i) => {
       const month = i + 1;
       const monthData = monthlySales.find(sale => 
         sale.month === month && sale.year === currentYear
       );
       return {
         month,
         totalSales: monthData ? monthData.totalSales : 0,
         orderCount: monthData ? monthData.orderCount : 0,
       };
     });
 
     return {
       totalUsers,
       totalOrders,
       totalProducts,
       totalRevenue: totalRevenue[0]?.totalRevenue || 0,
       totalPayments,
       paymentStatusCounts,
       orderStatusCounts,
       todaysSales: todaysSales[0]?.totalSales || 0,
       monthlySales: completeMonthlySales,
     };
   }
 
   if (authUser.role === 'user') {
     const userOrders = await Order.aggregate([
       { $match: { user: new Types.ObjectId(authUser.userId) } },
       { 
         $group: { 
           _id: null,
           totalOrders: { $sum: 1 },
           totalSpent: { $sum: '$totalAmount' }
         } 
       }
     ]);
 
     const userOrderStatus = await Order.aggregate([
       { $match: { user: new Types.ObjectId(authUser.userId) } },
       { $group: { _id: '$status', count: { $sum: 1 } } },
       { $project: { status: '$_id', count: 1, _id: 0 } }
     ]);
 
     const userMonthlySpending = await Order.aggregate([
       { $match: { user: new Types.ObjectId(authUser.userId) } },
       {
         $group: {
           _id: { 
             month: { $month: '$createdAt' },
             year: { $year: '$createdAt' }
           },
           totalSpent: { $sum: '$totalAmount' },
           orderCount: { $sum: 1 }
         }
       },
       { 
         $project: { 
           month: '$_id.month', 
           year: '$_id.year',
           totalSpent: 1, 
           orderCount: 1, 
           _id: 0 
         } 
       },
       { $sort: { year: 1, month: 1 } }
     ]);
     
     // Get current year
     const currentYear = new Date().getFullYear();
     
     // Fill in missing months with zero values for the current year
     const completeMonthlySpending = Array.from({ length: 12 }, (_, i) => {
       const month = i + 1;
       const monthData = userMonthlySpending.find(spend => 
         spend.month === month && spend.year === currentYear
       );
       return {
         month,
         totalSpent: monthData ? monthData.totalSpent : 0,
         orderCount: monthData ? monthData.orderCount : 0,
       };
     });
 
     return {
       totalOrders: userOrders[0]?.totalOrders || 0,
       totalSpent: userOrders[0]?.totalSpent || 0,
       orderStatus: userOrderStatus,
       monthlySpending: completeMonthlySpending,
     };
   }
 
   throw new AppError(
     StatusCodes.FORBIDDEN,
     'You do not have permission to access this data'
   );
 };
 


const getOrdersByDate = async (
   startDate: string,
   endDate?: string,
   groupBy?: string
) => {
   const dateFilter: any = {};

   if (startDate && !endDate) {
      dateFilter['$match'] = {
         '_id.date': startDate
      };
   } else if (startDate && endDate) {
      dateFilter['$match'] = {
         '_id.date': {
            $gte: startDate,
            $lte: endDate
         }
      };
   }

   const pipeline: any[] = [
      {
         $group: {
            _id: {
               date: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
               },
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' }
         },
      }
   ];

   if (dateFilter['$match']) {
      pipeline.push(dateFilter);
   }

   if (groupBy === 'week') {
      pipeline[0].$group._id.week = { $week: '$createdAt' };
   } else if (groupBy === 'month') {
      pipeline[0].$group._id.month = { $month: '$createdAt' };
   }

   const orders = await Order.aggregate(pipeline);

   if (orders.length === 0) {
      throw new AppError(
         StatusCodes.NOT_FOUND,
         endDate 
            ? 'No orders found for the given date range'
            : 'No orders found for the given date'
      );
   }

   return orders;
};

export const MetaService = {
   getMetaData,
   getOrdersByDate,
};