const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/stats', isAuthenticated, getDashboardStats);

module.exports = router;
