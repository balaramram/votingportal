import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [polls, setPolls] = useState([]);
  const [newPoll, setNewPoll] = useState({ title: "", options: ["", ""], department: "all" });
  const navigate = useNavigate();

  useEffect(() => { fetchPolls(); }, []);

  const fetchPolls = async () => {
    try {
      const res = await fetch("https://votingportal-backend.onrender.com/api/voting", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` }
      });
      const data = await res.json();
      if (data.success) setPolls(data.polls);
    } catch (err) { console.error("Fetch Error:", err); }
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newPoll.options];
    updatedOptions[index] = value;
    setNewPoll({ ...newPoll, options: updatedOptions });
  };

  const addOptionField = () => {
    setNewPoll({ ...newPoll, options: [...newPoll.options, ""] });
  };

  const handleCreate = async () => {
    const token = localStorage.getItem("adminToken");
    const adminId = localStorage.getItem("adminId");
    const filteredOptions = newPoll.options.filter(opt => opt.trim() !== "");

    if (!newPoll.title || filteredOptions.length < 2) {
      return alert("Please enter a title and at least 2 candidates!");
    }

    const pollData = { ...newPoll, options: filteredOptions, createdBy: adminId };

    try {
      const res = await fetch("https://votingportal-backend.onrender.com/api/voting/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(pollData)
      });

      if (res.ok) {
        alert("Poll Created Successfully! 🚀");
        setNewPoll({ title: "", options: ["", ""], department: "all" });
        fetchPolls();
      } else {
        const errorData = await res.json();
        alert("Error: " + errorData.message);
      }
    } catch (err) { console.error(err); }
  };

  const handleDeletePoll = async (pollId) => {
    if (window.confirm("Are you sure you want to delete this poll? 🗑️")) {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`https://votingportal-backend.onrender.com/api/voting/delete-poll/${pollId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
          // alert("Poll deleted successfully!");
          setPolls(polls.filter(poll => poll._id !== pollId));
        } else {
          alert("Failed to delete poll.");
        }
      } catch (err) { console.error("Delete Error:", err); }
    }
  };

  return (
    <div className="p-10 bg-lightest min-h-screen">
      <h1 className="text-3xl font-black mb-10 text-center text-darkest tracking-widest uppercase italic">
        Admin <span className="text-dark">Control Center</span>
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
        
        {/* Create Poll Form */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl border-b-4 border-dark">
          <h2 className="text-xl font-bold mb-6 text-darkest">Create New Election</h2>
          
          <label className="block text-sm font-semibold text-dark mb-1">Election Title</label>
          <input 
            className="w-full border-2 border-lightest p-3 mb-6 rounded-xl focus:border-dark outline-none transition-all" 
            placeholder="e.g., CM Election 2026" 
            value={newPoll.title} 
            onChange={(e)=>setNewPoll({...newPoll, title:e.target.value})} 
          />

          <label className="block text-sm font-semibold text-dark mb-2">Candidates</label>
          {newPoll.options.map((opt, index) => (
            <input 
              key={index}
              className="w-full border-2 border-lightest p-3 mb-3 rounded-xl focus:border-dark outline-none transition-all" 
              placeholder={`Candidate ${index + 1}`} 
              value={opt} 
              onChange={(e) => handleOptionChange(index, e.target.value)}
            />
          ))}
          
          <button onClick={addOptionField} className="text-dark font-bold text-sm mb-6 hover:text-darkest">
            + Add Another Candidate
          </button>

          <button onClick={handleCreate} className="w-full bg-darkest text-white py-4 rounded-xl font-black text-lg hover:bg-dark transition shadow-lg">
            LAUNCH ELECTION
          </button>
        </div>

        {/* Live Status List */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl border-b-4 border-dark">
          <h2 className="text-xl font-bold mb-6 text-darkest">Live Status</h2>
          <div className="space-y-4">
            {polls.length > 0 ? polls.map(p => (
              <div key={p._id} className="p-4 border-2 border-lightest rounded-2xl flex flex-col gap-3 hover:border-dark transition shadow-sm">
                <span className="font-bold text-darkest text-lg">{p.title}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/result-page/${p._id}`)} 
                    className="flex-1 bg-lightest text-dark py-2 rounded-lg font-bold text-sm hover:bg-dark hover:text-white transition"
                  >
                    Results
                  </button>
                  <button 
                    onClick={() => handleDeletePoll(p._id)} // Fixed: p._id used instead of polls._id
                    className="flex-1 border-2 border-red-100 text-red-500 py-2 rounded-lg font-bold text-sm hover:bg-red-500 hover:text-white transition"
                  >
                    Delete 🗑️
                  </button>
                </div>
              </div>
            )) : <p className="text-gray-400 italic">No polls created yet.</p>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;