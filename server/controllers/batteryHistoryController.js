const BatteryHistory = require('../models/BatteryHistory'); // Adjust the path as needed

// Controller to fetch battery history data
async function fetchBatteryHistory(req, res) {
  try {
    const { deviceId } = req.params; // Or from req.query / req.body depending on your API design
    const { startTime, endTime, limit } = req.query;

    const query = { deviceId };

    if (startTime || endTime) {
      query.timestamp = {};
      if (startTime) query.timestamp.$gte = new Date(startTime);
      if (endTime) query.timestamp.$lte = new Date(endTime);
    }

    const limitNumber = limit ? parseInt(limit, 10) : 1000;

    const data = await BatteryHistory.find(query)
      .sort({ timestamp: -1 })
      .limit(limitNumber);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching battery history', error });
  }
}

async function fetchFullHistory(req, res) {
  try {
    const {deviceId} = req.params;
    const data = await BatteryHistory.find({deviceId})
        .sort({timestamp: -1});
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({message: 'Error fetching full battery history', error});
  }
}

module.exports = {
  fetchBatteryHistory,
  fetchFullHistory,
};