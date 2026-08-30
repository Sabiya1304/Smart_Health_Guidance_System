// ================================
// 🟢 IMPORT REQUIRED LIBRARIES
// ================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ================================
// 🟢 CREATE EXPRESS APP
// ================================
const app = express();

// ================================
// 🟢 MIDDLEWARE
// ================================
app.use(cors());              // Allow frontend requests
app.use(express.json());      // Parse JSON data

// ================================
// 🟢 CONNECT MONGODB
// ================================
mongoose.connect('mongodb://127.0.0.1:27017/healthDB_clean')
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log("DB Error:", err));

// ================================
// 🟢 IMPORT ROUTES
// ================================
const authRoutes = require('./routes/authRoutes');
const symptomRoutes = require('./routes/symptomRoutes');
const historyRoutes = require('./routes/historyRoutes');
const diseaseRoutes = require("./routes/diseaseRoutes");
const profileRoutes = require('./routes/profileRoutes');
const homeRoutes = require("./routes/homeRoutes");

// ================================
// 🟢 USE ROUTES (VERY IMPORTANT)
// ================================

// 🔐 Authentication (Register + Login)
app.use('/api/auth', authRoutes);

// 🧠 Symptom Analysis
app.use('/api/symptoms', symptomRoutes);

// 📜 History Management
app.use('/api/history', historyRoutes);

// 📜 Disease Management
app.use("/api/disease", diseaseRoutes);
// Profile
app.use('/api/profile', profileRoutes);

// Home
app.use('/api/home', homeRoutes);

// ================================
// 🟢 TEST ROUTE
// ================================
app.get('/', (req, res) => {
    res.send("Backend is running 🚀");
});

// ================================
// 🚀 START SERVER
// ================================
app.listen(5000, () => {
    console.log("Server running on port 5000 🚀");
});