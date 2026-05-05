import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  isBlock: { type: Boolean, default: false },
  // Keeping it simple for now based on your JSON structure:
  cart: { type: Array, default: [] },
  orders: { type: Array, default: [] },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;