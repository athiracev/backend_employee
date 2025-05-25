const Attendance = require('../models/Attendance');
const moment = require('moment');

// Punch In
exports.punchIn = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const today = moment().startOf('day').toDate();
    const tomorrow = moment(today).add(1, 'days').toDate();

    // Check if already punched in
    const existing = await Attendance.findOne({
      employee: employeeId,
      today_date: { $gte: today, $lt: tomorrow }
    });

    if (existing && existing.punch_in) {
      return res.status(400).json({ message: 'Already punched in today' });
    }

    const punchTime = new Date();

    if (existing) {
      existing.punch_in = punchTime;
      await existing.save();
      return res.status(200).json({ message: 'Punch-in recorded', attendance: existing });
    }

    const newAttendance = new Attendance({
      employee: employeeId,
      today_date: today,
      punch_in: punchTime,
      status: 'present',
    });

    await newAttendance.save();
    res.status(201).json({ message: 'Punch-in recorded', attendance: newAttendance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Punch Out
exports.punchOut = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const today = moment().startOf('day').toDate();
    const tomorrow = moment(today).add(1, 'days').toDate();

    const attendance = await Attendance.findOne({
      employee: employeeId,
      today_date: { $gte: today, $lt: tomorrow }
    });

    if (!attendance || !attendance.punch_in) {
      return res.status(400).json({ message: 'Punch in first' });
    }

    if (attendance.punch_out) {
      return res.status(400).json({ message: 'Already punched out today' });
    }

    const now = moment();
    const punchInTime = moment(attendance.punch_in);
    const diffHours = now.diff(punchInTime, 'hours', true); // fractional hours

    if (diffHours < 8) {
      return res.status(400).json({ message: `At least 8 hours required to punch out. Only ${diffHours.toFixed(2)} hours recorded.` });
    }

    attendance.punch_out = now.toDate();
    await attendance.save();

    res.status(200).json({ message: 'Punch-out recorded', attendance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// (Optional) Auto punch-out — could be triggered by cron job if desired
