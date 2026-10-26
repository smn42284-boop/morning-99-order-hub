
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCA7r35X7ruRqpraStUES1N77CkT2OK9CU",
  authDomain: "morning-99-order-hub.firebaseapp.com",
  databaseURL: "https://morning-99-order-hub-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "morning-99-order-hub",
  storageBucket: "morning-99-order-hub.firebasestorage.app",
  messagingSenderId: "118667987881",
  appId: "1:118667987881:web:66c2a769818387c9a312b8",
};
export const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
