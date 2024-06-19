const axios = require('axios');
const Transaction = require('../models/Transaction');

// Function to initialize the database
exports.initializeDB = async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const transactions = response.data;

        await Transaction.deleteMany({}); // Clear existing data
        await Transaction.insertMany(transactions); // Insert new data

        res.status(200).send('Database initialized with seed data');
    } catch (error) {
        console.error(error); // Log error
        res.status(500).send('Error initializing database');
    }
};

// Function to list transactions with search and pagination
exports.listTransactions = async (req, res) => {
    let { month, search, page, perPage } = req.query;

    page = page ? parseInt(page) : 1;
    perPage = perPage ? parseInt(perPage) : 10;
    
    const monthNumber = new Date(Date.parse(month + " 1, 2022")).getMonth() + 1;

    const query = {
        dateOfSale: { $regex: `^\\d{4}-${monthNumber.toString().padStart(2, '0')}-\\d{2}` }
    };

    if (search) {
        query.$or = [
            { productName: { $regex: search, $options: 'i' } },
            { productDescription: { $regex: search, $options: 'i' } },
            { productPrice: { $regex: search, $options: 'i' } }
        ];
    }

    try {
        const transactions = await Transaction.find(query)
            .skip((page - 1) * perPage)
            .limit(perPage);

        res.status(200).json(transactions);
    } catch (error) {
        console.error(error); // Log error
        res.status(500).send('Error fetching transactions');
    }
};

// Function to get statistics
exports.getStatistics = async (req, res) => {
    const { month } = req.query;

    const monthNumber = new Date(Date.parse(month + " 1, 2022")).getMonth() + 1;
    const query = {
        dateOfSale: { $regex: `^\\d{4}-${monthNumber.toString().padStart(2, '0')}-\\d{2}` }
    };

    try {
        const totalSaleAmount = await Transaction.aggregate([
            { $match: query },
            { $group: { _id: null, totalAmount: { $sum: '$productPrice' } } }
        ]);

        const soldItems = await Transaction.countDocuments({ ...query, sold: true });
        const notSoldItems = await Transaction.countDocuments({ ...query, sold: false });

        res.status(200).json({
            totalSaleAmount: totalSaleAmount[0]?.totalAmount || 0,
            soldItems,
            notSoldItems
        });
    } catch (error) {
        console.error(error); // Log error
        res.status(500).send('Error fetching statistics');
    }
};

// Function to get bar chart data
exports.getBarChart = async (req, res) => {
    const { month } = req.query;

    const monthNumber = new Date(Date.parse(month + " 1, 2022")).getMonth() + 1;
    const query = {
        dateOfSale: { $regex: `^\\d{4}-${monthNumber.toString().padStart(2, '0')}-\\d{2}` }
    };

    try {
        const priceRanges = [
            { range: '0-100', min: 0, max: 100 },
            { range: '101-200', min: 101, max: 200 },
            { range: '201-300', min: 201, max: 300 },
            { range: '301-400', min: 301, max: 400 },
            { range: '401-500', min: 401, max: 500 },
            { range: '501-600', min: 501, max: 600 },
            { range: '601-700', min: 601, max: 700 },
            { range: '701-800', min: 701, max: 800 },
            { range: '801-900', min: 801, max: 900 },
            { range: '901-above', min: 901, max: Infinity },
        ];

        const result = [];

        for (let range of priceRanges) {
            const count = await Transaction.countDocuments({
                ...query,
                productPrice: { $gte: range.min, $lte: range.max === Infinity ? Infinity : range.max }
            });
            result.push({ range: range.range, count });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error(error); // Log error
        res.status(500).send('Error fetching bar chart data');
    }
};

// Function to get pie chart data
exports.getPieChart = async (req, res) => {
    const { month } = req.query;

    const monthNumber = new Date(Date.parse(month + " 1, 2022")).getMonth() + 1;
    const query = {
        dateOfSale: { $regex: `^\\d{4}-${monthNumber.toString().padStart(2, '0')}-\\d{2}` }
    };

    try {
        const categories = await Transaction.aggregate([
            { $match: query },
            { $group: { _id: '$productCategory', count: { $sum: 1 } } }
        ]);

        res.status(200).json(categories);
    } catch (error) {
        console.error(error); // Log error
        res.status(500).send('Error fetching pie chart data');
    }
};

// Function to get combined data from all APIs
exports.getCombinedData = async (req, res) => {
    const { month } = req.query;

    try {
        const [transactions, statistics, barChart, pieChart] = await Promise.all([
            this.listTransactions(req, res),
            this.getStatistics(req, res),
            this.getBarChart(req, res),
            this.getPieChart(req, res)
        ]);
        res.status(200).json({
            transactions,
            statistics,
            barChart,
            pieChart
        });
    } catch (error) {
        console.error(error); // Log error
        res.status(500).send('Error fetching combined data');
    }
};
