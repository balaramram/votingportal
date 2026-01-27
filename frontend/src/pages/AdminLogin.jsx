import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const AdminLogin = ({setIsAdminAuthenticated}) => {

  const [formData,setFormData] = useState({email:"",password:""});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleOnChange = (e) => {
    setFormData({...formData,[e.target.name]:e.target.value});
  }

const handlelogin = async () => {
  try {
    const res = await fetch("https://votingportal-v8js.onrender.com/api/auth/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    console.log("SERVER RESPONSE:", data);

    if (res.ok && data.token) {
      // 1. Token-ai save panrom
      localStorage.setItem("adminToken", data.token);

      // 2. Token-ai decode panni ID-ai edukkurom
      const decoded = jwtDecode(data.token);
      console.log("Decoded Token:", decoded);

      // Unga token-la 'id' nu key irukku (Log-la paarthen)
      const adminId = decoded.id; 

      if (adminId) {
        localStorage.setItem("adminId", adminId);
        setIsAdminAuthenticated(true)
        navigate("/admin-dashBoard");
      } else {
        alert("Admin ID missing in token!");
      }
    } else {
      setMessage(data.message || "Login Failed");
    }
  } catch (error) {
    console.error("Login Error:", error);
    setMessage("Something went wrong!");
  }
};

  
  return (
    <div className="flex justify-center items-center h-screen w-full">
      <div className="w-md border p-10 rounded-2xl">
        <p className="text-center text-2xl font-bold text-green-500 pb-3">Admin Login</p>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="font-semibold">Admin UserName</label>
            <p>admin@Ariram2004</p>
            <input placeholder="UserName" className="outline-none border rounded-md px-1 py-2" name="email" value={formData.email} onChange={handleOnChange} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold">Password</label>
            <p>Ariram@EEEadmin</p>
            <input placeholder="Password" className="outline-none border rounded-md px-1 py-2" type="password" name="password" value={formData.password} onChange={handleOnChange} />
          </div>
        </div>

        <button onClick={handlelogin} className="bg-indigo-600 text-white font-bold w-full rounded-lg my-5 py-2 ">Login</button>

        <p className="text-red-500">{message}</p>
      </div>
    </div>
  )
}

export default AdminLogin