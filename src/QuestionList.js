import React, { useEffect, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "./QuestionList.css";

const QuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [options, setOptions] = useState([]);
  const [totalLimit, setTotalLimit] = useState(100);
  const [timesUsed, setTimesUsed] = useState(0);
  const [timesRemaining, setTimesRemaining] = useState(totalLimit);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection("questions")
      .onSnapshot(
        (snapshot) => {
          const questionsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setQuestions(questionsData);
          setOptions(questionsData.map((question) => question.options));
          setTimesUsed(
            questionsData.reduce(
              (sum, question) => sum + (100 - question.remainingUsage),
              0
            )
          );
          setTimesRemaining(
            totalLimit -
              questionsData.reduce(
                (sum, question) => sum + (100 - question.remainingUsage),
                0
              )
          );
          setLoading(false);
        },
        (error) => {
          console.error(error);
          setLoading(false);
        }
      );

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
        setOptions(questionsData.map((question) => question.options));
        setTimesUsed(
          questionsData.reduce(
            (sum, question) => sum + (100 - question.remainingUsage),
            0
          )
        );
        setTimesRemaining(
          totalLimit -
            questionsData.reduce(
              (sum, question) => sum + (100 - question.remainingUsage),
              0
            )
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (totalLimit) {
      fetchQuestions();
    }

    return () => unsubscribe();
  }, [totalLimit]);

  const handleSetTotalLimit = (limit) => {
    setTotalLimit(limit);
  };

  const Option = ({ index, option, onDelete }) => {
    return (
      <div className="option">
        <p>{option}</p>
        <button onClick={onDelete}>Delete</button>
      </div>
    );
  };

  const Question = ({ question, index, onDelete, onOptionSubmit }) => {
    return (
      <div className="question">
        <h3>{question.question}</h3>
        <p>{question.answer}</p>
        <div className="options">
          {question.options.map((option, optionIndex) => (
            <Option
              key={optionIndex}
              index={optionIndex}
              option={option}
              onDelete={() => onDelete(index, optionIndex, question.id)}
            />
          ))}
          <OptionForm
            index={index}
            onSubmit={(option) => onOptionSubmit(index, option, question.id)}
          />
        </div>
      </div>
    );
  };

  const OptionForm = ({ index, onSubmit }) => {
    const [option, setOption] = useState("");

    const handleSubmit = (event) => {
      event.preventDefault();
      onSubmit(option);
      setOption("");
    };

    return (
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={option}
          onChange={(event) => setOption(event.target.value)}
          placeholder="Enter option"
          required
        />
        <button type="submit">Add Option</button>
      </form>
    );
  };

  const handleQuestionSelect = async (questionId) => {
    const db = firebase.firestore();
    const questionRef = db.collection("questions").doc(questionId);
    try {
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
          setTimesUsed(timesUsed + 1);
          setTimesRemaining(timesRemaining - 1);
        } else {
          alert("Question has already been used 100 times.");
        }
      } else {
        alert("Question not found.");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating question.");
    }
  };

  const handleQuestionSubmit = async (newQuestion) => {
    try {
      const db = firebase.firestore();
      const questionRef = await db.collection("questions").add(newQuestion);
      setQuestions((prevQuestions) => [
        ...prevQuestions,
        { id: questionRef.id, ...newQuestion },
      ]);
      setOptions([...options, []]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleQuestionDelete = async (index, questionId) => {
    try {
      const db = firebase.firestore();
      const questionRef = db.collection("questions").doc(questionId);
      await questionRef.delete(); // delete the document from the collection
      setQuestions((prevQuestions) =>
        prevQuestions.filter((_, i) => i !== index)
      );
      setOptions((prevOptions) => prevOptions.filter((_, i) => i !== index));
    } catch (error) {
      console.error(error);
    }
  };

  const handleOptionSubmit = async (questionIndex, newOption) => {
    try {
      const db = firebase.firestore();
      const questionId = questions[questionIndex].id;
      const questionRef = db.collection("questions").doc(questionId);
      const options = [...questions[questionIndex].options, newOption];
      await questionRef.update({ options });
      setQuestions((prevQuestions) =>
        prevQuestions.map((prevQuestion, index) =>
          index === questionIndex ? { ...prevQuestion, options } : prevQuestion
        )
      );
      setOptions((prevOptions) =>
        prevOptions.map((prevQuestionOptions, index) =>
          index === questionIndex
            ? [...prevQuestionOptions, newOption]
            : prevQuestionOptions
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleOptionDelete = async (index, optionIndex, questionId) => {
    try {
      const db = firebase.firestore();
      const questionRef = db.collection("questions").doc(questionId);
      const question = await questionRef.get();
      if (question.exists) {
        const options = question.data().options;
        options[index].splice(optionIndex, 1);
        await questionRef.update({ options });
        setOptions(
          options.map((option, i) =>
            i === index ? [...option] : [...options[i]]
          )
        );
      } else {
        alert("Question not found.");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating question.");
    }
  };

  const QuestionForm = ({ onQuestionSubmit }) => {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");

    const handleSubmit = (event) => {
      event.preventDefault();
      onQuestionSubmit({ question, answer, options: [], remainingUsage: 100 });
      setQuestion("");
      setAnswer("");
    };

    return (
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Enter question"
          required
        />
        <input
          type="text"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Enter answer"
          required
        />
        <button type="submit">Add Question</button>
      </form>
    );
  };

  const QuestionStats = () => {
    return (
      <div className="question-stats">
        <p>Total questions used: {timesUsed}</p>
        <p>Questions remaining: {timesRemaining}</p>
        <div className="limit-input">
          <p>Set usage limit:</p>
          <input
            type="number"
            value={totalLimit}
            onChange={(event) =>
              handleSetTotalLimit(parseInt(event.target.value))
            }
          />
        </div>
      </div>
    );
  };

  return (
    <div className="question-list">
      {loading ? (
        <p>Loading questions...</p>
      ) : (
        <>
          <h1>Question List</h1>
          <p>Times used: {timesUsed}</p>
          <p>Times remaining: {timesRemaining}</p>
          <button onClick={() => handleSetTotalLimit(50)}>
            Set total limit to 50
          </button>
          <button onClick={() => handleSetTotalLimit(100)}>
            Set total limit to 100
          </button>
          <QuestionStats
            totalLimit={totalLimit}
            timesUsed={timesUsed}
            timesRemaining={timesRemaining}
          />

          <ul>
            {questions.map((question, index) => (
              <Question
                key={question.id}
                question={question}
                options={options[index]}
                onSelect={() => handleQuestionSelect(question.id)}
                onDelete={() => handleQuestionDelete(index, question.id)}
                onOptionDelete={handleOptionDelete}
              >
                <QuestionForm
                  onSubmit={(newOption) => handleOptionSubmit(index, newOption)}
                />
              </Question>
            ))}
          </ul>
          <QuestionForm onSubmit={handleQuestionSubmit} />
          <OptionForm />
        </>
      )}
    </div>
  );
};

export default QuestionList;

// import React, { useEffect, useState } from "react";
// // import firebase from 'firebase/app';
// import "firebase/firestore";
// import "firebase/storage";
// import firebase from "firebase/compat/app";
// import "firebase/compat/firestore";
// import "./QuestionList.css";

// const QuestionList = () => {
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const snapshot = await firebase
//           .firestore()
//           .collection("questions")
//           .get();
//         const questionsData = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setQuestions(questionsData);
//       } catch (error) {
//         console.error(error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchQuestions();
//   }, []);

//   const handleQuestionSelect = async (questionId) => {
//     const db = firebase.firestore();
//     const questionRef = db.collection("questions").doc(questionId);
//     const question = await questionRef.get();
//     if (question.exists) {
//       const data = question.data();
//       if (data.remainingUsage > 0) {
//         const remainingUsage = data.remainingUsage - 1;
//         const lastUsed = new Date().toISOString();
//         await questionRef.update({ remainingUsage, lastUsed });
//         setQuestions((prevQuestions) =>
//           prevQuestions.map((prevQuestion) =>
//             prevQuestion.id === questionId
//               ? { ...prevQuestion, remainingUsage, lastUsed }
//               : prevQuestion
//           )
//         );
//       } else {
//         alert("Question has already been used 100 times.");
//       }
//     } else {
//       console.error("Question not found.");
//     }
//   };

//   const calculateRemainingTime = (lastUsed) => {
//     const now = new Date().getTime();
//     const lastUsedTime = new Date(lastUsed).getTime();
//     const elapsedTime = now - lastUsedTime;
//     const remainingTime = 100 - elapsedTime;
//     return remainingTime > 0 ? remainingTime : 0;
//   };

//   if (loading) {
//     return <p>Loading questions...</p>;
//   }

//   if (questions.length === 0) {
//     return <p className="noQuestFound">No questions found.</p>;
//   }

//   return (
//     <div className="question-list-container">
//       <h2>Questions</h2>
//       <ul>
//         {questions.map((question) => (
//           <li className="question-card" key={question.id}>
//             <input type="checkbox" />
//             {question.text}
//             <span>Remaining Usage: {question.remainingUsage}</span>
//             <span>
//               Remaining Time: {calculateRemainingTime(question.lastUsed)}{" "}
//               seconds
//             </span>
//             <button onClick={() => handleQuestionSelect(question.id)}>
//               Select
//             </button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default QuestionList;

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
