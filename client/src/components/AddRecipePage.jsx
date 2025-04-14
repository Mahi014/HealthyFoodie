import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AddRecipePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/auth/status", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated || data.user.role !== "seller") {
          navigate("/");
        }
      });
  }, [navigate]);

  const handleAdd = async () => {
    const res = await fetch("http://localhost:5000/recipes/add", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Recipe added!");
      setTitle("");
      setDescription("");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-3xl font-bold mb-4">HealthyFoodie</h1>
      <input
        className="border p-2 w-full max-w-md"
        placeholder="Recipe Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="border p-2 w-full max-w-md"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex gap-4">
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded"
          onClick={handleAdd}
        >
          Add Recipe
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => navigate("/view")}
        >
          Go to View Page
        </button>
      </div>
    </div>
  );
}

export default AddRecipePage;
