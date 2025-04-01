import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import pkg from 'pg'; // Import pg as a default export
const { Client } = pkg; // Destructure Client from the package
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Database Connection
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

client.connect();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve('public')));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => res.render('index'));

// Signup
app.get('/signup', (req, res) => res.render('signup'));
app.post('/signup', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    await client.query('INSERT INTO users (username, password, role) VALUES ($1, $2, $3)', [
      username,
      password,
      role,
    ]);
    res.redirect('/login');
  } catch (err) {
    res.status(500).send('Error signing up. Username might already exist.');
  }
});

// Login
app.get('/login', (req, res) => res.render('login'));
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0 && result.rows[0].password === password) {
      const user = result.rows[0];
      const role = user.role;
      const userId = user.id;

      if (role === 'seller') {
        res.redirect(`/add-recipe?role=${role}&userId=${userId}`);
      } else {
        res.redirect(`/recipes?role=${role}`);
      }
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (err) {
    res.status(500).send('Error logging in');
  }
});

// Add Recipe (Seller)
// Add Recipe (GET)
app.get('/add-recipe', (req, res) => {
  const { role, userId } = req.query;

  if (role === 'seller' && userId) {
    res.render('add-recipe', { sellerId: userId, errorMessage: '' }); // Pass an empty errorMessage initially
  } else {
    res.redirect('/login');
  }
});

// Add Recipe (POST)
app.post('/add-recipe', async (req, res) => {
  const {
    title,
    description,
    category,
    sellerId,
    'ingredient-name[]': ingredientNames,
    'ingredient-measurement[]': ingredientMeasurements,
  } = req.body;

  try {
    // Recipe saving logic here
    const recipeResult = await client.query(
      'INSERT INTO recipes (title, description, category, seller_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [title, description, category, sellerId]
    );
    const recipeId = recipeResult.rows[0].id;

    if (ingredientNames && ingredientMeasurements) {
      for (let i = 0; i < ingredientNames.length; i++) {
        await client.query(
          'INSERT INTO ingredients (recipe_id, name, measurement) VALUES ($1, $2, $3)',
          [recipeId, ingredientNames[i], ingredientMeasurements[i]]
        );
      }
    }

    res.redirect('/recipes');
  } catch (err) {
    console.error('Error adding recipe:', err);
    res.render('add-recipe', {
      sellerId,
      errorMessage: 'An error occurred while adding the recipe. Please try again.',
    });
  }
});


app.post('/add-recipe', async (req, res) => {
  const { title, description, category, sellerId } = req.body;

  try {
    await client.query(
      'INSERT INTO recipes (title, description, category, seller_id) VALUES ($1, $2, $3, $4)',
      [title, description, category, sellerId]
    );

    res.redirect('/recipes');
  } catch (err) {
    console.error('Error adding recipe:', err);
    res.status(500).send('Error adding recipe');
  }
});

// Recipes
app.get('/recipes', async (req, res) => {
  const { category } = req.query;
  try {
    let query = 'SELECT * FROM recipes';
    let values = [];

    if (category) {
      query += ' WHERE category != $1';
      values = [category];
    }

    const result = await client.query(query, values);
    const categoriesResult = await client.query('SELECT DISTINCT category FROM recipes');
    const categories = categoriesResult.rows.map(row => row.category);

    res.render('recipes', { recipes: result.rows, categories });
  } catch (err) {
    res.status(500).send('Error fetching recipes');
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
