import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ResultPage = () => {
  const { pollId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
        const res = await fetch(`https://votingportal-backend.onrender.com/api/voting/results/${pollId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        const result = await res.json();
        if (result.success) {
          setData(result);
        } else {
          setError(result.message || "Failed to fetch results");
        }
      } catch (err) {
        setError("Network error. Check if backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [pollId]);

  if (loading) return <div className="p-10 font-bold">Loading results...</div>;
  if (error) return <div className="p-10 text-red-500 font-bold">{error}</div>;

  // Total votes calculation - poll.votes illana 0 nu eduthukkum
  const totalVotes = data?.poll?.votes?.length || 0;

  return (
    <div className="w-ful bg-lightest py-10">
      <div className="max-w-3xl mx-auto p-10 bg-lightest shadow-2xl rounded-3xl">
      <h1 className="text-3xl font-black mb-8 border-b pb-4 text-darkest">
        {data?.poll?.title} Results
      </h1>

      {data?.results && data.results.length > 0 ? (
        data.results.map((res, i) => {
          const percentage = totalVotes > 0 ? ((res.votes / totalVotes) * 100).toFixed(1) : 0;
          return (
            <div key={i} className="mb-6">
              <div className="flex justify-between font-bold mb-2 text-lg">
                <span className="capitalize text-dark">{res.option}</span>
                <span className="text-dark">{res.votes} Votes ({percentage}%)</span>
              </div>
              <div className="w-full bg-lightest h-3 rounded-full overflow-hidden border border-light">
                <div 
                  className="bg-light h-full transition-all duration-1000 ease-out"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="py-10 text-center text-gray-500 italic">
          No votes have been cast for this poll yet.
        </div>
      )}

      <button 
        onClick={() => navigate(-1)}
        className="mt-10 w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all"
      >
        Back to Dashboard
      </button>
    </div>
    </div>
    
  );
};

export default ResultPage;