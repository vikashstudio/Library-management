const Book = require('../models/Book');
const mongoose = require('mongoose');

// @desc    Get all books
// @route   GET /api/books
// @access  Private (Logged-in users)
const getBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      count: books.length,
      books
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while fetching books'
    });
  }
};

// @desc    Search books
// @route   GET /api/books/search?query=...
// @access  Private
const searchBooks = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return getBooks(req, res);
    }

    const regex = new RegExp(query, 'i');
    const books = await Book.find({
      $or: [
        { title: regex },
        { author: regex },
        { isbn: regex },
        { category: regex }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: books.length,
      books
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while searching books'
    });
  }
};

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Private
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Book ID format'
      });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    res.status(200).json({
      status: 'success',
      book
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while fetching book'
    });
  }
};

// @desc    Create new book
// @route   POST /api/books
// @access  Private (Admin only)
const createBook = async (req, res) => {
  try {
    const { title, author, isbn, category, quantity, availableQuantity } = req.body;

    if (!title || !author || !isbn || !category || quantity === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide title, author, isbn, category, and quantity'
      });
    }

    if (quantity < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Quantity cannot be negative'
      });
    }

    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({
        status: 'error',
        message: 'A book with this ISBN already exists'
      });
    }

    const qty = Number(quantity);
    const availQty = availableQuantity !== undefined ? Number(availableQuantity) : qty;

    if (availQty > qty) {
      return res.status(400).json({
        status: 'error',
        message: 'Available quantity cannot exceed total quantity'
      });
    }

    const book = await Book.create({
      title,
      author,
      isbn,
      category,
      quantity: qty,
      availableQuantity: availQty
    });

    res.status(201).json({
      status: 'success',
      message: 'Book created successfully',
      book
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'A book with this ISBN already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while creating book'
    });
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private (Admin only)
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Book ID format'
      });
    }

    const { title, author, isbn, category, quantity, availableQuantity } = req.body;

    let book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    if (quantity !== undefined && quantity < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Quantity cannot be negative'
      });
    }

    if (availableQuantity !== undefined && availableQuantity < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Available quantity cannot be negative'
      });
    }

    if (isbn && isbn !== book.isbn) {
      const existingIsbn = await Book.findOne({ isbn });
      if (existingIsbn) {
        return res.status(400).json({
          status: 'error',
          message: 'Another book already exists with this ISBN'
        });
      }
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.isbn = isbn || book.isbn;
    book.category = category || book.category;
    if (quantity !== undefined) book.quantity = Number(quantity);
    if (availableQuantity !== undefined) book.availableQuantity = Number(availableQuantity);

    if (book.availableQuantity > book.quantity) {
      return res.status(400).json({
        status: 'error',
        message: 'Available quantity cannot exceed total quantity'
      });
    }

    const updatedBook = await book.save();

    res.status(200).json({
      status: 'success',
      message: 'Book updated successfully',
      book: updatedBook
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while updating book'
    });
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private (Admin only)
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Book ID format'
      });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    await Book.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'Book deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while deleting book'
    });
  }
};

module.exports = {
  getBooks,
  searchBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};
