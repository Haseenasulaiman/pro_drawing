const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/drawingsDB";
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
const DrawingSchema = new mongoose.Schema({
  image: { type: String, required: true },
  title: { type: String, default: "Untitled" },
  tags: { type: [String], default: [] },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
}, { timestamps: true });
const Drawing = mongoose.model("Drawing", DrawingSchema);
const User = mongoose.model("User", UserSchema);
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
  
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email or username" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/auth/verify", authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user.userId,
      username: req.user.username,
      email: req.user.email
    }
  });
});
app.post("/api/save", authenticateToken, async (req, res) => {
  try {
    const { image, title, tags } = req.body;
    if (!image) return res.status(400).json({ error: "Image is required" });
    const created = await Drawing.create({ 
      image, 
      title, 
      tags, 
      userId: req.user.userId 
    });
    res.json(created);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get("/api/drawings", authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const search = req.query.search || "";

    const query = { 
      userId: req.user.userId,
      ...(search ? { title: { $regex: search, $options: "i" } } : {})
    };
    const total = await Drawing.countDocuments(query);
    const drawings = await Drawing.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ drawings, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete("/api/drawings/:id", authenticateToken, async (req, res) => {
  try {
    const drawing = await Drawing.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    if (!drawing) {
      return res.status(404).json({ error: "Drawing not found" });
    }
    await Drawing.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.listen(5000, () => console.log("Server running on port 5000"));