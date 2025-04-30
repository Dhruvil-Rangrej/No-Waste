const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Event = require('../models/Event');

// Get dashboard analytics
router.get('/dashboard', protect, async (req, res) => {
  try {
    // Calculate total donations
    const totalDonations = await Event.countDocuments();

    // Calculate total food saved (assuming quantity is in kg)
    const totalFoodSaved = await Event.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$foodDetails.quantity" }
        }
      }
    ]);

    // Estimate people fed (assuming 0.5kg per meal)
    const totalPeopleFed = Math.floor((totalFoodSaved[0]?.total || 0) / 0.5);

    // Calculate monthly donations
    const monthlyDonations = await Event.aggregate([
      {
        $group: {
          _id: { 
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          donations: { $sum: 1 },
          quantity: { $sum: "$foodDetails.quantity" }
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              { $toString: "$_id.month" }
            ]
          },
          donations: 1,
          quantity: 1
        }
      },
      { $sort: { month: 1 } },
      { $limit: 12 }
    ]);

    // Calculate food type distribution
    const foodTypeDistribution = await Event.aggregate([
      {
        $group: {
          _id: "$foodDetails.type",
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: 1
        }
      }
    ]);

    // Calculate impact score (example formula)
    const impactScore = Math.floor(
      (totalDonations * 10) + 
      (totalFoodSaved[0]?.total || 0) + 
      (totalPeopleFed * 0.5)
    );

    res.json({
      stats: {
        totalDonations,
        totalFoodSaved: totalFoodSaved[0]?.total || 0,
        totalPeopleFed,
        impactScore
      },
      monthlyDonations,
      foodTypeDistribution
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 