import React from "react";
import "./App.css";
import UploadForm from "./UploadForm";
import QuestionList from "./QuestionList";
import "firebase/firestore";
import "firebase/storage";

function App() {
  return (
    <div className="container">
      <img
        height="100px"
        src="https://scontent-del1-1.xx.fbcdn.net/v/t39.30808-6/300967841_151127414214765_122909329358852500_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=09cbfe&_nc_ohc=vld78LdoDIYAX8uasl4&_nc_ht=scontent-del1-1.xx&oh=00_AfDHaukGJDG9aVw7Auu_Tafsl66GnsjEcXqopS_hB-Cb0w&oe=6437FB99"
        alt="ts logo"
      />
      <UploadForm />
      <h1 className="hero">Track your Questions here</h1>
      <QuestionList />
    </div>
  );
}

export default App;
