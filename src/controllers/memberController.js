const Member = require('../models/Member');
const mongoose = require('mongoose');

// @desc    Get all members
// @route   GET /api/members
// @access  Private (Logged-in users)
const getMembers = async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      count: members.length,
      members
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while fetching members'
    });
  }
};

// @desc    Search members by name, email, phone, or membershipId
// @route   GET /api/members/search?query=...
// @access  Private
const searchMembers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return getMembers(req, res);
    }

    const regex = new RegExp(query, 'i');
    const members = await Member.find({
      $or: [
        { name: regex },
        { email: regex },
        { phone: regex },
        { membershipId: regex }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: members.length,
      members
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while searching members'
    });
  }
};

// @desc    Get single member by ID
// @route   GET /api/members/:id
// @access  Private
const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Member ID format'
      });
    }

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'Member not found'
      });
    }

    res.status(200).json({
      status: 'success',
      member
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while fetching member'
    });
  }
};

// @desc    Create new member
// @route   POST /api/members
// @access  Private (Admin only)
const createMember = async (req, res) => {
  try {
    const { name, email, phone, membershipId, address, status } = req.body;

    if (!name || !email || !phone || !membershipId) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide name, email, phone, and membership ID'
      });
    }

    const existingEmail = await Member.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'A member with this email already exists'
      });
    }

    const existingId = await Member.findOne({ membershipId });
    if (existingId) {
      return res.status(400).json({
        status: 'error',
        message: 'A member with this Membership ID already exists'
      });
    }

    const member = await Member.create({
      name,
      email,
      phone,
      membershipId,
      address: address || '',
      status: status && ['active', 'inactive'].includes(status) ? status : 'active'
    });

    res.status(201).json({
      status: 'success',
      message: 'Member registered successfully',
      member
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Duplicate key error: Email or Membership ID already registered'
      });
    }
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while creating member'
    });
  }
};

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private (Admin only)
const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Member ID format'
      });
    }

    const { name, email, phone, membershipId, address, status } = req.body;

    let member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'Member not found'
      });
    }

    if (email && email !== member.email) {
      const existingEmail = await Member.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          status: 'error',
          message: 'Another member already exists with this email'
        });
      }
    }

    if (membershipId && membershipId !== member.membershipId) {
      const existingId = await Member.findOne({ membershipId });
      if (existingId) {
        return res.status(400).json({
          status: 'error',
          message: 'Another member already exists with this Membership ID'
        });
      }
    }

    member.name = name || member.name;
    member.email = email || member.email;
    member.phone = phone || member.phone;
    member.membershipId = membershipId || member.membershipId;
    if (address !== undefined) member.address = address;
    if (status && ['active', 'inactive'].includes(status)) member.status = status;

    const updatedMember = await member.save();

    res.status(200).json({
      status: 'success',
      message: 'Member updated successfully',
      member: updatedMember
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while updating member'
    });
  }
};

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private (Admin only)
const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Member ID format'
      });
    }

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'Member not found'
      });
    }

    await Member.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'Member deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while deleting member'
    });
  }
};

module.exports = {
  getMembers,
  searchMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember
};
