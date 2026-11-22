const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const connectDB = require("./config/db");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: "express_sessions"
    }),

    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(express.static("public"));
app.use("/api/chat", chatRoutes);


const PORT = process.env.PORT || 3000;

// Our first route
app.get("/", (req, res) => {
    res.send("Welcome to our Restaurant ChatBot!");
});

// Start the server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Restaurant ChatBot is running on port ${PORT}`);
    });
});