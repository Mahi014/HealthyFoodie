import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddRecipePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState([{ name: "", measurement: "" }]);
  const navigate = useNavigate();

  const handleAdd = async () => {
    const res = await fetch("http://localhost:5000/recipes/add", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, ingredients }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Recipe added!");
      setTitle("");
      setDescription("");
      setIngredients([{ name: "", measurement: "" }]);
    } else {
      alert(data.error || "Failed to add recipe");
    }
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const addIngredientField = () => {
    setIngredients([...ingredients, { name: "", measurement: "" }]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center gap-4 p-4 bg-gray-50">
      <h1 className="text-3xl font-bold mb-4 text-purple-700">HealthyFoodie</h1>

      <input
        className="border p-2 w-full max-w-md rounded"
        placeholder="Recipe Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="border p-2 w-full max-w-md rounded"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="bg-white border p-4 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2 text-gray-700">How to Enter Measurements</h2>
        <p className="text-sm text-gray-600">
          Please specify quantity and unit for each ingredient. Supported units:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 my-2">
          <li><strong>g</strong> – gram (e.g., Rice: <em>100g</em>)</li>
          <li><strong>kg</strong> – kilogram (e.g., Chicken: <em>1kg</em>)</li>
          <li><strong>ml</strong> – milliliter (e.g., Milk: <em>200ml</em>)</li>
          <li><strong>l</strong> – liter (e.g., Water: <em>1l</em>)</li>
          <li><strong>tsp</strong> – teaspoon (e.g., Salt: <em>1tsp</em>)</li>
          <li><strong>tbsp</strong> – tablespoon (e.g., Oil: <em>2tbsp</em>)</li>
          <li><strong>cup</strong> – measuring cup (e.g., Oats: <em>1 cup</em>)</li>
        </ul>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mt-6">Ingredients</h2>
      {ingredients.map((ingredient, index) => (
        <div key={index} className="flex gap-2 w-full max-w-md">
          <input
            className="border p-2 flex-1 rounded"
            placeholder="Name (e.g., Rice)"
            value={ingredient.name}
            onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
          />
          <input
            className="border p-2 flex-1 rounded"
            placeholder="Measurement (e.g., 100g)"
            value={ingredient.measurement}
            onChange={(e) => handleIngredientChange(index, "measurement", e.target.value)}
          />
        </div>
      ))}
      <button
        className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition"
        onClick={addIngredientField}
      >
        + Add Ingredient
      </button>

      <div className="flex gap-4 mt-6">
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          onClick={handleAdd}
        >
          Add Recipe
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => navigate("/selview")}
        >
          Go to View Page
        </button>
      </div>
    </div>
  );
}

export default AddRecipePage;
