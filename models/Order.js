const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    orders: {
        type: Array,
        require: true,
    },
    total: {
        type: Number,
        require: true,
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'Client',
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'User',
    },
    state: {
        type: String,
        default: 'PENDING',
    },
    created_at: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model('Order', orderSchema);
