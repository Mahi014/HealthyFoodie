import React from "react";

function SellerCard({ recipe }) {
  const disease = recipe.disease?.trim().toLowerCase();
  const isHealthy = disease === "healthy";

  return (
    <div className="border rounded-lg shadow p-4 bg-white">
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
    </div>
  );
}

export default SellerCard;
