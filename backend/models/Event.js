const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.status === 'accepted' || this.status === 'completed';
    }
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending'
  },
  foodDetails: {
    type: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    description: String,
    expiryDate: Date,
    storageInstructions: String,
    allergens: [String]
  },
  pickupAddress: {
    type: String,
    required: true
  },
  pickupTime: {
    from: Date,
    to: Date
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String
  },
  photos: [String],
  notes: String
}, {
  timestamps: true
});

// Index for analytics queries
eventSchema.index({ date: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ "foodDetails.type": 1 });
eventSchema.index({ pickupAddress: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
