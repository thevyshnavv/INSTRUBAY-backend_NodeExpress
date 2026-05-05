import express from 'express';
import { registerUser, loginUser, getUserProfile, updateCart, placeOrder, toggleWishlist } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.post('/cart', protect, updateCart);
router.post('/order', protect, placeOrder);
router.post('/wishlist', protect, toggleWishlist);

export default router;