const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

router.get('/protected', auth, (req, res) => {
  res.json({
    message: 'You accessed protected route',
    user: req.user
  });
});

module.exports = router;