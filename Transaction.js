const mongoose = require('mongoose');

// Define schema for transactions
const transactionSchema = new mongoose.Schema({
    dateOfSale: { type: Date, required: true },
    productName: { type: String, required: true },
    productDescription: { type: String, required: true },
    productPrice: { type: Number, required: true },
    productCategory: { type: String, required: true },
    sold: { type: Boolean, required: true }
});

// Export model
module.exports = mongoose.model('Transaction', transactionSchema);
