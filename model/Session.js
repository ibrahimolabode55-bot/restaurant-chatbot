const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },

    currentOrder: [
    {
        menuItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Menu"
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
            default: 1
        },
    }
],

isChoosingMeal: {
    type: Boolean,
    default: false
},

customerEmail: {
    type: String,
    default: ""
},

isProvidingEmail: {
    type: Boolean,
    default: false
},

pendingOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    default: null
}

}, {
    timestamps: true
});

module.exports = mongoose.model("Session", sessionSchema);