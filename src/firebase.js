
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// 您的Firebase配置
const firebaseConfig = {
  apiKey: "AIzaSyBV_mrY9q6o95yAoMin4QymGMqMxWTKTUA",
  authDomain: "trading-journal-b6ac4.firebaseapp.com",
  projectId: "trading-journal-b6ac4",
  storageBucket: "trading-journal-b6ac4.firebasestorage.app",
  messagingSenderId: "697087405642",
  appId: "1:697087405642:web:f61cdaf810424a35e700b3",
  measurementId: "G-09TNMP4K42"
};

// 初始化Firebase
const app = initializeApp(firebaseConfig);

// 初始化服务
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);