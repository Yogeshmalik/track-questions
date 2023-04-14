// import { QuestionForm, Question, QuestionStats } from "./components";
// import { initializeApp } from "firebase/app";
// import {
//   getFirestore,
//   collection,
//   doc,
//   update,
//   add,
//   getDocs,
//   deleteDoc,
// } from "firebase/firestore";

// import React, { useEffect, useState } from "react";
// import firebase from "firebase/compat/app";
// import "firebase/compat/firestore";
// import "./QuestionList.css";

// const QuestionList = () => {
//   const [questions, setQuestions] = useState([]);
//   const [options, setOptions] = useState([]);
//   const [totalLimit, setTotalLimit] = useState(100);
//   const [timesUsed, setTimesUsed] = useState(0);
//   const [timesRemaining, setTimesRemaining] = useState(totalLimit);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = firebase
//       .firestore()
//       .collection("questions")
//       .onSnapshot(
//         (snapshot) => {
//           const questionsData = snapshot.docs.map((doc) => ({
//             id: doc.id,
//             ...doc.data(),
//           }));
//           setQuestions(questionsData);
//           setOptions(questionsData.map((question) => question.options));
//           setTimesUsed(
//             questionsData.reduce(
//               (sum, question) => sum + (100 - question.remainingUsage),
//               0
//             )
//           );
//           setTimesRemaining(
//             totalLimit -
//               questionsData.reduce(
//                 (sum, question) => sum + (100 - question.remainingUsage),
//                 0
//               )
//           );
//           setLoading(false);
//         },
//         (error) => {
//           console.error(error);
//           setLoading(false);
//         }
//       );

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
//         setOptions(questionsData.map((question) => question.options));
//         setTimesUsed(
//           questionsData.reduce(
//             (sum, question) => sum + (100 - question.remainingUsage),
//             0
//           )
//         );
//         setTimesRemaining(
//           totalLimit -
//             questionsData.reduce(
//               (sum, question) => sum + (100 - question.remainingUsage),
//               0
//             )
//         );
//       } catch (error) {
//         console.error(error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (totalLimit) {
//       fetchQuestions();
//     }

//     return () => unsubscribe();
//   }, [totalLimit]);

//   const handleSetTotalLimit = (limit) => {
//     setTotalLimit(limit);
//   };

//   const Option = ({ index, option, onDelete }) => {
//     return (
//       <div className="option">
//         <p>{option}</p>
//         <button onClick={onDelete}>Delete</button>
//       </div>
//     );
//   };

//   const Question = ({ question, index, onDelete, onOptionSubmit }) => {
//     return (
//       <div className="question">
//         <h3>{question.question}</h3>
//         <p>{question.answer}</p>
//         <div className="options">
//           {question.options.map((option, optionIndex) => (
//             <Option
//               key={optionIndex}
//               index={optionIndex}
//               option={option}
//               onDelete={() => onDelete(index, optionIndex, question.id)}
//             />
//           ))}
//           <OptionForm
//             index={index}
//             onSubmit={(option) => onOptionSubmit(index, option, question.id)}
//           />
//         </div>
//       </div>
//     );
//   };

//   const OptionForm = ({ index, onSubmit }) => {
//     const [option, setOption] = useState("");

//     const handleSubmit = (event) => {
//       event.preventDefault();
//       onSubmit(option);
//       setOption("");
//     };

//     return (
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           value={option}
//           onChange={(event) => setOption(event.target.value)}
//           placeholder="Enter option"
//           required
//         />
//         <button type="submit">Add Option</button>
//       </form>
//     );
//   };

//   const handleQuestionSelect = async (questionId) => {
//     const db = firebase.firestore();
//     const questionRef = db.collection("questions").doc(questionId);
//     try {
//       const question = await questionRef.get();
//       if (question.exists) {
//         const data = question.data();
//         if (data.remainingUsage > 0) {
//           const remainingUsage = data.remainingUsage - 1;
//           const lastUsed = new Date().toISOString();
//           await questionRef.update({ remainingUsage, lastUsed });
//           setQuestions((prevQuestions) =>
//             prevQuestions.map((prevQuestion) =>
//               prevQuestion.id === questionId
//                 ? { ...prevQuestion, remainingUsage, lastUsed }
//                 : prevQuestion
//             )
//           );
//           setTimesUsed(timesUsed + 1);
//           setTimesRemaining(timesRemaining - 1);
//         } else {
//           alert("Question has already been used 100 times.");
//         }
//       } else {
//         alert("Question not found.");
//       }
//     } catch (error) {
//       console.error(error);
//       alert("Error updating question.");
//     }
//   };

//   const handleQuestionSubmit = async (newQuestion) => {
//     try {
//       const db = firebase.firestore();
//       const questionRef = await db.collection("questions").add(newQuestion);
//       setQuestions((prevQuestions) => [
//         ...prevQuestions,
//         { id: questionRef.id, ...newQuestion },
//       ]);
//       setOptions([...options, []]);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleQuestionDelete = async (index, questionId) => {
//     try {
//       const db = firebase.firestore();
//       const questionRef = db.collection("questions").doc(questionId);
//       await questionRef.delete(); // delete the document from the collection
//       setQuestions((prevQuestions) =>
//         prevQuestions.filter((_, i) => i !== index)
//       );
//       setOptions((prevOptions) => prevOptions.filter((_, i) => i !== index));
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleOptionSubmit = async (questionIndex, newOption) => {
//     try {
//       const db = firebase.firestore();
//       const questionId = questions[questionIndex].id;
//       const questionRef = db.collection("questions").doc(questionId);
//       const options = [...questions[questionIndex].options, newOption];
//       await questionRef.update({ options });
//       setQuestions((prevQuestions) =>
//         prevQuestions.map((prevQuestion, index) =>
//           index === questionIndex ? { ...prevQuestion, options } : prevQuestion
//         )
//       );
//       setOptions((prevOptions) =>
//         prevOptions.map((prevQuestionOptions, index) =>
//           index === questionIndex
//             ? [...prevQuestionOptions, newOption]
//             : prevQuestionOptions
//         )
//       );
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleOptionDelete = async (index, optionIndex, questionId) => {
//     try {
//       const db = firebase.firestore();
//       const questionRef = db.collection("questions").doc(questionId);
//       const question = await questionRef.get();
//       if (question.exists) {
//         const options = question.data().options;
//         options[index].splice(optionIndex, 1);
//         await questionRef.update({ options });
//         setOptions(
//           options.map((option, i) =>
//             i === index ? [...option] : [...options[i]]
//           )
//         );
//       } else {
//         alert("Question not found.");
//       }
//     } catch (error) {
//       console.error(error);
//       alert("Error updating question.");
//     }
//   };
//   const QuestionForm = ({ onQuestionSubmit }) => {
//     const [question, setQuestion] = useState("");
//     const [answer, setAnswer] = useState("");

//     const handleSubmit = (event) => {
//       event.preventDefault();
//       onQuestionSubmit({ question, answer, options: [], remainingUsage: 100 });
//       setQuestion("");
//       setAnswer("");
//     };

//     return (
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           value={question}
//           onChange={(event) => setQuestion(event.target.value)}
//           placeholder="Enter question"
//           required
//         />
//         <input
//           type="text"
//           value={answer}
//           onChange={(event) => setAnswer(event.target.value)}
//           placeholder="Enter answer"
//           required
//         />
//         <button type="submit">Add Question</button>
//       </form>
//     );
//   };

//   const QuestionStats = () => {
//     return (
//       <div className="question-stats">
//         <p>Total questions used: {timesUsed}</p>
//         <p>Questions remaining: {timesRemaining}</p>
//         <div className="limit-input">
//           <p>Set usage limit:</p>
//           <input
//             type="number"
//             value={totalLimit}
//             onChange={(event) =>
//               handleSetTotalLimit(parseInt(event.target.value))
//             }
//           />
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="question-list">
//       {loading ? (
//         <p>Loading questions...</p>
//       ) : (
//         <>
//           <h1>Question List</h1>
//           <p>Times used: {timesUsed}</p>
//           <p>Times remaining: {timesRemaining}</p>
//           <button onClick={() => handleSetTotalLimit(50)}>
//             Set total limit to 50
//           </button>
//           <button onClick={() => handleSetTotalLimit(100)}>
//             Set total limit to 100
//           </button>
//           <QuestionStats
//             totalLimit={totalLimit}
//             timesUsed={timesUsed}
//             timesRemaining={timesRemaining}
//           />

//           <ul>
//             {questions.map((question, index) => (
//               <Question
//                 key={question.id}
//                 question={question}
//                 options={options[index]}
//                 onSelect={() => handleQuestionSelect(question.id)}
//                 onDelete={() => handleQuestionDelete(index, question.id)}
//                 onOptionDelete={handleOptionDelete}
//               >
//                 <QuestionForm
//                   onSubmit={(newOption) => handleOptionSubmit(index, newOption)}
//                 />
//               </Question>
//             ))}
//           </ul>
//           <QuestionForm onSubmit={handleQuestionSubmit} />
//         </>
//       )}
//     </div>
//   );
// };

// export default QuestionList;

// smaller with less functionality

// import React, { useEffect, useState } from "react";
// import firebase from "firebase/compat/app";
// import "firebase/compat/firestore";
// import "./QuestionList.css";

// const QuestionList = () => {
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = firebase
//       .firestore()
//       .collection("questions")
//       .onSnapshot((snapshot) => {
//         const questionsData = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setQuestions(questionsData);
//         setLoading(false);
//       });

//     return () => unsubscribe();
//   }, []);

//   const handleQuestionSelect = async (questionId) => {
//     const db = firebase.firestore();
//     const questionRef = db.collection("questions").doc(questionId);
//     try {
//       const question = await questionRef.get();
//       if (question.exists) {
//         const data = question.data();
//         if (data.remainingUsage > 0) {
//           const remainingUsage = data.remainingUsage - 1;
//           const lastUsed = new Date().toISOString();
//           await questionRef.update({ remainingUsage, lastUsed });
//           setQuestions((prevQuestions) =>
//             prevQuestions.map((prevQuestion) =>
//               prevQuestion.id === questionId
//                 ? { ...prevQuestion, remainingUsage, lastUsed }
//                 : prevQuestion
//             )
//           );
//         } else {
//           alert("Question has already been used 100 times.");
//         }
//       } else {
//         alert("Question not found.");
//       }
//     } catch (error) {
//       console.error(error);
//       alert("Error updating question.");
//     }
//   };

//   const handleQuestionSubmit = async (newQuestion) => {
//     try {
//       const db = firebase.firestore();
//       const questionRef = await db.collection("questions").add(newQuestion);
//       setQuestions((prevQuestions) => [
//         ...prevQuestions,
//         { id: questionRef.id, ...newQuestion },
//       ]);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleQuestionDelete = async (questionId) => {
//     try {
//       const db = firebase.firestore();
//       const questionRef = db.collection("questions").doc(questionId);
//       await questionRef.delete();
//       setQuestions((prevQuestions) =>
//         prevQuestions.filter((prevQuestion) => prevQuestion.id !== questionId)
//       );
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   return (
//     <div className="question-list">
//       {loading && <p>Loading...</p>}
//       {!loading && questions.length === 0 && <p>No questions found.</p>}
//       {!loading &&
//         questions.length > 0 &&
//         questions.map((question) => (
//           <div key={question.id} className="question">
//             <h3>{question.question}</h3>
//             <p>{question.answer}</p>
//             <button onClick={() => handleQuestionSelect(question.id)}>
//               Use Question
//             </button>
//             <button onClick={() => handleQuestionDelete(question.id)}>
//               Delete Question
//             </button>
//           </div>
//         ))}
//     </div>
//   );
// };

// export default QuestionList;
