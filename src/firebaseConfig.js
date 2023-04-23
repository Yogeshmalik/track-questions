import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/database";

const firebaseConfig = {
  apiKey: "AIzaSyBX8KTobRdoK4B5bmn65PutFXrMI0-CL2s",
  authDomain: "track-questions.firebaseapp.com",
  databaseURL:
    "https://track-questions-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "track-questions",
  storageBucket: "track-questions.appspot.com",
  messagingSenderId: "645079332384",
  appId: "1:645079332384:web:417e36e1bc06aebb41ae45",
  measurementId: "G-RMBMP4NXP2",
};
const fbConfig = firebase.initializeApp(firebaseConfig);
const dbRef = firebase.database(fbConfig).ref("questionRecords");

export { dbRef, firebaseConfig, firebase, fbConfig };
