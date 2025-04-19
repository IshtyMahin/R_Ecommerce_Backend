import { Router } from 'express';
import auth from '../../middleware/auth';
import { UserRole } from '../user/user.interface';
import { couponController } from './coupon.controller';
import validateRequest from '../../middleware/validateRequest';
import { 
   createCouponValidationSchema,
   updateCouponValidationSchema,
   applyCouponValidationSchema 
} from './coupon.validation';

const router = Router();

// Admin-only routes
router.post(
   '/',
   auth(UserRole.ADMIN),
   validateRequest(createCouponValidationSchema),
   couponController.createCoupon
);

router.get(
   '/',
   auth(UserRole.ADMIN),
   couponController.getAllCoupons
);

router.patch(
   '/:couponCode',
   auth(UserRole.ADMIN),
   validateRequest(updateCouponValidationSchema),
   couponController.updateCoupon
);

router.delete(
   '/:couponId',
   auth(UserRole.ADMIN),
   couponController.deleteCoupon
);

// Public route for applying coupons
router.post(
   '/apply/:couponCode',
   validateRequest(applyCouponValidationSchema),
   couponController.applyCoupon
);

export const CouponRoutes = router;