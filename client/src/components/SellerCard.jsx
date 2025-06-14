import React from "react";

function SellerCard({ recipe, onDelete }) {
  const disease = recipe.disease?.trim().toLowerCase();
  const isHealthy = disease === "healthy";

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      onDelete(recipe.id);
    }
  };

  return (
    <div className="border rounded-lg shadow p-4 bg-white relative">
      <h2 className="text-xl font-semibold">{recipe.title}</h2>
      <p className="text-gray-600">{recipe.description}</p>
      <p className="text-sm mt-2 text-gray-400">
        You ({recipe.seller_username})
      </p>

      <div className="mt-3">
        <h3 className="font-medium text-gray-700">Ingredients:</h3>
        <ul className="list-disc list-inside text-sm text-gray-600">
          {recipe.ingredients?.map((ing, index) => (
            <li key={index}>
              {ing.name} - {ing.measurement}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <span className="font-semibold text-sm">
          Disease Risk:{" "}
          <span className={isHealthy ? "text-green-600" : "text-red-600"}>
            {recipe.disease || "Unknown"}
          </span>
        </span>
      </div>

      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded"
      >
        Delete
      </button>
    </div>
  );
}

export default SellerCard;
