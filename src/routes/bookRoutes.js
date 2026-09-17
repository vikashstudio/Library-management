const express = require('express');
const router = express.Router();
const {
  getBooks,
  searchBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Note: /search route must be defined BEFORE /:id to prevent route collision
router.get('/search', isAuthenticated, searchBooks);

router
  .route('/')
  .get(isAuthenticated, getBooks)
  .post(isAuthenticated, isAdmin, createBook);

router
  .route('/:id')
  .get(isAuthenticated, getBookById)
  .put(isAuthenticated, isAdmin, updateBook)
  .delete(isAuthenticated, isAdmin, deleteBook);

module.exports = router;
