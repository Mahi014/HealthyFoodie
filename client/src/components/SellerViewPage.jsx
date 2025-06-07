import React, { useEffect, useState } from "react";
import SelCard from "./SellerCard";
import { useNavigate } from "react-router-dom";

function SellerViewPage() {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [username, setUsername] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [diseaseFilter, setDiseaseFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("http://localhost:5000/auth/status", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.authenticated) {
        setUsername(data.user.username);
      }
    };

    const fetchRecipes = async () => {
      const res = await fetch("http://localhost:5000/recipes/seller", {
        credentials: "include",
      });
      const data = await res.json();
      setRecipes(data);
      setFilteredRecipes(data);
    };

    fetchUser();
    fetchRecipes();
  }, [navigate]);

  useEffect(() => {
    const filtered = recipes.filter((r) => {
      const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDisease =
        diseaseFilter === "All" || r.disease?.toLowerCase() === diseaseFilter.toLowerCase();
      return matchesSearch && matchesDisease;
    });
    setFilteredRecipes(filtered);
  }, [searchTerm, diseaseFilter, recipes]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center sticky top-0 shadow">
        <h1 className="text-2xl font-bold">HealthyFoodie</h1>
        <button
          className="bg-white text-blue-600 px-4 py-1 rounded font-semibold hover:bg-blue-100 transition"
          onClick={() => navigate("/add")}
        >
          + Add Recipe
        </button>
      </header>

      <div className="p-6 flex flex-col items-center">
        {username && (
          <div className="text-center text-2xl font-semibold text-gray-800 mb-8">
            Welcome back {username}! Here's what you're offering 🍲
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 w-full max-w-4xl">
          <input
            type="text"
            placeholder="Search your recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-2/3 px-4 py-2 border rounded shadow-sm"
          />

          <select
            value={diseaseFilter}
            onChange={(e) => setDiseaseFilter(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 border rounded shadow-sm"
          >
            <option value="All">All</option>
            <option value="Heart Disease">Heart Disease</option>
            <option value="Type 2 Diabetes">Type 2 Diabetes</option>
            <option value="Kidney Disease">Kidney Disease</option>
            <option value="Obesity">Obesity</option>
            <option value="Non-Alcoholic Fatty Liver Disease (NAFLD)">
              Non-Alcoholic Fatty Liver Disease (NAFLD)
            </option>
            <option value="Healthy">Healthy</option>
          </select>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
          {filteredRecipes.map((recipe) => (
            <SelCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SellerViewPage;
