
const initializePayment = async (email, amount) => {
    try {
        const response = await fetch(
            "https://api.paystack.co/transaction/initialize",
            {
                method: "POST",

                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    amount: amount * 100,
                    callback_url: `${process.env.APP_URL}/api/chat/payment/callback`
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.status) {
            throw new Error(
                data.message || "Payment initialization failed."
            );
        }

        return data.data;

    } catch (error) {
        console.error("Paystack error:", error.message);
        throw error;
    }
};

module.exports = initializePayment;
