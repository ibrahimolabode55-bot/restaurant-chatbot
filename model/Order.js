const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true
    },

    items: [
        {
            menuItem: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Menu",
                required: true
            },

            name: {
                type: String,
                required: true
            },

            price: {
                type: Number,
                required: true
            },

            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ],

    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },

    status: {
        type: String,
        enum: ["pending", "placed", "cancelled", "paid"],
        default: "pending"
    },

    paymentReference: {
        type: String,
        default: null
    },

    customerEmail: {
        type: String,
        default: ""
    },

    paymentStatus: {
        type: String,
        enum: ["pending", "successful", "failed"],
        default: "pending"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);