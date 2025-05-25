const express = require('express');
const router = express.Router();
const {
  createLeaveApply,
  getAllLeaves,
  getSingleLeave,
  updateLeaveStatus,
  getLeaveCount
} = require('../controllers/leaveController');
const auth = require('../middleware/auth');

router.post('/', auth, createLeaveApply);
router.get('/', auth, getAllLeaves);
router.get('/:id', auth, getSingleLeave);
router.put('/status/:id', auth, updateLeaveStatus);
router.get('/count/self', auth, getLeaveCount);

module.exports = router;
