const express = require('express');
const router = express.Router();
const {
  getMembers,
  searchMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember
} = require('../controllers/memberController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.get('/search', isAuthenticated, searchMembers);

router
  .route('/')
  .get(isAuthenticated, getMembers)
  .post(isAuthenticated, isAdmin, createMember);

router
  .route('/:id')
  .get(isAuthenticated, getMemberById)
  .put(isAuthenticated, isAdmin, updateMember)
  .delete(isAuthenticated, isAdmin, deleteMember);

module.exports = router;
