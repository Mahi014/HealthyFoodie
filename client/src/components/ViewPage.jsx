import React, { useEffect, useState } from "react";
import Card from "./Card";
import { useNavigate } from "react-router-dom";

function ViewPage() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);

   useEffect(() => {
      fetch("http://localhost:5000/auth/status", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          if (!data.authenticated) {
            navigate("/");
          }
        });
    }, [navigate]);

  useEffect(() => {
    const fetchRecipes = async () => {
      const res = await fetch("http://localhost:5000/recipes");
      const data = await res.json();
      setRecipes(data);
    };
    fetchRecipes();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-500 text-white p-4 text-2xl font-bold sticky top-0 shadow">HealthyFoodie</header>
      <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((r) => (
          <Card key={r.id} recipe={r} />
        ))}
      </div>
    </div>
  );
}

export default ViewPage;
