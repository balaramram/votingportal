import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FaceScanner from '../components/FaceScanner';
import * as faceapi from 'face-api.js'; // Comparison-ku thevai

const Login = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [dbFaceData, setDbFaceData] = useState(null); // Database-la irundhu vara face data
  const [isFaceStep, setIsFaceStep] = useState(false); // Face scan step-ah nu check panna
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleOnChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Password Verification
// Step 1: Initial Login
const handleInitialLogin = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/auth/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    console.log("Full Backend Response:", data);
    if (!res.ok) throw new Error(data.message || "Login Failed");

    // ✨ CHECK: Backend-la 'token' nu tharaangala nu paarunga
    if (data.token) {
      localStorage.setItem("tempToken", data.token);
      setDbFaceData(data.faceData);
      setIsFaceStep(true);
      setMessage("Password Verified! Now please scan your face.");
    } else {
      throw new Error("Token not received from server");
    }

  } catch (error) {
    setMessage(error.message);
  }
};

const handleFaceVerify = async (liveFaceDataString) => {
  try {
    const liveDescriptor = new Float32Array(JSON.parse(liveFaceDataString));
    const originalDescriptor = new Float32Array(JSON.parse(dbFaceData));
    const distance = faceapi.euclideanDistance(originalDescriptor, liveDescriptor);
    
    console.log("Face Distance:", distance); // Debug panna

    if (distance < 0.6) { // Match aachuna mattumae ulla povanum
      const token = localStorage.getItem("tempToken");
      
      if (token) {
        localStorage.setItem("token", token);
        localStorage.removeItem("tempToken");
        
        setIsAuthenticated(true); // <--- Inga dhaan idhu irukkanum
        setMessage("Face Verified! Access Granted ✅");

        () => navigate("/voteing-page")
      }
    } else {
      // ❌ Match aagala na error sollanum, Authenticated true panna koodadhu
      setIsAuthenticated(false); 
      setMessage("Face mismatch! Refresh and Try again");
      localStorage.removeItem("tempToken"); // Security-kaga temp token-ai azhiykavum
    }
  } catch (err) {
    setMessage("Error during face verification");
  }
};

  return (
    <div className="flex justify-center items-center bg-lightest min-h-screen overflow-hidden">
      <div className="flex flex-col gap-5 h-max rounded-2xl md:shadow-2xl p-5 md:p-15">
        <h2 className="text-2xl font-bold text-center text-darkest">Voter Login</h2>
        
        {isFaceStep ? (
          // Face Scan Step
          <div className="flex flex-col">
            <FaceScanner onFaceScanned={handleFaceVerify} />
            <button onClick={() => setIsFaceStep(false)} className="text-sm text-gray-500 hover:underline">Back to Password</button>
          </div>
         
        ) : (
          
           // Password Form
          <div className="flex flex-col items-center justify-center gap-5 md:max-w-md rounded-2xl md:w-md">
            <div className="w-full">
              <label htmlFor="user-email" className="text-sm lg:text-base font-semibold mb-1 text-dark">Email balaram1327r@gmail.com</label>
              <input 
                onChange={handleOnChange}
                className="outline-none border border-light text-dark w-full p-3 rounded-lg "
                placeholder="Email"
                name="email"
                autoComplete="email"
                id="user-email"
                value={formData.email} />
            </div>
            <div className="w-full">
              <label htmlFor="user-password" className="text-sm lg:text-base font-semibold mb-1 text-dark">Password 12345</label>
              <input 
                onChange={handleOnChange} 
                className="outline-none border border-light text-dark w-full p-3 rounded-lg" 
                type="password" 
                placeholder="Password" 
                name="password" 
                autoComplete="new-password"
                id="user-password"
                value={formData.password} />
            </div>
            <button onClick={handleInitialLogin} className="bg-dark text-white w-full py-2 hover:bg-darkest duration-700">Next Step</button>
            <div>
              <p className="text-xs text-center pt-2">New User?<span className="font-bold text-dark cursor-pointer" onClick={()=>navigate("/register")}>Register</span></p>
            </div>
          </div>
        )}

        <p className={`text-center font-medium h-6 ${message.includes("✅") ? "text-green-600" : "text-red-500"}`}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default Login;