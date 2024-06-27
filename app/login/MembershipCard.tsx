import React from 'react';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

interface MembershipCardProps {
  userData: UserData;
}

const MembershipCard: React.FC<MembershipCardProps> = ({ userData }) => {
  if (!userData) {
    return null;
  }

  return (
    <div className="w-96 h-56 bg-gradient-to-r from-green-500 to-yellow-400 rounded-xl shadow-2xl overflow-hidden relative text-white">
      <div className="absolute top-4 left-4">
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 10H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <p className="text-lg font-semibold">{userData.firstName} {userData.lastName}</p>
        <p className="text-sm opacity-75">{userData.email}</p>
      </div>
      <div className="absolute top-4 right-4 text-sm opacity-75">
        El Jardin Verde
      </div>
      <div className="absolute bottom-20 left-4 right-4 flex items-center">
        <p className="text-sm opacity-75">Member since 2024</p>
      </div>
      <div className="absolute top-20 left-4 right-4">
        <div className="flex justify-between items-center">
          <div className="w-24 h-8 bg-white bg-opacity-25 rounded-lg flex items-center justify-center">
            <p className="text-xs font-semibold">MEMBER ID</p>
          </div>
          <div className="text-xs opacity-75">#12412</div>
        </div>
      </div>
    </div>
  );
};

export default MembershipCard;
