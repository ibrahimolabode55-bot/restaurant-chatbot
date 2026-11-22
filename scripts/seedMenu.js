const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

console.log("MongoDB URI loaded:", Boolean(process.env.MONGO_URI));

const mongoose = require("mongoose");
const Menu = require("../model/Menu");

const menuItems = [
    {
        name: "Jollof Rice",
        price: 2500,
        description: "Delicious Nigerian jollof rice"
    },
    {
        name: "Fried Rice",
        price: 3000,
        description: "Tasty fried rice with vegetables"
    },
    {
        name: "Chicken",
        price: 2000,
        description: "Well-seasoned grilled chicken"
    },
    {
        name: "Beef Burger",
        price: 3500,
        description: "Burger with beef and fresh vegetables"
    },
    {
        name: "Pounded Yam and Egusi",
        price: 4000,
        description: "Pounded yam served with egusi soup"
    }
];

const seedMenu = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected to MongoDB.");

        await Menu.deleteMany({});

        await Menu.insertMany(menuItems);

        console.log("Restaurant menu added successfully!");

        await mongoose.connection.close();
    } catch (error) {
        console.error("Error adding menu:", error.message);
        process.exit(1);
    }
};

seedMenu();