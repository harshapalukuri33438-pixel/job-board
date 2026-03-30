const express = require('express');
const router = express.Router();

const Job = require('../models/Job');
const Application = require('../models/Application');

const auth = require('../middleware/authMiddleware');
const role = require('../middleware/role');


// =========================
// CREATE JOB (Recruiter only)
// =========================
router.post('/create', auth, role('recruiter'), async (req, res) => {
  try {
    const { title, company, location, description } = req.body;

    const job = new Job({
      title,
      company,
      location,
      description,
      postedBy: req.user.id
    });

    await job.save();

    res.json({ message: 'Job created successfully', job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =========================
// GET ALL JOBS
// =========================
router.get('/', async (req, res) => {
  try {
    const { search, location, page = 1, limit = 5 } = req.query;

    const query = {};

    // Search by title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =========================
// APPLY TO JOB (Jobseeker only)
// =========================
router.post('/apply/:jobId', auth, role('jobseeker'), async (req, res) => {
  try {
    // Prevent duplicate application
    const existing = await Application.findOne({
      user: req.user.id,
      job: req.params.jobId
    });

    if (existing) {
      return res.status(400).json({ message: 'Already applied' });
    }

    const application = new Application({
      user: req.user.id,
      job: req.params.jobId
    });

    await application.save();

    res.json({ message: 'Applied successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =========================
// GET APPLIED JOBS (User)
// =========================
router.get('/applied', auth, async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.id })
      .populate({
        path: 'job',
        populate: {
          path: 'postedBy',
          select: 'name email'
        }
      });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =========================
// GET APPLICANTS (Recruiter)
// =========================
router.get('/applicants/:jobId', auth, role('recruiter'), async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.jobId })
      .populate('user', 'name email');

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;