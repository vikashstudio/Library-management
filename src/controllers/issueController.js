const Issue = require('../models/Issue');
const Book = require('../models/Book');
const Member = require('../models/Member');
const mongoose = require('mongoose');

// @desc    Get all issue records with optional status filter
// @route   GET /api/issues?status=issued|returned
// @access  Private (Logged-in users)
const getIssues = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && ['issued', 'returned'].includes(status)) {
      filter.status = status;
    }

    const issues = await Issue.find(filter)
      .populate('book', 'title author isbn category')
      .populate('member', 'name email phone membershipId')
      .populate('issuedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: issues.length,
      issues
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while fetching issue records'
    });
  }
};

// @desc    Get single issue record
// @route   GET /api/issues/:id
// @access  Private
const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Issue ID format'
      });
    }

    const issue = await Issue.findById(id)
      .populate('book', 'title author isbn category')
      .populate('member', 'name email phone membershipId')
      .populate('issuedBy', 'name email');

    if (!issue) {
      return res.status(404).json({
        status: 'error',
        message: 'Issue record not found'
      });
    }

    res.status(200).json({
      status: 'success',
      issue
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while fetching issue record'
    });
  }
};

// @desc    Issue a book to a member
// @route   POST /api/issues
// @access  Private (Admin only)
const createIssue = async (req, res) => {
  try {
    const { bookId, memberId, dueDate } = req.body;

    if (!bookId || !memberId) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide bookId and memberId'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(bookId) || !mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Book ID or Member ID format'
      });
    }

    // Check book availability
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    if (book.availableQuantity <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Book is currently out of stock and cannot be issued'
      });
    }

    // Check member status
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'Member not found'
      });
    }

    if (member.status !== 'active') {
      return res.status(400).json({
        status: 'error',
        message: 'Member membership is inactive'
      });
    }

    // Prevent duplicate active issue of same book to same member
    const existingIssue = await Issue.findOne({
      book: bookId,
      member: memberId,
      status: 'issued'
    });

    if (existingIssue) {
      return res.status(400).json({
        status: 'error',
        message: 'This member has already issued this book and not returned it yet'
      });
    }

    // Calculate due date (default 14 days if not provided)
    const calculatedDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // Decrease book availability
    book.availableQuantity -= 1;
    await book.save();

    // Create issue record
    const issue = await Issue.create({
      book: bookId,
      member: memberId,
      issuedBy: req.session.user.id,
      dueDate: calculatedDueDate,
      status: 'issued'
    });

    const populatedIssue = await Issue.findById(issue._id)
      .populate('book', 'title author isbn')
      .populate('member', 'name email membershipId');

    res.status(201).json({
      status: 'success',
      message: 'Book issued successfully',
      issue: populatedIssue
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while issuing book'
    });
  }
};

// @desc    Return an issued book
// @route   PUT /api/issues/:id/return
// @access  Private (Admin only)
const returnBook = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Issue ID format'
      });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        status: 'error',
        message: 'Issue record not found'
      });
    }

    if (issue.status === 'returned') {
      return res.status(400).json({
        status: 'error',
        message: 'This book has already been returned'
      });
    }

    // Update book availability
    const book = await Book.findById(issue.book);
    if (book) {
      if (book.availableQuantity < book.quantity) {
        book.availableQuantity += 1;
        await book.save();
      }
    }

    // Mark issue as returned
    issue.status = 'returned';
    issue.returnDate = new Date();
    await issue.save();

    const updatedIssue = await Issue.findById(issue._id)
      .populate('book', 'title author isbn')
      .populate('member', 'name email membershipId');

    res.status(200).json({
      status: 'success',
      message: 'Book returned successfully',
      issue: updatedIssue
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while returning book'
    });
  }
};

module.exports = {
  getIssues,
  getIssueById,
  createIssue,
  returnBook
};
