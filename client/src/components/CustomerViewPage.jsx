import React, { useEffect, useState } from "react";
import CustomerCard from "./CustomerCard";
import { useNavigate } from "react-router-dom";

function CustomerViewPage() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [username, setUsername] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [diseaseFilter, setDiseaseFilter] = useState("All");

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
      const res = await fetch("http://localhost:5000/recipes");
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
      <header className="bg-green-500 text-white p-4 text-2xl font-bold sticky top-0 shadow">
        HealthyFoodie
      </header>

      <div className="p-6 flex flex-col items-center">
        {username && (
          <div className="text-center text-2xl font-semibold text-gray-800 mb-8">
            Hello {username}, how's your day going? <br />
            Craving something healthy? 🥗
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 w-full max-w-4xl">
          <input
            type="text"
            placeholder="Search recipes..."
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
          {filteredRecipes.map((r) => (
            <CustomerCard key={r.id} recipe={r} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CustomerViewPage;
