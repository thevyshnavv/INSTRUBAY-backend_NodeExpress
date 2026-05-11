import express from 'express';
import { 
  getProducts, 
  getProductById, 
  addProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();
// user side
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin side 
router.post('/', protect, adminOnly, addProduct); 
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;