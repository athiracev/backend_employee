const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const moment = require('moment');

exports.createLeaveApply = async (req, res) => {
  try {
    const { type_of_leave, reason, from_date, to_date,employeeId } = req.body;
    // const employeeId = req.user.id;

    const leave = new Leave({
      employee: employeeId,
      type_of_leave,
      reason,
      from_date,
      to_date,
    });

    await leave.save();
    res.status(201).json({ message: 'Leave applied successfully', leave });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// update leave
exports.updateLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { type_of_leave, reason, from_date, to_date, status } = req.body;

    // Find the existing leave
    const existingLeave = await Leave.findById(id);
    if (!existingLeave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    // Update only the fields provided in the request
    existingLeave.type_of_leave = type_of_leave || existingLeave.type_of_leave;
    existingLeave.reason = reason || existingLeave.reason;
    existingLeave.from_date = from_date || existingLeave.from_date;
    existingLeave.to_date = to_date || existingLeave.to_date;
    existingLeave.status = status || existingLeave.status;

    const updatedLeave = await existingLeave.save();

    res.status(200).json({ message: 'Leave updated successfully', leave: updatedLeave });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllLeaves = async (req, res) => {
  const leaves = await Leave.find().populate('employee', '-password');
  res.json(leaves);
};

exports.getSingleLeave = async (req, res) => {
  const leave = await Leave.findById(req.params.id).populate('employee', '-password');
  if (!leave) return res.status(404).json({ message: 'Leave not found' });
  res.json(leave);
};

exports.updateLeaveStatus = async (req, res) => {
  const { status } = req.body;
  const leave = await Leave.findById(req.params.id);
  if (!leave) return res.status(404).json({ message: 'Leave not found' });

  if (status === 'approved') {
    const from = moment(leave.from_date);
    const to = moment(leave.to_date);
    const days = to.diff(from, 'days') + 1;

    const employee = await Employee.findById(leave.employee);

    if (employee.leave_balance < days) {
      return res.status(400).json({ message: `Insufficient leave balance (${employee.leave_balance})` });
    }

    employee.leave_balance -= days;
    await employee.save();
  }

  leave.status = status;
  await leave.save();
  res.json({ message: `Leave ${status}`, leave });
};

exports.getLeaveCount = async (req, res) => {
  const employeeId = req.user.id;

  const employee = await Employee.findById(employeeId).select('-password');
  const pending = await Leave.find({ employee: employeeId, status: 'pending' });
  const approved = await Leave.find({ employee: employeeId, status: 'approved' });
  const rejected = await Leave.find({ employee: employeeId, status: 'rejected' });

  res.json({
    leave_balance: employee.leave_balance,
    pending: { count: pending.length, data: pending },
    approved: { count: approved.length, data: approved },
    rejected: { count: rejected.length, data: rejected },
  });
};
