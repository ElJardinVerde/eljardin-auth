"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  getDocs,
  QuerySnapshot,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../api/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  CalendarIcon,
  Users,
  CreditCard,
  Search,
  ChevronLeft,
} from "lucide-react";
import { Snackbar } from "../components/Snackbar";

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  club?: string;
  country?: string;
  membershipType?: string;
  paymentMethod?: string;
  membershipActivationDate?: Timestamp;
  paymentIntentId?: string;
}

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center h-20">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
  </div>
);

const DatabaseView: React.FC = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedClub, setSelectedClub] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    if (currentUserEmail === "eljardinverde.clubsocial@yahoo.com") {
      const fetchClubUsers = async () => {
        setLoading(true);
        try {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("club", "==", "El Jardin Verde"));
          const snapshot = await getDocs(q);
          const userData = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as User)
          );
          setUsers(userData);
          setFilteredUsers(userData);
        } catch (error) {
          console.error("Error fetching users for El Jardin Verde:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchClubUsers();
    }
  }, [currentUserEmail]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const allowedEmails = [
          "iulianpampu@icloud.com",
          "alexnemes23@yahoo.com",
          "dahmadrian1@gmail.com",
          "gabiro_albu@yahoo.com",
          "eljardinverde.clubsocial@yahoo.com",
        ];
        setCurrentUserEmail(user.email || "");
        if (!allowedEmails.includes(user.email || "")) {
          router.push("/");
        } else if (user.email === "eljardinverde.clubsocial@yahoo.com") {
          fetchClubUsers();
        }
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);


  const fetchClubUsers = async (): Promise<void> => {
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("club", "==", "El Jardin Verde"));
      const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);
      const userData: User[] = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as User)
      );
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (error) {
      console.error("Error fetching users for El Jardin Verde:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Timestamp | undefined): string => {
    if (date && typeof date.toDate === "function") {
      return date.toDate().toLocaleDateString();
    }
    return "N/A";
  };

  const fetchUsersByPaymentMethod = async (
    paymentMethod: string
  ): Promise<void> => {
    setLoading(true);
    try {
      const usersRef = collection(db, "users");

      let q;
      if (paymentMethod === "All") {
        q = query(usersRef);
      } else {
        q = query(usersRef, where("paymentMethod", "==", paymentMethod));
      }

      const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);
      const userData: User[] = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as User)
      );
      setFilteredUsers(userData);
    } catch (error) {
      console.error("Error fetching users by payment method:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersByDate = async (selectedDate: Date): Promise<void> => {
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      const q = query(
        usersRef,
        where("membershipActivationDate", ">=", startOfDay),
        where("membershipActivationDate", "<=", endOfDay)
      );
      const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);
      const userData: User[] = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as User)
      );
      setFilteredUsers(userData);
    } catch (error) {
      console.error("Error fetching users by date:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async (): Promise<void> => {
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const snapshot: QuerySnapshot<DocumentData> = await getDocs(usersRef);
      const userData: User[] = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as User)
      );
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const inputValue = event.target.value;
    setSearchTerm(inputValue);

    const searchTerm = inputValue.toLowerCase();

    if (
      currentUserEmail === "iulianpampu@icloud.com" ||
      currentUserEmail === "eljardinverde.clubsocial@yahoo.com"
    ) {
      setLoading(true);
      try {
        const usersRef = collection(db, "users");

        if (searchTerm) {
          let q;
          if (currentUserEmail === "eljardinverde.clubsocial@yahoo.com") {
            q = query(
              usersRef,
              where("club", "==", "El Jardin Verde"),
              where("firstNameLower", ">=", searchTerm),
              where("firstNameLower", "<=", searchTerm + "\uf8ff")
            );
          } else {
            q = query(
              usersRef,
              where("firstNameLower", ">=", searchTerm),
              where("firstNameLower", "<=", searchTerm + "\uf8ff")
            );
          }

          const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);
          const userData: User[] = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as User)
          );

          setFilteredUsers(userData);
        } else {
          setFilteredUsers([]);
        }
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      const filtered = users.filter((user) => {
        const firstName = user.firstName?.toLowerCase() || "";
        const lastName = user.lastName?.toLowerCase() || "";
        const email = user.email?.toLowerCase() || "";
        const club = user.club?.toLowerCase() || "";
        const country = user.country?.toLowerCase() || "";
        const membershipType = user.membershipType?.toLowerCase() || "";

        return (
          firstName.includes(searchTerm) ||
          lastName.includes(searchTerm) ||
          email.includes(searchTerm) ||
          club.includes(searchTerm) ||
          country.includes(searchTerm) ||
          membershipType.includes(searchTerm)
        );
      });
      setFilteredUsers(filtered);
      setLoading(false);
    }
  };

  const searchByTransactionId = async (): Promise<void> => {
    setLoading(true);

    if (!paymentIntentId.trim()) {
      setSnackbar({
        show: true,
        message: "Please enter a transaction ID",
        type: "error",
      });
      setLoading(false);
      return;
    }

    console.log(`Searching for transaction ID: ${paymentIntentId}`);

    try {
      const q = query(
        collection(db, "users"),
        where("paymentIntentId", "==", paymentIntentId.trim())
      );

      const querySnapshot = await getDocs(q);
      const userData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];

      if (userData.length === 0) {
        console.log("No users found for this transaction ID");
      } else {
        console.log("Users found:", userData);
      }

      setFilteredUsers(userData);
    } catch (error) {
      console.error("Error searching by transaction ID:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
      <Card className="w-full max-w-6xl mx-auto shadow-xl border border-gray-200">
        <CardHeader className="bg-white rounded-t-lg border-b border-gray-200">
          <CardTitle className="text-3xl font-bold text-center text-black flex items-center justify-center">
            <Users className="mr-1 h-8 w-8 text-blue-600" />
            All Users Database
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white rounded-b-lg p-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 bg-white text-black border-gray-300"
                />
              </div>

              <div className="relative w-full sm:w-64">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by Transaction ID"
                  value={paymentIntentId}
                  onChange={(e) => setPaymentIntentId(e.target.value)}
                  className="pl-10 bg-white text-black border-gray-300"
                />
              </div>

              <Button
                onClick={searchByTransactionId}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto transition duration-300 ease-in-out"
              >
                Search by Transaction ID
              </Button>

              {currentUserEmail !== "eljardinverde.clubsocial@yahoo.com" && (
                <>
                  <Button
                    onClick={fetchAllUsers}
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto transition duration-300 ease-in-out"
                  >
                    <Users className="mr-2 h-4 w-4" /> Load All Users
                  </Button>

                  <Select onValueChange={setSelectedClub} value={selectedClub}>
                    <SelectTrigger className="w-full sm:w-40 bg-white text-black border-gray-300">
                      <SelectValue placeholder="Select Club" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="El Jardin Verde">
                        El Jardin Verde
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    onValueChange={(value) => {
                      setSelectedPaymentMethod(value);
                      fetchUsersByPaymentMethod(value);
                    }}
                    value={selectedPaymentMethod}
                  >
                    <SelectTrigger className="w-full sm:w-40 bg-white text-black border-gray-300">
                      <SelectValue placeholder="Payment Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>{" "}
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="credit card">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full sm:w-[280px] justify-start text-left font-normal bg-white text-black border-gray-300"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => {
                          setDate(newDate);
                          if (newDate) fetchUsersByDate(newDate);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </>
              )}
            </div>

            {loading ? (
              <Spinner />
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="font-bold text-black">
                        Name
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Email
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Club
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Country
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Membership Type
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Payment Method
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Activation Date
                      </TableHead>
                      <TableHead className="font-bold text-black">
                        Payment ID
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        className="hover:bg-gray-50 transition duration-150 ease-in-out"
                      >
                        <TableCell className="font-medium text-black">{`${user.firstName} ${user.lastName}`}</TableCell>
                        <TableCell className="text-black">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-black">
                          {user.club}
                        </TableCell>
                        <TableCell className="text-black">
                          {user.country}
                        </TableCell>
                        <TableCell className="text-black">
                          {user.membershipType}
                        </TableCell>
                        <TableCell className="text-black">
                          <span className="flex items-center">
                            <CreditCard className="mr-2 h-4 w-4 text-blue-600" />
                            {user.paymentMethod}
                          </span>
                        </TableCell>
                        <TableCell className="text-black">
                          {formatDate(user.membershipActivationDate)}
                        </TableCell>
                        <TableCell className="text-black">
                          {user.paymentIntentId}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={() => router.push("/admin")}
        className="mx-auto mt-6 bg-gray-600 hover:bg-gray-700 text-white flex items-center transition duration-300 ease-in-out"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Admin Page
      </Button>

      <Button
        onClick={() => router.push("/")}
        className="mx-auto mt-6 bg-gray-600 hover:bg-gray-700 text-white flex items-center transition duration-300 ease-in-out"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        show={snackbar.show}
        onClose={() =>
          setSnackbar({ show: false, message: "", type: "success" })
        }
      />
    </div>
  );
};

export default DatabaseView;
