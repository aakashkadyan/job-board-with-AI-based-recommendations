const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required']
    },
    description: {
      type: String,
      required: [true, 'Job description is required']
    },
    requirements: {
      type: String,
      required: true
    },
    salaryRange: {
      type: String,
      required: [true, 'Salary range is required']
    },
    location: {
      type: String,
      required: [true, 'Location is required']
    },
    postedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  });

module.exports = mongoose.model('Job', jobSchema);
