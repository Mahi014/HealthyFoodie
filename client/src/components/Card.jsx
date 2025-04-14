import React from "react";

function Card({ recipe }) {
  return (
    <div className="border rounded-lg shadow p-4 bg-white">
      <h2 className="text-xl font-semibold">{recipe.title}</h2>
      <p className="text-gray-600">{recipe.description}</p>
      <p className="text-sm mt-2 text-gray-400">Seller: {recipe.seller_username}</p>
    </div>
  );
}

export default Card;
