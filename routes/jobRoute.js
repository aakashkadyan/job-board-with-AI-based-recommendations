const express = require('express');
const Job = require('../models/Job');

const jobRoute = express.Router();

// POST /api/jobs - Create a new job
jobRoute.post('/', async (req, res) => {
  try {
    const { title, description, requirements, salaryRange, location, postedBy } = req.body;

    // Create a new job
    const job = new Job({
      title,
      description,
      requirements,
      salaryRange,
      location,
      postedBy,
    });

    await job.save();
    res.status(201).json({ message: "Jobs Posted successfully!"});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


jobRoute.get('/', async (req, res) => {
  try {
      const { title, location, salaryRange, postedBy } = req.query;

      let filter = {};

      if (title) filter.title = new RegExp(title, 'i'); // Case-insensitive search
      if (location) filter.location = new RegExp(location, 'i');
      if (salaryRange) filter.salaryRange = salaryRange;
      if (postedBy) filter.postedBy = postedBy;

      const jobs = await Job.find(filter);

      res.status(200).json({ message: "Jobs fetched successfully!", jobs });

  } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
  }
});

jobRoute.delete('/:id', async (req, res) => {
  try {
      const jobId = req.params.id;

      // Check if the job exists
      const job = await Job.findById(jobId);
      if (!job) {
          return res.status(404).json({ message: "Job not found" });
      }

      // Delete the job
      await Job.findByIdAndDelete(jobId);
      res.status(200).json({ message: "Job deleted successfully" });

  } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
  }
});

jobRoute.put('/:id', async (req, res) => {
  try {
      const jobId = req.params.id;
      const updateData = req.body;

      // Check if the job exists
      const job = await Job.findById(jobId);
      if (!job) {
          return res.status(404).json({ message: "Job not found" });
      }

      // Update the job
      const updatedJob = await Job.findByIdAndUpdate(jobId, updateData, { new: true, runValidators: true });

      res.status(200).json({ message: "Job updated successfully", job: updatedJob });

  } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = jobRoute;
