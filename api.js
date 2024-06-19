const express = require('express');
const router = express.Router(); // Initialize router
const transactionController = require('../controllers/transactionController');

// Route to initialize database
router.get('/initialize', transactionController.initializeDB);

// Route to list transactions
router.get('/transactions', transactionController.listTransactions);

// Route to get statistics
router.get('/statistics', transactionController.getStatistics);

// Route to get bar chart data
router.get('/barchart', transactionController.getBarChart);

// Route to get pie chart data
router.get('/piechart', transactionController.getPieChart);

// Route to get combined data from all APIs
router.get('/combined', transactionController.getCombinedData);

// Export router
module.exports = router;
