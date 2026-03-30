const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// =========================
// REGISTER
// =========================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await user.save();

    return res.json({ message: 'User registered successfully' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});


// =========================
// LOGIN
// =========================
router.post('/login', async (req, res) => {
  try {
    console.log("🔥 LOGIN HIT");
    console.log("🔥 LOGIN SECRET:", process.env.JWT_SECRET);

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 🔥 IMPORTANT DEBUG LOGS
    console.log("🔥 GENERATED TOKEN:", token);

    return res.json({ token });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;