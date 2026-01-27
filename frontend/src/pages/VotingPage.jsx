import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sounds } from "../utils/soundUtils";
import vote_successful from "../assets/audio/vote successfull.mp3"
import vote_unsuccessfull from "../assets/audio/vote unsuccessfull.mp3"

const VotingPage = () => {
  const [polls, setPolls] = useState([]);
  const [selectedOption, setSelectedOption] = useState({});
  const [loading, setLoading] = useState(true);
  const [isCastOpen , setIsCastOpen] = useState(false);
  const [message , setMessage] = useState("")
  const navigate = useNavigate();
  const success = new Audio(vote_successful);
  const unsuccess = new Audio(vote_unsuccessfull);

  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");
  const userDoB = localStorage.getItem("dob");

  useEffect(() => {
    
    fetchPolls();
  }, []);

  
  const fetchPolls = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`https://votingportal-v8js.onrender.com/api/voting`, {
        method: "GET", 
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      const data = await res.json();
      if (data.success) {
        setPolls(data.polls || []);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  
  const handleVote = async (id) => { 
    const option = selectedOption[id];
    if (!option) return alert("Please select a candidate first!");

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("https://votingportal-v8js.onrender.com/api/voting/vote", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ pollId: id, option }),
      });

      const data = await res.json();
      if (res.ok) {
        success.play();
        alert("Your vote has been recorded! ✅");
        window.location.reload(); 
      } else {
        unsuccess.play();
        alert(data.message || "Vote failed");
      }
    } catch (err) {
      sounds.playError
      alert("Something went wrong!");
    }
  };

  const handleCastVote = (poll) => {

    if (selectedOption[poll._id]){
      
      setIsCastOpen(true)
      setMessage("")
    }else{
      setMessage("Please select a candidate before casting your vote!");
    }
  }



  if (loading) return <div className="text-center py-20 text-white font-bold">Loading...</div>;

  return (
    <div className="min-h-screen bg-lightest py-10 px-5">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-center text-white tracking-widest uppercase italic">
            <span className="text-indigo-500">Digital</span> Ballot
          </h1>

          <button onClick={()=>{localStorage.removeItem("token");window.location.href = "/login";}} className="border bg-dark text-white font-semibold h-full py-1 px-5 hover:bg-black duration-500">Logout</button>
        </div>
        

        {polls.length > 0 ? (
          polls.map((poll) => (
            <div key={poll._id}>
              {isCastOpen ?
              <div className="bg-lightest py-8 rounded-3xl mb-8 shadow-2xl">
                <div className="flex justify-evenly bg-light py-4">
                  <p className="font-bold">Voter Details</p>
                  <button onClick={()=>{setIsCastOpen(false)}} className="border-2 font-semibold border-black px-2 hover:border-white hover:text-white duration-500">Cancel</button>
                </div>
                
                <div className="flex flex-col gap-3 justify-center items-center mt-15">
                  <div className="flex border-2 border-dark gap-2 rounded-md w-max p-5 font-semibold">
                    <div className="text-center">
                      <p className="text-darkest tracking-[1.5px] ">User Name :</p>
                      <p className="tracking-widest">User Email :</p>
                      <p className="tracking-[0.1px]">Date of Birth :</p>
                    </div>

                    <div className="text-dark">
                      <p>{userName}</p>
                      <p>{userEmail}</p>
                      <p>{userDoB}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-dark font-semibold">You are selected <span className="underline underline-offset-2">{selectedOption[poll._id]}</span> as the candidate </p>
                  </div>
                  <button onClick={()=>{handleVote(poll._id)}} className=" text-white bg-dark hover:bg-black w-[30%] py-2">Vote to {selectedOption[poll._id]}</button>
                </div>
              </div> 
              :
              <div className="bg-lightest p-8 rounded-3xl mb-8 shadow-2xl">
                 <div className="flex justify-between items-center h-20">
                   <h2 className="text-2xl font-bold text-darkest">{poll.title}</h2>
           
                   <button 
                     onClick={() => navigate(`/result-page/${poll._id}`)} 
                     className="text-darkest font-bold cursor-pointer px-3 py-1 text-center border text-sm hover:text-xs duration-400 transition-all"
                   >
                     View Result
                   </button>
                 </div>
                 
                 <div className="space-y-4 mb-8">
                   {poll.options && poll.options.map((opt, index) => (
                     <button 
                       key={index}
                       onClick={() => setSelectedOption({ ...selectedOption, [poll._id]: opt })}
                       className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                         selectedOption[poll._id] === opt 
                         ? "border-darkest bg-ligh text-dark font-bold" 
                         : "border-light bg- text-dark font-semibold"
                       }`}
                     >
                       {opt}
                     </button>
                   ))}
                 </div>
   
                 <button
                   onClick={()=>{handleCastVote(poll)}}
                
                   className="w-full bg-dark text-white py-4 rounded-xl font-black hover:bg-black transition-all duration-500 tracking-widest"
                 >
                   CAST VOTE
                 </button>
                 <p className="h-7 text-red-500 text-center mt-3">{message}</p>
              </div>}

            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-500">No active polls found.</div>
        )}
      </div>
    </div>
  );
};

export default VotingPage;