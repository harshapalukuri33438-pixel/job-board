const express = require('express');
const router = express.Router();

const Job = require('../models/Job');
const Application = require('../models/Application');

const auth = require('../middleware/authMiddleware');
const role = require('../middleware/role');
const upload = require('../middleware/upload'); // 🔥 IMPORTANT


// =========================
// CREATE JOB (Recruiter only)
// =========================
router.post('/create', auth, role('recruiter'), async (req, res) => {
  try {
    const { title, company, location, description } = req.body;

    if (!title || !company || !location || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const job = new Job({
      title,
      company,
      location,
      description,
      postedBy: req.user.id
    });

    await job.save();

    return res.json({ message: 'Job created successfully', job });

  } catch (err) {
    console.error("CREATE JOB ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});


// =========================
// GET ALL JOBS
// =========================
router.get('/', async (req, res) => {
  try {
    const { search, location, page = 1, limit = 5 } = req.query;

    const query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.json(jobs);

  } catch (err) {
    console.error("GET JOBS ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});


// =========================
// APPLY TO JOB (WITH RESUME)
// =========================
router.post(
  '/apply/:jobId',
  auth,
  role('jobseeker'),
  upload.single('resume'), // 🔥 FILE UPLOAD
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.jobId);

      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      // Prevent duplicate
      const existing = await Application.findOne({
        user: req.user.id,
        job: req.params.jobId
      });

      if (existing) {
        return res.status(400).json({ message: 'Already applied' });
      }

      const application = new Application({
        user: req.user.id,
        job: req.params.jobId,
        resume: req.file ? req.file.path : null // 🔥 SAVE FILE PATH
      });

      await application.save();

      return res.json({
        message: 'Applied with resume',
        application
      });

    } catch (err) {
      console.error("APPLY ERROR:", err);
      return res.status(500).json({ error: err.message });
    }
  }
);


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

    return res.json(applications);

  } catch (err) {
    console.error("GET APPLIED ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});


// =========================
// GET APPLICANTS (Recruiter)
// =========================
router.get('/applicants/:jobId', auth, role('recruiter'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('user', 'name email');

    return res.json(applications);

  } catch (err) {
    console.error("GET APPLICANTS ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});


// =========================
// UPDATE APPLICATION STATUS
// =========================
router.put('/status/:appId', auth, role('recruiter'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(req.params.appId)
      .populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    return res.json({ message: 'Status updated', application });

  } catch (err) {
    console.error("STATUS UPDATE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});


module.exports = router;