import { Router } from 'express';
import { FlashSaleController } from './flashSale.controller';
import auth from '../../middleware/auth';
import { UserRole } from '../user/user.interface';
import validateRequest from '../../middleware/validateRequest';
import { FlashSaleValidation } from './flashSale.validation';

const router = Router();

// Public route to get active flash sales
router.get('/', FlashSaleController.getActiveFlashSales);


router.post(
  '/',
  auth(UserRole.ADMIN),
  validateRequest(FlashSaleValidation.createFlashSaleSchema),
  FlashSaleController.createFlashSale
);

export const FlashSaleRoutes = router;