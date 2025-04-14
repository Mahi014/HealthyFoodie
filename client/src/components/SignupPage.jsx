import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Signup successful. You can now log in.");
      navigate("/");
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold mb-4">HealthyFoodie</h1>
      <input className="border p-2" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input className="border p-2" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <select className="border p-2" onChange={(e) => setRole(e.target.value)} value={role}>
        <option value="customer">Customer</option>
        <option value="seller">Seller</option>
      </select>
      <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleSubmit}>Signup</button>
      <p className="text-sm mt-2">
        Already have an account?{" "}
        <span className="text-blue-600 cursor-pointer" onClick={() => navigate("/")}>Login</span>
      </p>
    </div>
  );
}

export default SignupPage;
