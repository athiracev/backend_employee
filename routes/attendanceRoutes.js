const express = require('express');
const router = express.Router();
const {
  punchIn,
  punchOut
} = require('../controllers/attendanceController');
const auth = require('../middleware/auth');

router.post('/punchin', auth, punchIn);
router.post('/punchout', auth, punchOut);

module.exports = router;
