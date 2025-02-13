const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    requirements: {
      type: String,
      required: true,
    },
    salaryRange: {
      min: {
        type: Number,
        required: [true, 'Minimum salary is required'],
        min: 0, // Ensure the minimum salary is not negative
      },
      max: {
        type: Number,
        required: [true, 'Maximum salary is required'],
        validate: {
          validator: function (value) {
            // Ensure max is greater than or equal to min
            return value >= this.min;
          },
          message: 'Max salary must be greater than or equal to min salary.',
        },
      },
      currency: {
        type: String,
        required: true,
        default: 'INR', // Default currency
        enum: ['INR', 'USD'], // Supported currencies
      },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt
);

module.exports = mongoose.model('Job', jobSchema);