const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");

sendButton.addEventListener("click", () => {
    const message = messageInput.value.trim();

    if (message === "") {
        chatBox.innerHTML +=
            "<p>Bot: Please enter a valid message.</p>";
        return;
    }

    chatBox.innerHTML += `<p>You: ${message}</p>`;

    fetch("/api/chat", {
    method: "POST",

    headers: {
        "Content-Type": "application/json"
    },

    body: JSON.stringify({
        message: message
    })
})
.then(response => response.json())
.then(data => {
    chatBox.innerHTML += `<p>Bot: ${data.reply}</p>`;

    if (
        data.paymentUrl &&
        data.paymentUrl.startsWith("https://checkout.paystack.com/")
    ) {
        const paymentLink = document.createElement("a");

        paymentLink.href = data.paymentUrl;
        paymentLink.textContent = "Pay Now";
        paymentLink.target = "_blank";
        paymentLink.rel = "noopener noreferrer";

        chatBox.appendChild(paymentLink);
    }
})
.catch(error => {
    console.error("Error:", error);
    chatBox.innerHTML += "<p>Bot: Something went wrong. Please try again.</p>";
});

    messageInput.value = "";
});

const paymentResult = new URLSearchParams(window.location.search)
    .get("payment");

if (paymentResult === "success") {
    chatBox.innerHTML += `
        <p>Bot: Payment successful! Your order has been paid. Thank you for ordering with us!</p>
    `;
}

if (paymentResult === "failed") {
    chatBox.innerHTML += `
        <p>Bot: Payment verification failed. Please contact the restaurant or try again.</p>
    `;
}