const Level = require('../models/Level');

// @desc    Get all levels
// @route   GET /api/levels
// @access  Private
exports.getLevels = async (req, res) => {
  try {
    const { category, active } = req.query;
    
    let query = {};
    if (category) {
      query.category = category;
    }
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const levels = await Level.find(query).sort({ category: 1, order: 1 });

    res.json({
      success: true,
      count: levels.length,
      levels
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single level
// @route   GET /api/levels/:id
// @access  Private
exports.getLevel = async (req, res) => {
  try {
    const level = await Level.findById(req.params.id);

    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found'
      });
    }

    res.json({
      success: true,
      level
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new level
// @route   POST /api/levels
// @access  Private/Admin
exports.createLevel = async (req, res) => {
  try {
    const { name, category, order, description } = req.body;

    const level = await Level.create({
      name,
      category,
      order,
      description
    });

    res.status(201).json({
      success: true,
      level
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update level
// @route   PUT /api/levels/:id
// @access  Private/Admin
exports.updateLevel = async (req, res) => {
  try {
    const { name, category, order, description, isActive } = req.body;

    const level = await Level.findByIdAndUpdate(
      req.params.id,
      { name, category, order, description, isActive },
      { new: true, runValidators: true }
    );

    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found'
      });
    }

    res.json({
      success: true,
      level
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete level
// @route   DELETE /api/levels/:id
// @access  Private/Admin
exports.deleteLevel = async (req, res) => {
  try {
    const level = await Level.findById(req.params.id);

    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found'
      });
    }

    await level.deleteOne();

    res.json({
      success: true,
      message: 'Level deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
