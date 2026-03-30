console.log("RUNNING NEW SERVER FILE");
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('API Running');
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
const authRoutes = require('./routes/authRoutes');

app.use('/api/auth', authRoutes);
const testRoutes = require('./routes/test');

app.use('/api/test', testRoutes);
const jobRoutes = require('./routes/jobRoutes');

app.use('/api/job', jobRoutes);