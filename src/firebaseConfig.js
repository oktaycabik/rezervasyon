import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCMrKZDx2NWJp91Z_VsIi-ZSAaXr2cGYTI",
    authDomain: "reservation-app-4faa0.firebaseapp.com",
    databaseURL: "https://reservation-app-4faa0-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "reservation-app-4faa0",
    storageBucket: "reservation-app-4faa0.appspot.com",
    messagingSenderId: "1082273363536",
    appId: "1:1082273363536:web:a0c5b243a61b0e51978355",
    measurementId: "G-6G9V2Q3GVQ"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
