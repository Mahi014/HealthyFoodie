import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import pool from "./db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use(session({
  secret: process.env.Session_Secret_Key,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// Signup
app.post("/signup", async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *",
      [username, password, role]
    );
    res.json({ message: "User registered", user: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      res.status(400).json({ error: "Username already exists" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );
    if (result.rows.length > 0) {
      req.session.user = result.rows[0];
      res.json({ message: "Login successful", user: result.rows[0] });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auth status
app.get("/auth/status", (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.json({ authenticated: false });
  }
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Prompt builder
function buildPrompt(title, description, ingredients) {
  const unitsExplanation = `
Units:
- g = gram
- kg = kilogram
- ml = milliliter
- l = liter
- tsp = teaspoon
- tbsp = tablespoon
- cup = standard measuring cup
`;

  const ingredientList = ingredients
    .map((ing) => `${ing.name}: ${ing.measurement}`)
    .join("\n");

  return `
You are a health AI. Analyze the following recipe and ingredients. From this list:

- Heart Disease
- Type 2 Diabetes
- Kidney Disease
- Obesity
- Non-Alcoholic Fatty Liver Disease (NAFLD)
- Healthy (if none apply)

Return only the **single most relevant** disease this dish is associated with. Respond with only the disease name — no explanations, no extra text.

${unitsExplanation}

Recipe Name: ${title}
Description: ${description}

Ingredients:\n${ingredientList}
`;
}

// Route: Add recipe and get 1 disease
app.post("/recipes/add", async (req, res) => {
  const { title, description, ingredients } = req.body;

  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  const userId = req.session.user.id;

  try {
    // Insert recipe
    const result = await pool.query(
      "INSERT INTO recipes (title, description, seller_id) VALUES ($1, $2, $3) RETURNING *",
      [title, description, userId]
    );
    const recipe = result.rows[0];

    // Insert ingredients
    for (const ingredient of ingredients) {
      const { name, measurement } = ingredient;
      await pool.query(
        "INSERT INTO ingredients (recipe_id, name, measurement) VALUES ($1, $2, $3)",
        [recipe.id, name, measurement]
      );
    }

    // Call Gemini
    const prompt = buildPrompt(title, description, ingredients);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const resultGemini = await model.generateContent(prompt);
    const response = resultGemini.response.text().trim();

    console.log(response);

    const possibleDiseases = [
      "Heart Disease",
      "Type 2 Diabetes",
      "Kidney Disease",
      "Obesity",
      "Non-Alcoholic Fatty Liver Disease (NAFLD)",
      "Healthy"
    ];

    const disease = possibleDiseases.find(d =>
      response.toLowerCase().includes(d.toLowerCase())
    );

    if (disease) {
      await pool.query(
        "INSERT INTO disease (recipe_id, disease) VALUES ($1, $2)",
        [recipe.id, disease]
      );
    }

    res.json({
      message: "Recipe, ingredients, and predicted disease saved",
      recipe,
      disease: disease || "Not found"
    });
  } catch (err) {
    console.error("Error in /recipes/add:", err.message);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// Get all recipes
app.get("/recipes", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        recipes.id, 
        recipes.title, 
        recipes.description, 
        users.username AS seller_username,
        disease.disease
      FROM recipes
      JOIN users ON recipes.seller_id = users.id
      LEFT JOIN disease ON recipes.id = disease.recipe_id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get recipes by seller
app.get("/recipes/seller", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "seller") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const sellerId = req.session.user.id;

    const result = await pool.query(
    `
     SELECT 
      recipes.id, 
      recipes.title, 
      recipes.description, 
      users.username AS seller_username,
      json_agg(json_build_object('name', ingredients.name, 'measurement', ingredients.measurement)) AS ingredients,
      disease.disease
     FROM recipes
     JOIN users ON recipes.seller_id = users.id
     LEFT JOIN ingredients ON recipes.id = ingredients.recipe_id
     LEFT JOIN disease ON recipes.id = disease.recipe_id
     WHERE recipes.seller_id = $1
     GROUP BY recipes.id, users.username, disease.disease
      `,
      [sellerId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete recipe
app.delete("/recipes/:id", async (req, res) => {
  const recipeId = req.params.id;

  if (!req.session.user || req.session.user.role !== "seller") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Delete from disease, ingredients, and then recipe
    await pool.query("DELETE FROM disease WHERE recipe_id = $1", [recipeId]);
    await pool.query("DELETE FROM ingredients WHERE recipe_id = $1", [recipeId]);
    await pool.query("DELETE FROM recipes WHERE id = $1 AND seller_id = $2", [
      recipeId,
      req.session.user.id,
    ]);

    res.json({ message: "Recipe deleted successfully" });
  } catch (err) {
    console.error("Error deleting recipe:", err.message);
    res.status(500).json({ error: "Failed to delete recipe" });
  }
});


// Start server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

