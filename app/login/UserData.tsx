import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, FlagIcon, SquareUserRound , MapPinIcon, UserIcon, CalendarDaysIcon, CalendarCheckIcon } from 'lucide-react';

interface UserData {
  club?: string;
  country?: string;
  dob?: string;
  placeOfBirth?: string;
  membershipType?: string;
  membershipActivationDate?: string;
  membershipExpirationDate?: string;
}

interface UserInfoCardProps {
  userData: UserData;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ userData }) => {
  const infoItems = [
    { icon: <UserIcon className="w-5 h-5" />, label: "Club", value: userData.club },
    { icon: <FlagIcon className="w-5 h-5" />, label: "Country", value: userData.country },
    { icon: <CalendarIcon className="w-5 h-5" />, label: "Date of Birth", value: userData.dob },
    { icon: <MapPinIcon className="w-5 h-5" />, label: "Place of Birth", value: userData.placeOfBirth },
  ];

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
        <CardTitle className="text-2xl font-bold">Member Information</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {infoItems.map((item, index) => (
            <div key={index} className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-4">
                {item.icon}
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                <p className="font-medium">{item.value || 'N/A'}</p>
              </div>
            </div>
          ))}
          <Separator className="my-6" />
          <div>
            <h4 className="text-xl font-semibold mb-4">Membership Details</h4>
            <Badge variant="secondary" className="mb-4 text-lg py-1 px-3">
              {userData.membershipType || 'N/A'}
            </Badge>
            <div className="space-y-2">
              <div className="flex items-center">
                <CalendarDaysIcon className="w-5 h-5 mr-2 text-green-500" />
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Activation:</span>
                <span className="font-medium">{userData.membershipActivationDate || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <CalendarCheckIcon className="w-5 h-5 mr-2 text-red-500" />
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Expiration:</span>
                <span className="font-medium">{userData.membershipExpirationDate || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInfoCard;