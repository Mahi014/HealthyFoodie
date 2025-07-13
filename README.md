# Healthy Foodie 🍲

Healthy Foodie is a smart, health-aware recipe-sharing platform built using the **PERN stack** (PostgreSQL, Express.js, React.js, Node.js) and **Tailwind CSS**. It integrates **Google Gemini AI** to analyze recipe ingredients and predict potential health risks, empowering users to make informed food choices.

## Features 🚀
- **Role-Based Access**: Sign up and log in as a seller or customer.
- **Seller Portal**: Sellers can add recipes with ingredients and descriptions.
- **Customer Portal**: Customers can browse all submitted recipes and view predicted disease risks.
- **AI Health Analyzer**: Powered by Gemini AI, identifies potential health risks:
  - Heart Disease
  - Type 2 Diabetes
  - Kidney Disease
  - Obesity
  - Non-Alcoholic Fatty Liver Disease (NAFLD)
  - Healthy
- **Session-Based Authentication**: Secure login with sessions and protected routes.
- **Modern UI**: Built with React and Tailwind CSS for a clean, responsive design.

## Tech Stack 🛠️
- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **AI Integration**: Google Gemini API (Gemini 2.0 Flash)
- **Auth**: express-session, cookie-parser

## Project Preview 🖼️

### Screenshot 1  
![Screenshot 1](Images/Screenshot%20(1).png)  

### Screenshot 2  
![Screenshot 2](Images/Screenshot%20(2).png)  

### Screenshot 3  
![Screenshot 3](Images/Screenshot%20(3).png)  

### Screenshot 4  
![Screenshot 4](Images/Screenshot%20(4).png)  

### Screenshot 5  
![Screenshot 5](Images/Screenshot%20(5).png)

### Screenshot 5  
![Screenshot 5](Images/Screenshot%20(5).png)

### Screenshot 6  
![Screenshot 6](Images/Screenshot%20(6).png)

### Screenshot 7  
![Screenshot 7](Images/Screenshot%20(7).png)

### Screenshot 8  
![Screenshot 8](Images/Screenshot%20(8).png)

### Screenshot 9  
![Screenshot 9](Images/Screenshot%20(9).png)

### Screenshot 10  
![Screenshot 10](Images/Screenshot%20(10).png)

## Getting Started ⚙️

### 1. Clone the Repository
```bash
git clone https://github.com/Mahi014/HealthyFoodie.git
cd HealthyFoodie
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory with the following:
```
GEMINI_API_KEY=your_gemini_key
Session_Secret_Key=your_session_secret
```

Start the backend server:
```bash
nodemon index.js
```

### 3. Setup Frontend
```bash
cd ../client
npm install
npm start
```

## How It Works 🔍
1. Sellers add recipes with a list of ingredients and measurements.
2. The Gemini API analyzes the ingredients and predicts the most relevant health risk (or marks it as Healthy).
3. The system saves and displays the prediction alongside the recipe.
4. Customers can browse all recipes with disease tags for better food choices.
5. All routes are protected based on user role (customer or seller).

## Developed By
Mahender Singh