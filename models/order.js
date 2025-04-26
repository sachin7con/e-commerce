const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    items: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Products'
            },
            title: String,
            price: Number,
            quantity: Number
        }
    ],
    totalAmount: Number,
    status: {
        type: String,
        default: 'pending'
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
