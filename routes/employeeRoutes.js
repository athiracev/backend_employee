const express = require('express');
const router = express.Router();
const {
  createEmployee,
  loginEmployee,
  getAllEmployees,
  getSingleEmployee,
  getEmployeeCount,
} = require('../controllers/employeeController');
const auth = require('../middleware/auth');

router.post('/register', createEmployee);
router.post('/login', loginEmployee);
router.get('/', auth, getAllEmployees);
router.get('/:id', auth, getSingleEmployee);
router.get('/count',auth,getEmployeeCount);


module.exports = router;
