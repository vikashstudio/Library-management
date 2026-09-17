const Book = require('../models/Book');
const Member = require('../models/Member');

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/stats
// @access  Private (Logged-in users)
const getDashboardStats = async (req, res) => {
  try {
    const books = await Book.find().select('quantity availableQuantity');
    const totalMembers = await Member.countDocuments();

    let totalBooks = 0;
    let availableBooks = 0;

    books.forEach((b) => {
      totalBooks += b.quantity || 0;
      availableBooks += b.availableQuantity || 0;
    });

    const issuedBooks = totalBooks - availableBooks;

    res.status(200).json({
      status: 'success',
      stats: {
        totalBooks,
        availableBooks,
        issuedBooks: issuedBooks >= 0 ? issuedBooks : 0,
        totalMembers
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while fetching dashboard stats'
    });
  }
};

module.exports = { getDashboardStats };
