import "./App.css";
import UploadForm from "./UploadForm";
import QuestionList from "./QuestionList";
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
// import firebase from 'firebase';


function App() {

  firebase.initializeApp({
    apiKey: "AIzaSyBX8KTobRdoK4B5bmn65PutFXrMI0-CL2s",
    authDomain: "track-questions.firebaseapp.com",
    projectId: "track-questions",
    storageBucket: "track-questions.appspot.com",
    messagingSenderId: "645079332384",
    appId: "1:645079332384:web:417e36e1bc06aebb41ae45",
    measurementId: "G-RMBMP4NXP2",
  });
  const db = firebase.firestore();

  return (
    <div className="App">
      Hello
      <UploadForm />
      <QuestionList />
    </div>
  );
}

export default App;
