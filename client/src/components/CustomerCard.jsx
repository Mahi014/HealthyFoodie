import React from "react";

function CustomerCard({ recipe }) {
  const disease = recipe.disease?.trim().toLowerCase();
  const isHealthy = disease === "healthy";

  return (
    <div className="border rounded-lg shadow p-4 bg-white">
      <h2 className="text-xl font-semibold">{recipe.title}</h2>
      <p className="text-gray-600">{recipe.description}</p>
      <p className="text-sm mt-2 text-gray-400">Seller: {recipe.seller_username}</p>

      <div className="mt-4">
        <span className="font-semibold text-sm">
          Disease Risk:{" "}
          <span className={isHealthy ? "text-green-600" : "text-red-600"}>
            {recipe.disease || "Unknown"}
          </span>
        </span>
      </div>
    </div>
  );
}

export default CustomerCard;
