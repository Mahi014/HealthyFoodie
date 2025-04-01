import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const client = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

client.connect().catch(err => {
  console.error('Error connecting to the database:', err);
  process.exit(1);
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve('public')));
app.set('view engine', 'ejs');


app.get('/', (req, res) => res.render('index'));


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
    console.error('Error during signup:', err);
    res.status(500).send('Error signing up. Username might already exist.');
  }
});

app.get('/login', (req, res) => res.render('login'));
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0 && result.rows[0].password === password) {
      const user = result.rows[0];
      if (user.role === 'seller') {
        res.redirect(`/add-recipe?role=seller&userId=${user.id}`);
      } else {
        res.redirect('/recipes');
      }
    } else {
      res.status(401).send('Invalid credentials.');
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send('Error logging in.');
  }
});


app.get('/add-recipe', (req, res) => {
  const { role, userId } = req.query;

  if (role === 'seller' && userId) {
    res.render('add-recipe', { sellerId: userId, errorMessage: '' });
  } else {
    res.redirect('/login');
  }
});

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
    const recipeResult = await client.query(
      'INSERT INTO recipes (title, description, category, seller_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [title, description, category, sellerId]
    );

    const recipeId = recipeResult.rows[0].id;

    const ingredientsList = [];
    if (Array.isArray(ingredientNames) && Array.isArray(ingredientMeasurements)) {
      for (let i = 0; i < ingredientNames.length; i++) {
        await client.query(
          'INSERT INTO ingredients (recipe_id, name, measurement) VALUES ($1, $2, $3)',
          [recipeId, ingredientNames[i], ingredientMeasurements[i]]
        );
        ingredientsList.push(`${ingredientMeasurements[i]} ${ingredientNames[i]}`);
      }
    }

    
    const apiResponse = await fetch(
      `https://api.edamam.com/api/nutrition-details?app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, ingr: ingredientsList }),
      }
    );

    const apiResponseText = await apiResponse.text();
    console.log('Edamam API Response:', apiResponseText);

    if (!apiResponse.ok) {
      console.error('Failed to fetch nutritional data:', apiResponseText);
      throw new Error('Failed to fetch nutritional data');
    }

    const nutritionData = JSON.parse(apiResponseText);

    if (nutritionData && nutritionData.totalNutrients) {
      await client.query(
        'UPDATE recipes SET calories = $1, protein = $2, carbs = $3, fat = $4 WHERE id = $5',
        [
          nutritionData.calories || 0,
          nutritionData.totalNutrients.PROCNT?.quantity || 0,
          nutritionData.totalNutrients.CHOCDF?.quantity || 0,
          nutritionData.totalNutrients.FAT?.quantity || 0,
          recipeId,
        ]
      );
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


app.get('/recipes', async (req, res) => {
  const { category } = req.query;
  try {
    let query = 'SELECT id, title, description, category, calories, protein, carbs, fat FROM recipes';
    const values = [];

    if (category) {
      query += ' WHERE category = $1';
      values.push(category);
    }

    const recipesResult = await client.query(query, values);
    const categoriesResult = await client.query('SELECT DISTINCT category FROM recipes');
    const categories = categoriesResult.rows.map(row => row.category);

    for (const recipe of recipesResult.rows) {
      const ingredientsResult = await client.query('SELECT * FROM ingredients WHERE recipe_id = $1', [recipe.id]);
      recipe.ingredients = ingredientsResult.rows || [];

      recipe.nutrition = {
        calories: recipe.calories || 'N/A',
        protein: recipe.protein || 'N/A',
        carbs: recipe.carbs || 'N/A',
        fat: recipe.fat || 'N/A',
      };
    }

    res.render('recipes', { recipes: recipesResult.rows, categories });
  } catch (err) {
    console.error('Error fetching recipes:', err);
    res.status(500).send('Error fetching recipes.');
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
