// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require("cors");

// Initialize Express app
const app = express();

// Middleware to parse JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static(path.join(__dirname, '../frontend')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});


// MongoDB URI
const mongoURI = 'mongodb+srv://Esom:queenscollege@fullstack.ww3sl.mongodb.net/?retryWrites=true&w=majority&appName=Fullstack';

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('MongoDB Connection Error: ', err));

// Define Mongoose Schemas and Models

// Menu Item Schema and Model
const menuItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String
});
const MenuItem = mongoose.model('MenuItem', menuItemSchema);

// Order Schema and Model
const orderSchema = new mongoose.Schema({
  customerName: String,
  address: String,
  paymentMethod: String,
  dishes: [
    {
      name: String,
      price: Number,
    },
  ],
  totalPrice: Number,
  orderDate: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// API route to get the menu from MongoDB
app.get('/api/menu', async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.json(menuItems);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching menu items', error: err });
  }
});

// API route to place an order
app.post('/api/orders', async (req, res) => {
  console.log("Order data received:", req.body); // Log incoming order data
  const { name, address, paymentMethod, dishes } = req.body; // dishes: [1,2,3]
  console.log(`dishes: ${dishes}`); // [1,2,3]


  // Validate input
  if (!name || !address || !paymentMethod || !dishes.length) {
    return res.status(400).json({ message: 'All fields (name, address, payment method, and dishes) are required' });
  }
  
  try {
    // Find dish details based on IDs provided
    
    
    const selectedDishes = await MenuItem.find({ 'id': { $in: [1,2,3] } });
    console.log(`selected dishes: ${selectedDishes}`); // [{dishObject}, {dishObject}, {dishObject}]
    console.log(`dishes: ${dishes}`); // [1,2,3]

  

    // Calculate total price
    const totalPrice = selectedDishes.reduce((total, item) => total + item.price, 0);

    // Map dish details to store full dish objects
    const dishDetails = selectedDishes.map(dish => ({
      name: dish.name,
      price: dish.price,
    }));

    // Create and save the order
    const order = new Order({
      customerName: name,
      address: address,
      paymentMethod: paymentMethod,
      dishes: dishDetails, // Save full dish objects [{name: "", price: 18}, {}, {}]
      totalPrice: totalPrice,
    });

    const savedOrder = await order.save();
    res.status(201).json({ message: 'Order placed successfully!', order: savedOrder });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ message: 'Error placing order', error: err });
  }
});

// API route to get all orders (admin or manager can use this)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('dishes');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err });
  }
});

// Error handling for invalid routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
