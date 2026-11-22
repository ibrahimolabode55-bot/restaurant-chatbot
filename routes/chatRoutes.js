const express = require("express");
const router = express.Router();
const Menu = require("../model/Menu");
const Session = require("../model/Session");
const Order = require("../model/Order");
const initializePayment = require("../services/paystackService");

router.get("/payment/callback", async (req, res) => {
    try {
        const reference = req.query.reference;

        if (!reference) {
            return res.redirect("/?payment=failed");
        }

        const response = await fetch(
            `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                }
            }
        );

        const result = await response.json();

        if (!response.ok || !result.status) {
            return res.redirect("/?payment=failed");
        }

        const transaction = result.data;

        const order = await Order.findOne({
            paymentReference: reference
        });

        if (!order) {
            return res.redirect("/?payment=failed");
        }

        if (
            transaction.status !== "success" ||
            transaction.reference !== order.paymentReference ||
            transaction.amount !== order.totalAmount * 100 ||
            transaction.currency !== "NGN"
        ) {
            return res.redirect("/?payment=failed");
        }

        order.paymentStatus = "successful";
        order.status = "paid";

        await order.save();

        return res.redirect("/?payment=success");

    } catch (error) {
        console.error("Payment verification error:", error.message);
        return res.redirect("/?payment=failed");
    }
});

router.post("/", async(req, res) => {

    console.log("Customer session ID:", req.sessionID);

    if (
        typeof req.body.message !== "string" ||
        req.body.message.trim() === ""
    ) {
        return res.status(400).json({
            reply: "Please enter a valid message."
        });
    }

    const message = req.body.message.trim();

    console.log("Message received:", message);

    req.session.customerStarted = true;

        try {
        let customerSession = await Session.findOne({
            sessionId: req.sessionID
        });

        if (!customerSession) {
            customerSession = await Session.create({
                sessionId: req.sessionID
            });
        }
        
        if (message === "1") {
            const menuItems = await Menu.find({ available: true });
    
            if (menuItems.length === 0) {
                return res.json({
                    reply: "Sorry, our menu is currently empty."
                });
            }

            let menuReply = "Welcome to our Restaurant Menu!\n\n";

            menuItems.forEach((item, index) => {
                menuReply += `${index + 1}. ${item.name} - ₦${item.price}\n`;
            });

            customerSession.isChoosingMeal = true;
            await customerSession.save();

            menuReply += "\nPlease enter the number of the meal you want.";

            return res.json({
                reply: menuReply
            });
        }

        if (message.toLowerCase() === "reset") {
            customerSession.isProvidingEmail = false;
            customerSession.pendingOrderId = null;
            customerSession.customerEmail = "";
            customerSession.currentOrder = [];
            customerSession.isChoosingMeal = false;

            await customerSession.save();

            return res.json({
                reply: "Your session has been reset. Please enter 1 to start a new order."
            });
        }

        if (customerSession.isProvidingEmail) {
            const email = message.toLowerCase();

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {
                return res.json({
                    reply: "Please enter a valid email address."
                });
            }

            console.log("Looking for pending order ID:", customerSession.pendingOrderId);
            const order = await Order.findOne({
                _id: customerSession.pendingOrderId,
                sessionId: req.sessionID
            });

            if (!order) {
                return res.json({
                    reply: "Your pending order could not be found. Please place a new order."
                });
            }

            const paymentData = await initializePayment(
                email,
                order.totalAmount
            );

            order.customerEmail = email;
            order.paymentReference = paymentData.reference;

            await order.save();


            customerSession.customerEmail = email;
            customerSession.isProvidingEmail = false;

            await customerSession.save();

            return res.json({
                reply: `Your payment has been initialized successfully!
                
        Amount: ₦${order.totalAmount}
        
        Click the button below to complete your payment.`,
        
            paymentUrl: paymentData.authorization_url
            });
        }

        if (customerSession.isChoosingMeal) {
            const selectedNumber = Number(message);

            const menuItems = await Menu.find({ available: true });

            if (
                !Number.isInteger(selectedNumber) ||
                selectedNumber < 1 ||
                selectedNumber > menuItems.length
            ) {
                return res.json({
                    reply: "Invalid meal number. Please select a valid number from the menu."
                });
            }

            const selectedMeal = menuItems[selectedNumber - 1];

            customerSession.currentOrder.push({
                menuItem: selectedMeal._id,
                name: selectedMeal.name,
                price: selectedMeal.price,
                quantity: 1
            });

            customerSession.isChoosingMeal = false;

            await customerSession.save();

            return res.json({
                reply: `${selectedMeal.name} has been added to your current order!`
            });
        }

        if (message === "97") {
    if (customerSession.currentOrder.length === 0) {
        return res.json({
            reply: "You don't have any items in your current order."
        });
    }

            let orderReply = "Your Current Order:\n\n";
            let total = 0;

            customerSession.currentOrder.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;

                total += itemTotal;

                orderReply += `${index + 1}. ${item.name} - ₦${itemTotal}\n`;
            });

            orderReply += `\nTotal: ₦${total}`;

            return res.json({
                reply: orderReply
            });
        }

        if (message === "99") {
            if (customerSession.currentOrder.length === 0) {
                return res.json({
                    reply: "No order to place. Please enter 1 to place a new order."
                });
            }

            const total = customerSession.currentOrder.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );

            const newOrder = await Order.create({
                sessionId: req.sessionID,
                items: customerSession.currentOrder,
                totalAmount: total,
                status: "placed"
            });

            customerSession.currentOrder = [];
            customerSession.pendingOrderId = newOrder._id;
            console.log("Saved pending order ID:", customerSession.pendingOrderId);
            customerSession.isProvidingEmail = true;

            await customerSession.save();

            return res.json({
                reply: `Your order has placed successfully!
                
                Order ID: ${newOrder.id}
                Total: ₦${total}
                
                Please enter email address to proceed with payment`
            });

            return res.json({
                reply: `Your order has been placed successfully!

        Order ID: ${newOrder._id}
        Total: ₦${total}

        Thank you for ordering with us!
        You can now proceed to payment.`
            });
        }

        if (message === "98") {
            const orders = await Order.find({
                sessionId: req.sessionID
            }).sort({ createdAt: -1 });

            if (orders.length === 0) {
                return res.json({
                    reply: "You have no previous orders."
                });
            }

            let historyReply = "Your Order History:\n\n";

            orders.forEach((order, index) => {
                historyReply += `Order ${index + 1}\n`;
                historyReply += `Order ID: ${order._id}\n`;
                historyReply += `Total: ₦${order.totalAmount}\n`;
                historyReply += `Status: ${order.status}\n\n`;
            });

            return res.json({
                reply: historyReply
            });
        }

        if (message === "0") {
            if (
                customerSession.currentOrder.length === 0 &&
                !customerSession.isChoosingMeal
            ) {
                return res.json({
                    reply: "You don't have any current order to cancel."
                });
            }

            customerSession.currentOrder = [];
            customerSession.isChoosingMeal = false;

            await customerSession.save();

            return res.json({
                reply: "Your current order has been cancelled successfully."
            });
        }

        if (message === "menu") {
            return res.json({
                reply: `Wecome to our Restaurant!
            
    Please select an option:

    1. Place an order
    99. Checkout order
    98. See order history
    97. See current order
    0. Cancel order`
            });
        }
        return res.json({
            reply: `Invalid option: ${message}.
            
        Please select one of the available options:
        
        1. Place an order
        99.  Checkout order
        98. See order history
        97. See current order
        0. Cancel order`
        });

    } catch (error) {
        console.error("Chat error:", error);

        return res.status(500).json({
            reply: "Something went wrong. Please try again."
        });
    }   
});

module.exports = router;