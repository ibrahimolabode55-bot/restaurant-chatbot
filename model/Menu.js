const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    description: {
        type: String,
        default: ""
    },

    available: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Menu", menuSchema);