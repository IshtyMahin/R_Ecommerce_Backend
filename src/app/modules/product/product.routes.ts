import { Router } from 'express';
import auth from '../../middleware/auth';
import { UserRole } from '../user/user.interface';
import { multerUpload } from '../../config/multer.config';
import { parseBody } from '../../middleware/bodyParser';
import { ProductController } from './product.controller';
import validateRequest from '../../middleware/validateRequest';
import { productValidation } from './product.validation';

const router = Router();

// Public routes
router.get('/', ProductController.getAllProduct);
router.get('/trending', ProductController.getTrendingProducts);
router.get('/:productId', ProductController.getSingleProduct);

// Admin-only routes
router.post(
   '/',
   auth(UserRole.ADMIN),
   multerUpload.fields([{ name: 'images' }]),
   parseBody,
   validateRequest(productValidation.createProductValidationSchema),
   ProductController.createProduct
);

router.patch(
   '/:productId',
   auth(UserRole.ADMIN),
   multerUpload.fields([{ name: 'images' }]),
   parseBody,
   validateRequest(productValidation.updateProductValidationSchema),
   ProductController.updateProduct
);

router.delete(
   '/:productId',
   auth(UserRole.ADMIN),
   ProductController.deleteProduct
);

export const ProductRoutes = router;