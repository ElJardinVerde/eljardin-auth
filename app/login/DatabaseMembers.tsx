import React, { useEffect, useState } from "react";
import { fetchMemberCount } from "../api/firebaseConfig"; 

const MemberCountDisplay = () => {
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    const getMemberCount = async () => {
      const count = await fetchMemberCount();
      setMemberCount(count);
    };
    getMemberCount();
  }, []);

  return (
    <div className="flex justify-center items-center mt-6">
      <div className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold">El Jardin Verde Members</h2>
        <p className="text-4xl font-extrabold mt-4">{memberCount}</p>
        <p className="text-lg mt-2">total members registered</p>
      </div>
    </div>
  );
};

export default MemberCountDisplay;
