import { Router } from 'express';
import { OrderController } from './order.controller';
import auth from '../../middleware/auth';
import { UserRole } from '../user/user.interface';
import validateRequest from '../../middleware/validateRequest';
import { orderValidation } from './order.validation';

const router = Router();

// User routes
router.post(
    '/',
    auth(UserRole.USER, UserRole.ADMIN),
    validateRequest(orderValidation.create),
    OrderController.createOrder
);

router.get(
  '/my-orders',
  auth(UserRole.USER),
  OrderController.getMyOrders
);

router.get(
  '/:orderId',
  auth(UserRole.USER),
  OrderController.getOrderDetails
);

// Admin routes
router.get(
  '/',
  auth(UserRole.ADMIN),
  OrderController.getAllOrders
);

router.patch(
  '/:orderId/status',
  auth(UserRole.ADMIN),
  validateRequest(orderValidation.updateStatus),
  OrderController.updateOrderStatus
);

router.get(
  '/check-purchase/:productId',
  auth(UserRole.USER),
  OrderController.checkIfPurchased
);


export const OrderRoutes = router;