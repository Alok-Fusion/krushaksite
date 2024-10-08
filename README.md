Here's the updated README with a **Copyright** section added:

---

# Krushak - Empowering Farmers with Direct Market Access

**Krushak** is a comprehensive platform built for farmers to connect directly with buyers, eliminating middlemen and ensuring they receive fair prices for their products. The platform also offers real-time weather updates, farming tips, news, and more, to help farmers make informed decisions and enhance their productivity. With features like payment processing, buying, selling, chat, reviews, and an admin panel with analytical tools, Krushak simplifies and enhances the agricultural trade process.

---

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)
- [Copyright](#copyright)

---

## Features

### For Farmers
- **Direct Selling & Buying**: Farmers can list their products for buyers to purchase directly.
- **Real-time Weather Updates**: Farmers can access weather information in their region to help with crop planning and protection.
- **Farming Tips & News**: Get up-to-date farming tips, articles, and news to improve farming practices and stay informed on agricultural policies.
- **Chat Functionality**: Farmers can communicate directly with buyers via a built-in chat system.
- **Reviews & Ratings**: Farmers and buyers can leave reviews to build trust within the community.
- **Analytical Graphs**: Farmers have access to detailed graphs showing sales trends, earnings, and product performance.
- **Payment Processing**: Farmers can receive payments via Stripe Payment Gateway.
- **Withdraw Function**: Farmers can withdraw their earnings directly to their bank accounts.

### For Admins
- **Admin Dashboard**: Manage platform activity with an overview of users, products, transactions, and platform usage.
- **Analytical Insights**: View graphical reports on user behavior, sales trends, product performance, and platform analytics.
- **User Management**: Admins can manage users (farmers and buyers) and oversee all platform operations.

---

## Technologies Used

- **Frontend**: React, Redux, Material-UI, Chart.js
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT (JSON Web Token)
- **Database**: MongoDB (NoSQL)
- **Payment Gateway**: Stripe
- **Real-time Chat**: Socket.io
- **State Management**: Redux
- **Weather & News API**: OpenWeatherMap API for real-time weather updates and news API for relevant farming news.
- **Admin Panel**: React Admin with analytical graphs

---

## Installation

### Prerequisites
- Node.js and npm installed
- MongoDB installed and running
- Stripe account for payment processing
- OpenWeatherMap API key for real-time weather updates
- News API key for farming news

### Steps

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/krushak.git
   cd krushak
   ```

2. Install the dependencies for the frontend and backend:

   - Install backend dependencies:
     ```bash
     cd backend
     npm install
     ```

   - Install frontend dependencies:
     ```bash
     cd ../frontend
     npm install
     ```

3. Create a `.env` file in the root of the `backend` folder and add the following:

   ```bash
   MONGO_URI=your_mongo_connection_string
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   WEATHER_API_KEY=your_openweathermap_api_key
   NEWS_API_KEY=your_news_api_key
   ```

4. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

5. Start the frontend server:
   ```bash
   cd ../frontend
   npm start
   ```

6. Visit the website in your browser at `http://localhost:3000`.

---

## Usage

- **Farmers** can create accounts, add products for sale, access weather updates, read relevant farming news, and withdraw earnings.
- **Buyers** can browse and purchase products, communicate with farmers, and leave reviews.
- **Admin Panel** provides insights into platform activity with user management, sales analytics, and operational controls.

---

## Screenshots

![Screenshot 2024-03-31 171501](https://github.com/user-attachments/assets/fe852cd2-d965-4825-b141-85f47b4eba99)


## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.


## Copyright

© 2024 Krushak. All rights reserved.

Unauthorized copying, distribution, or reproduction of any portion of this project without permission is prohibited. This includes design, source code, and content. Any violations will result in legal action.
