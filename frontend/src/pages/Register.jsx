import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import FaceScanner from '../components/FaceScanner'; // FaceScanner import panrom

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    dob:""
  });
  
  const [faceData, setFaceData] = useState(""); // Face data store panna oru state
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState({face:false , finger:false});
  const [otpSent, setOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleOnChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {

    const age = Math.floor((new Date() - new Date(formData.dob)) / 31557600000);

    if(formData.email.trim() === "" || formData.password.trim() === "" || !formData.dob){
      return setMessage("All fields are required!")
    }
    else if(age<18){
      return setMessage("You are below 18")
    }
    else if (!isEmailVerified) {
      return setMessage("Please verify your email first!");
    }
    else if (!faceData) {
       return setMessage("Please scan your face before registering!");
    }
    

  try {
    const payload = { ...formData, faceData };

    // 1. URL-ai registration endpoint-ku maathunga (Ex: /api/auth/register)
    // 2. Data anuppa method kandippa "POST"-ah irukkanum
    const res = await fetch(`https://votingportal-backend.onrender.com/api/user/register`, {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }
    localStorage.setItem("userName",formData.name);
    localStorage.setItem("userEmail", formData.email);
    localStorage.setItem("dob",formData.dob);
    // Success aana mattumae clear pannanum
    alert("Registration Successful! Now you can Login.");
    setFormData({ name: "", email: "", password: "" });
    setFaceData(""); 
    
    // Registration-ku appo direct-ah voting page poga koodaadhu
    // Login panni face-ai verify panna dhaan voting access kidaikkanum
    navigate("/login"); 

  } catch (error) {
    setMessage("Something went wrong.User already present.");
    console.error("DEBUGGER ERROR:",error)
  }
};

// 1. Send OTP Request
const handleSendOTP = async () => {
  if (!formData.email) return alert("Please enter email first!");
  setLoading(true);
  try {
    const res = await fetch('https://votingportal-backend.onrender.com/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.email }),
      credentials: "include"
    });
    const data = await res.json();
    if (res.ok) {
      setOtpSent(true);
      alert("OTP sent to your email! ✅");
    } else {
      alert(data.error || "Failed to send OTP");
    }
  } catch (err) {
    alert("Server error! Check if backend is running.");
  } finally {
    setLoading(false);
  }
};

// 2. Verify OTP Request
const handleVerifyOTP = async () => {
  try {
    const res = await fetch('https://votingportal-backend.onrender.com/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.email, otp: otpInput })
    });
    if (res.ok) {
      setIsEmailVerified(true);
      setOtpSent(false); // Box-ai hide panna
      alert("Email Verified! ⭐");
    } else {
      alert("Invalid OTP! ❌");
    }
  } catch (err) {
    alert("Verification failed!");
  }
};

  return (
    <div className=" bg-lightest">
      <div className="flex flex-col justify-center lg:p-10 min-h-screen">
        <div className="flex flex-col-reverse items-center md:static md:grid grid-cols-2 h-[90%] justify-items-center">
          <div className="order-1 md:order-0 w-[90%] xl:w-[70%] h-full flex justify-center items-center bg-lightest rounded-4xl shadow-xl p-5">
            <div className="flex flex-col items-center w-full">
              <div className="">
                <p className="text-darkest underline underline-offset-2 font-bold text-xl xl:text-2xl text-center ">Register</p>
              </div>

              <div className="md:w-[70%]">
                <div className="flex flex-col gap-1 pt-3">
                  <label htmlFor="user_name" className="font-semibold text-dark text-sm">Username*</label>
                  <input placeholder="Username" 
                    className="outline-none border border-light p-2 rounded-xl text-dark text-sm"
                    id="user_name"
                    autoComplete="name"
                    name='name' 
                    value={formData.name} 
                    onChange={handleOnChange} 
                  />
                </div>

                <div className="flex flex-col gap-1 pt-2 text-sm">
                  <label htmlFor="user_email" className="font-semibold text-dark">Email*</label>
                  <div className="border border-light rounded-xl flex justify-between">
                    <input 
                      placeholder="Email"
                      id="user_email"
                      autoComplete="email"
                      className="outline-none p-2 text-dark w-full rounded-l-xl"
                      name="email"
                      value={formData.email}
                      onChange={handleOnChange}
                      disabled={isEmailVerified}
                    />
                    {!isEmailVerified && (
                      <button 
                        className="bg-dark w-[30%] rounded-r-xl text-white hover:bg-darkest duration-700"
                        onClick={handleSendOTP}
                        disabled={loading}>
                          {loading ? "..." : otpSent ? "Resend" : "Verify"}
                      </button>
                    )}
                    {isEmailVerified && <span className="bg-dark rounded-r-xl text-white w-[30%] flex justify-center items-center">Verified</span>}
                  </div>
                  
                </div>

                <div className="flex flex-col gap-1 pt-2 text-sm">
                  <label htmlFor="user_dob" className="font-semibold text-dark">DoB*</label>
                  <input 
                    placeholder="Dob"
                    id="user_dob"
                    autoComplete="bday-day"
                    className="outline-none border border-light p-2 rounded-xl text-dark"
                    name="dob"
                    value={formData.dob}
                    onChange={handleOnChange}

                  />
                </div>

                <div className="flex flex-col gap-1 pt-2 text-sm">
                  <label htmlFor="user_password" className="font-semibold text-dark">Password*</label>
                  <input 
                    placeholder="Password"
                    id="user_password"
                    autoComplete="new-password"
                    className="outline-none border border-light p-2 rounded-xl text-dark"
                    name="password"
                    value={formData.password}
                    onChange={handleOnChange}
                  />
                </div>

                <div className="lg:flex justify-between py-4">
                  <div className="flex items-center">
                    <input
                      id="user_face"
                      autoComplete="off"
                      className="text-light" 
                      type="checkbox"
                      onClick={()=>setIsOpen((prev)=>({...prev,face:!prev.face}))} 
                      />
                    <label htmlFor="user_face" className="text-dark text-xs">Face Verification*</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="user_fingerprint"
                      autoComplete="off"
                      className="text-light"
                      type="checkbox"
                      onClick={()=>setIsOpen((prev)=>({...prev,finger:!prev.finger}))} 
                      />
                    <label htmlFor="user_fingerprint" className="text-dark text-xs">Fingerprint Verification*</label>
                  </div>
                  
                </div>

                <div>
                  <button onClick={handleSubmit} className="bg-dark text-white w-full py-2 hover:bg-darkest duration-700">Register</button>
                </div>

                <div>
                  <p className="text-xs text-center pt-2">Already Registered ? <span className="font-bold text-dark cursor-pointer" onClick={()=>navigate("/login")}>Login</span></p>
                </div>
              </div>

              <div>
                <p className="text-red-600 text-sm pt-2">{message}</p>
              </div>
              
            </div>
          </div>
          
          <div className="block md:hidden order-2 md:order-0">
            {otpSent && !isEmailVerified ?
              <div className="mt-3 p-4 bg-gray-50 border border-dashed border-dark/30 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-[10px] uppercase tracking-widest font-bold text-dark/60 mb-2">Enter 6-digit OTP</p>
                <div className="flex flex-col gap-2">
                  <input 
                     name="otp"
                     maxLength={6}
                     placeholder="000000"
                     className="flex-1 p-2 border border-light rounded-xl text-center font-mono text-lg tracking-[0.5em] outline-none focus:border-dark"
                     onChange={(e) => setOtpInput(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={handleVerifyOTP}
                    className="bg-green-600 text-white w-full py-2 rounded-xl font-bold hover:bg-green-700 active:scale-95 transition-all"
                  >
                   Check
                  </button>
                </div>
              </div> :
            <div>
              {isOpen.face && !faceData ?
                <div>
                  <FaceScanner onFaceScanned={(data) => setFaceData(data)} />
                </div>
                :<div></div>
              }
            </div>}
          </div>
          
          
          <div className="hidden md:block">
            <div>
              {otpSent && !isEmailVerified ?
              <div className="mt-3 p-4 bg-gray-50 border border-dashed border-dark/30 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-[10px] uppercase tracking-widest font-bold text-dark/60 mb-2">Enter 6-digit OTP</p>
                <div className="flex gap-2">
                  <input 
                     name="otp"
                     maxLength={6}
                     placeholder="000000"
                     className="flex-1 p-2 border border-light rounded-xl text-center font-mono text-lg tracking-[0.5em] outline-none focus:border-dark"
                     onChange={(e) => setOtpInput(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={handleVerifyOTP}
                    className="bg-green-600 text-white px-5 rounded-xl font-bold hover:bg-green-700 active:scale-95 transition-all"
                  >
                   Check
                  </button>
                </div>
              </div> :
                <div className="flex flex-col justify-center items-center border-l border-light w-full px-5 xl:p-10">
                  {!isOpen.face || faceData ?
                    <div className="">
                      <div className="text-center">
                        <p className="text-darkest font-bold text-xl xl:text-2xl">Next-Generation AI Voting Portal</p>
                        <p className="text-lightest tracking-widest text-sm underline pt-1">Ensuring a Fair, Secure, and Transparent 
                          Digital Election.</p>
                      </div>
  
                      <div className="xl:py-5">
                        <h3 className="text-darkest font-bold xl:text-xl  underline">Project Objective</h3>
                        <p className="text-dark text-xs lg:text-sm py-3">Traditional voting methods often face challenges like manual errors and identity fraud. Our mission is to 
                          provide a digital alternative that uses Artificial Intelligence to make every vote count with 100% accuracy.
                        </p>
  
                        <h3 className="text-darkest font-bold xl:text-xl underline">Key Functional Highlights</h3>
                        <ul className="flex flex-col gap-2 text-dark pt-3 text-xs lg:text-sm">
                          <li>1.Face-Match Authentication: Advanced facial recognition technology identifies the voter instantly, 
                            preventing any unauthorized person from accessing the ballot.
                          </li>

                          <li>2.Tamper-Proof Voting: Every cast vote is encrypted, ensuring that the data remains confidential and cannot 
                              be altered by anyone.
                          </li>
  
                          <li>3.Automated Result Generation: Eliminates the wait time for results with real-time data processing and 
                            instant visualization for administrators.
                          </li>
  
                          <li>4.User-Centric Design: A simplified interface designed for easy navigation, making the voting process 
                            accessible for everyone.
                          </li>
                        </ul>
  
                      </div>
                    </div>
                  :
                  <div>
                    <FaceScanner onFaceScanned={(data) => setFaceData(data)} />
                  </div>
                  }
                </div>
              }
            </div>
          </div>
          
          

        </div>
      </div>
    </div>
    // <div className=''>
    //   <div className='relative flex justify-center mt-10 mb-10 w-full'>
    //     <div className='flex flex-col gap-5 border w-md p-8 shadow-lg rounded-2xl bg-white mt-20'>
    //       <h2 className='text-2xl font-bold text-center text-indigo-700'>Voter Registration</h2>
          
    //       <div className="flex flex-col gap-4">
    //         <div>
    //           <p className='text-sm font-semibold mb-1'>Username</p>
    //           <input 
    //           className="w-full outline-none border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" 
    //           name='name' 
    //           placeholder="Full Name" 
    //           value={formData.name} 
    //           onChange={handleOnChange} 
    //           />
    //         </div>
             
    //         <div>
    //           <p className='text-sm font-semibold mb-1'>Email</p>
    //           <input 
    //           className="w-full outline-none border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" 
    //           name='email' 
    //           placeholder="Email Address" 
    //           value={formData.email} 
    //           onChange={handleOnChange} 
    //           />
    //         </div>
            
    //         <div>
    //           <p className='text-sm font-semibold mb-1'>Password</p>
    //           <input 
    //           className="w-full outline-none border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" 
    //           name='password' 
    //           type='password' 
    //           placeholder="Password" 
    //           value={formData.password} 
    //           onChange={handleOnChange} 
    //           />
    //         </div>
    //       </div>
          
    //       <div>
    //         <p className='text-red-500 text-sm text-center font-medium'>{message}</p>
    //       </div>
          
    //       <div className="flex justify-evenly">
    //         <button onClick={()=>setIsOpen((prev)=>({...prev,face:!prev.face}))} className={ `py-1 px-2 rounded-lg font-bold text-white transition ${faceData ? " bg-indigo-600 cursor-not-allow" : "bg-gray-400 cursor-pointer"}`}>Face verification</button>
    //         <button onClick={()=>setIsOpen((prev)=>({...prev,finger:!prev.finger}))} className={ `py-1 px-2 rounded-lg font-bold text-white transition ${faceData ? " bg-indigo-600 cursor-not-allow" : "bg-gray-400 cursor-pointer"}`}>fingerprint verification</button>
    //       </div>
          
    //       <button onClick={handleSubmit} className={`py-3 rounded-lg font-bold text-white transition ${faceData ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}>
    //         Complete Registration
    //       </button>
    //     </div>
        
    //     <hr className='my-2'/>
        
    //     {/* Face Scanner Component Integration */}
    //     {isOpen.face && !faceData?(
    //       <div className="absolute inset-0 left-100 bg-slate-50 p-3 rounded-xl border border-dashed border-indigo-300 w-max h-165">
    //       <div className="flex justify-between p-5">
    //         <p className="text-sm font-bold text-center mb-2">Identity Verification (Face Scan)</p>
    //         <button onClick={()=>setIsOpen((prev)=>({...prev,face:!prev.face}))} className="px-2 rounded-full transition duration-700 hover:border">X</button>
    //       </div>
          
    //       <FaceScanner onFaceScanned={(data) => setFaceData(data)} />
    //       {faceData && <p className='text-green-600 text-xs text-center mt-2 font-bold'>✅ Face Pattern Captured</p>}
    //     </div>
    //     ):""}
     
    //   </div>
      
    // </div>
  )
}

export default Register;