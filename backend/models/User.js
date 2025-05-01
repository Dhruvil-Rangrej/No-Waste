const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['donor', 'ngo', 'admin'],
    required: true
  },
  profile: {
    name: {
      type: String,
      required: true
    },
    phone: String,
    organization: String,
    registrationNumber: String,
    description: String,
    website: String,
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String
    },
    avatar: String
  },
  preferences: {
    foodTypes: [String],
    maxDistance: Number,
    notificationSettings: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  stats: {
    totalDonations: {
      type: Number,
      default: 0
    },
    successfulPickups: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0
    },
    ratingCount: {
      type: Number,
      default: 0
    }
  },
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    documents: [{
      type: String,
      description: String,
      uploadDate: Date
    }]
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for common queries
userSchema.index({ role: 1 });
userSchema.index({ email: 1 });
userSchema.index({ "profile.name": 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update stats
userSchema.methods.updateRating = function(newRating) {
  const oldTotal = this.stats.rating * this.stats.ratingCount;
  this.stats.ratingCount += 1;
  this.stats.rating = (oldTotal + newRating) / this.stats.ratingCount;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
