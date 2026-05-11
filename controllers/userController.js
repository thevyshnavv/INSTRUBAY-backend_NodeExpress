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
      role:user.role,
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
      if (user.isBlock) {
        return res.status(403).json({ message: 'Your account has been blocked. Please contact admin.' });
      }
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role:user.role,
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

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}); // Fetches all users for dashboard and list
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Get single user by ID (Admin only)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('wishlist');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// Toggle user block status
export const updateUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.isBlock = req.body.isBlock;
      await user.save();
      const updatedUser = await User.findById(req.params.id).populate('wishlist');
      res.json(updatedUser);
    }
  } catch (error) {
    res.status(404).json({ message: 'User not found' });
  }
};

// Get all orders (Admin only)
export const getAllOrders = async (req, res) => {
  try {
    const users = await User.find({}, 'name email orders');
    const allOrders = users.reduce((acc, user) => {
      const userOrders = user.orders.map(order => ({
        ...order,
        userName: user.name,
        userEmail: user.email,
        userId: user._id
      }));
      return acc.concat(userOrders);
    }, []);
    res.json(allOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
};