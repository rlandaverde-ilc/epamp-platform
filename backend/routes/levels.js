const express = require('express');
const router = express.Router();
const {
  getLevels,
  getLevel,
  createLevel,
  updateLevel,
  deleteLevel
} = require('../controllers/levelController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getLevels)
  .post(authorize('admin'), createLevel);

router.route('/:id')
  .get(getLevel)
  .put(authorize('admin'), updateLevel)
  .delete(authorize('admin'), deleteLevel);

module.exports = router;
