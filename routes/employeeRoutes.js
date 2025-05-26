const express = require('express');
const router = express.Router();
const {
  createEmployee,
  loginEmployee,
  getAllEmployees,
  getSingleEmployee,
  getEmployeeCount,
  updateEmployee,
} = require('../controllers/employeeController');
const auth = require('../middleware/auth');

router.post('/register', createEmployee);
router.post('/login', loginEmployee);
router.put('/update/:id', updateEmployee);
router.get('/count',auth,getEmployeeCount);
router.get('/', auth, getAllEmployees);
router.get('/:id', auth, getSingleEmployee);


module.exports = router;
