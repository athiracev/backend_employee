const Employee = require('../models/Employee')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Leave = require('../models/Leave')
const Attendance = require('../models/Attendance')
const moment = require('moment')

// register
exports.createEmployee = async (req, res) => {
  try {

    const { name, phone, email, password, designation, manager } = req.body

    const existing = await Employee.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already exists' })

    const hashPassword = await bcrypt.hash(password, 10)

    const newEmployee = new Employee({
      name, phone, email, password: hashPassword, designation, manager
    })

    await newEmployee.save()
    res.status(201).json({ message: 'Employee created successfully', newEmployee })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// login
exports.loginEmployee = async (req, res) => {
  try {

    const { email, password } = req.body

    const employee = await Employee.findOne({ email })
    if (!employee) return res.status(404).json({ message: 'Employee not found' })

    const isMatch = await bcrypt.compare(password, employee.password)
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' })

    // const token = jwt.sign(
    //   { id: employee._id, designation: employee.designation },
    //   process.env.JWT_SECRET,
    //   { expiresIn: '1d' }

    // )

    const token = jwt.sign(
      { id: employee._id, designation: employee.designation },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '1d' }
    );

    res.status(201).json({ token, employee })

  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })

  }
}

// update employee
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const existingEmployee = await Employee.findById(id);
    if (!existingEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Merge existing values with new input
    const {
      name = existingEmployee.name,
      phone = existingEmployee.phone,
      email = existingEmployee.email,
      password,
      leave_balance=existingEmployee.leave_balance,
      designation = existingEmployee.designation,
      manager = existingEmployee.manager,
    } = req.body;

    const updatedData = {
      name,
      phone,
      email,
      designation,
      manager,
      leave_balance
    };

    if (password) {
      const bcrypt = require('bcryptjs');
      updatedData.password = await bcrypt.hash(password, 10);
    } else {
      updatedData.password = existingEmployee.password;
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    }).select('-password'); // Don't send password in response

    res.status(200).json({
      message: 'Employee updated successfully',
      employee: updatedEmployee,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().select('-password');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get single employee
exports.getSingleEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// Get employee count with today's presence/absence
exports.getEmployeeCount = async (req, res) => {
  try {
    const today = moment().startOf('day').toDate();
    const tomorrow = moment(today).add(1, 'days').toDate();

    const employees = await Employee.find().select('-password');
    const employeeIds = employees.map(emp => emp._id);

    // Leaves taken today
    const todayLeaves = await Leave.find({
      from_date: { $lte: today },
      to_date: { $gte: today },
      employee: { $in: employeeIds },
    });

    const absentIds = todayLeaves.map(l => l.employee.toString());
    const presentEmployees = employees.filter(e => !absentIds.includes(e._id.toString()));
    const absentEmployees = employees.filter(e => absentIds.includes(e._id.toString()));

    const pendingLeaves = await Leave.find({ status: 'pending' });

    res.json({
      totalEmployees: employees.length,
      todayPresentCount: presentEmployees.length,
      todayPresentData: presentEmployees,
      todayAbsentCount: absentEmployees.length,
      todayAbsentData: absentEmployees,
      pendingLeavesCount: pendingLeaves.length,
      pendingLeaves: pendingLeaves,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

