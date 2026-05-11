import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateCart, 
  placeOrder, 
  toggleWishlist, 
  getAllUsers, 
  updateUserStatus,
  getAllOrders,
  getUserById
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.post('/cart', protect, updateCart);
router.post('/order', protect, placeOrder);
router.post('/wishlist', protect, toggleWishlist);

// Admin routes
router.get('/', protect, adminOnly, getAllUsers);
router.get('/orders', protect, adminOnly, getAllOrders);
router.get('/:id', protect, adminOnly, getUserById);
router.patch('/:id', protect, adminOnly, updateUserStatus);

export default router;