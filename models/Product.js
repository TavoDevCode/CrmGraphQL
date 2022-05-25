const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    price: {
        type: Number,
        require: true,
        trim: true
    },
    stock: {
        type: Number,
        require: true,
        trim: true
    },
    created_at: {
        type: Date,
        default: Date.now()
    }
});

productSchema.index({ name: 'text' });

module.exports = mongoose.model('Product', productSchema);