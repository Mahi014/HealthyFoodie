import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) {
      if (data.user.role === "seller") {
        navigate("/add");
      } else {
        navigate("/view");
      }
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold mb-4">HealthyFoodie</h1>
      <input className="border p-2" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input className="border p-2" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSubmit}>Login</button>
      <p className="text-sm mt-2">Don't have an account? <span className="text-blue-600 cursor-pointer" onClick={() => navigate("/signup")}>Signup</span></p>
    </div>
  );
}

export default LoginPage;
