import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register a new user
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '10d' }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30m' }),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist'); 
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

//Update Cart
export const updateCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = req.body.cart; // Send the full array from frontend
    await user.save();
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Add/Remove from Wishlist
export const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { productId } = req.body;

    const index = user.wishlist.indexOf(productId);
    if (index === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();
    
    // Return the updated, populated wishlist
    const updatedUser = await User.findById(req.user._id).populate('wishlist');
    res.json(updatedUser.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Place Order (Fixing Cart clearing)
export const placeOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const newOrder = {
      id: `ORD-${Date.now()}`,
      items: req.body.items,
      total: req.body.total,
      date: new Date(),
      status: "Order placed"
    };
    user.orders.push(newOrder);
    user.cart = []; // Empty cart after successful order
    user.markModified('orders');
    await user.save();
    res.status(201).json(user); // Return user to sync frontend state
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};