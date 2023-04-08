import React, { useEffect, useState } from "react";
// import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';


const QuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const snapshot = await firebase
          .firestore()
          .collection("questions")
          .get();
        const questionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuestions(questionsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleQuestionSelect = async (questionId) => {
    const db = firebase.firestore();
    const questionRef = db.collection("questions").doc(questionId);
    const question = await questionRef.get();
    if (question.exists) {
      const data = question.data();
      if (data.remainingUsage > 0) {
        const remainingUsage = data.remainingUsage - 1;
        const lastUsed = new Date().toISOString();
        await questionRef.update({ remainingUsage, lastUsed });
        setQuestions((prevQuestions) =>
          prevQuestions.map((prevQuestion) =>
            prevQuestion.id === questionId
              ? { ...prevQuestion, remainingUsage, lastUsed }
              : prevQuestion
          )
        );
      } else {
        alert("Question has already been used 100 times.");
      }
    } else {
      console.error("Question not found.");
    }
  };

  const calculateRemainingTime = (lastUsed) => {
    const now = new Date().getTime();
    const lastUsedTime = new Date(lastUsed).getTime();
    const elapsedTime = now - lastUsedTime;
    const remainingTime = 100 - elapsedTime;
    return remainingTime > 0 ? remainingTime : 0;
  };

  if (loading) {
    return <p>Loading questions...</p>;
  }

  if (questions.length === 0) {
    return <p>No questions found.</p>;
  }

  return (
    <div>
      <h2>Questions</h2>
      <ul>
        {questions.map((question) => (
          <li key={question.id}>
            <input type="checkbox" />
            {question.text}
            <span>Remaining Usage: {question.remainingUsage}</span>
            <span>
              Remaining Time: {calculateRemainingTime(question.lastUsed)}{" "}
              seconds
            </span>
            <button onClick={() => handleQuestionSelect(question.id)}>
              Select
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuestionList;

/* we're using the useState hook to create a state variable questions to hold the list of questions fetched from Firebase. 
We're also using the useEffect hook to make the asynchronous call to Firebase when the component mounts. 
Inside the useEffect hook, we're using the firebase.firestore() method to get a reference to the Firestore database and 
then calling the get() method on the questions collection to fetch all the documents. We're then using the map() method 
to transform the returned documents into an array of objects with an id field (the document ID) and a text 
field (the text of the question). Finally, we're updating the questions state variable with the transformed data 
using the setQuestions function.

In the return statement, we're rendering the list of questions using the map() method to create an array of li elements, 
one for each question. We're also rendering a heading with the text "Question List". You can modify the JSX to display
the questions in a different format if you like. */
