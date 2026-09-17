const express = require('express');
const router = express.Router();
const {
  getIssues,
  getIssueById,
  createIssue,
  returnBook
} = require('../controllers/issueController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router
  .route('/')
  .get(isAuthenticated, getIssues)
  .post(isAuthenticated, isAdmin, createIssue);

router.get('/:id', isAuthenticated, getIssueById);
router.put('/:id/return', isAuthenticated, isAdmin, returnBook);

module.exports = router;
