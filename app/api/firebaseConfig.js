import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; 

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); 

const fetchMemberCount = async () => {
  try {
    const docRef = doc(db, 'metadata', 'memberCountDoc');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.memberCount;
    } else {
      console.log("No such document for member count!");
      return 0;
    }
  } catch (error) {
    console.error("Error fetching member count:", error);
    return 0;
  }
};

const updateMemberCount = async (newCount) => {
  try {
    const docRef = doc(db, 'metadata', 'memberCountDoc');
    await updateDoc(docRef, {
      memberCount: newCount,
    });
    console.log(`Member count updated to ${newCount}`);
  } catch (error) {
    console.error("Error updating member count:", error);
  }
};

export { auth, db, storage, fetchMemberCount, updateMemberCount };
