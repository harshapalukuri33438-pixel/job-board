console.log("🚀 RUNNING NEW SERVER FILE");

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();


// =========================
// MIDDLEWARE
// =========================
app.use(cors());
app.use(express.json());


// =========================
// STATIC FILES (UPLOADS)
// =========================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// =========================
// ROUTES
// =========================
const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/test');
const jobRoutes = require('./routes/jobRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/job', jobRoutes);


// =========================
// ROOT ROUTE
// =========================
app.get('/', (req, res) => {
  res.send('API Running');
});


// =========================
// DATABASE CONNECTION
// =========================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));


// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});