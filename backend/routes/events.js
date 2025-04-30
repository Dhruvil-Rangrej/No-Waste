const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Create a new event (only donor)
router.post('/', protect, async (req, res) => {
  const { date, location, foodDetails } = req.body;
  try {
    // Create event with proper location structure
    const event = new Event({
      donor: req.user._id,
      date,
      location: {
        address: location,
        coordinates: {
          type: 'Point',
          coordinates: [0, 0] // Default coordinates, should be updated with actual geocoding
        }
      },
      foodDetails,
      status: 'pending'
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get events created by the logged-in donor
router.get('/mine', protect, async (req, res) => {
  try {
    const events = await Event.find({ donor: req.user._id })
      .populate('ngo', 'profile.name email')
      .exec();

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get events accepted by the logged-in NGO
router.get('/accepted', protect, async (req, res) => {
  try {
    if (req.user.role !== 'ngo') {
      return res.status(403).json({ message: 'Access denied. Only NGOs can view accepted events.' });
    }

    const events = await Event.find({ 
      ngo: req.user._id,
      status: 'accepted'
    })
    .populate('donor', 'profile.name email')
    .exec();

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all available events for NGOs with optional filters
router.get('/', protect, async (req, res) => {
  try {
    let query = { status: 'pending' };

    if (req.query.location) {
      query['location.address'] = new RegExp(req.query.location, 'i');
    }
    if (req.query.type) {
      query['foodDetails.type'] = new RegExp(req.query.type, 'i');
    }

    const events = await Event.find(query)
      .populate('donor', 'profile.name email')
      .exec();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept an event (only NGO)
router.post('/:id/accept', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (req.user.role !== 'ngo') {
      return res.status(403).json({ message: 'Only NGOs can accept events' });
    }

    if (event.status !== 'pending') {
      return res.status(400).json({ message: 'Event is no longer available' });
    }

    event.status = 'accepted';
    event.ngo = req.user._id; // Assign the accepting NGO
    const updatedEvent = await event.save();
    
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an event (only donor who created it)
router.put('/:id', protect, async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const { date, location, foodDetails } = req.body;

    if (location) {
      event.location = {
        address: location,
        coordinates: {
          type: 'Point',
          coordinates: [0, 0] // Should be updated with actual geocoding
        }
      };
    }

    if (date) event.date = date;
    if (foodDetails) event.foodDetails = foodDetails;

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
