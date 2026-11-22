Restaurant ChatBot

Project Description

Restaurant ChatBot is a web-based restaurant ordering application built with Node.js, Express.js, and MongoDB.

It allows customers to interact with a chatbot, view available meals, place orders, check current orders, view order history, cancel orders, and make payments through Paystack.

The application uses device-based sessions to maintain customer interactions without requiring authentication.

Technologies Used

 Node.js
 Express.js
 MongoDB
 Mongoose
 HTML
 CSS
 JavaScript
 Paystack Payment Integration
 Express Session

Installation and Setup

Clone this repository:

  git clone YOUR_GITHUB_REPOSITORY_URL


Navigate into the project folder:

  cd restaurant-chatbot


Install the dependencies:

  npm install


Create a .env file in the project root and add the following environment variables:

 MONGO_URI=your_mongodb_connection_string
 SESSION_SECRET=your_session_secret
 PAYSTACK_SECRET_KEY=your_paystack_secret_key
 PAYSTACK_PUBLIC_KEY=your_paystack_public_key
 APP_URL=http://localhost:3000


Start the development server:

 npm run dev


Open your browser and visit:

 http://localhost:3000


Payment Integration

 The application uses Paystack test mode for payment initialization and transaction verification.

 Customers receive a payment link and are redirected back to the chatbot after payment verification.


Security

 Sensitive environment variables and API keys are stored in .env and should never be committed to GitHub