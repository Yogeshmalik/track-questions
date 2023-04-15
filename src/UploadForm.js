import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import { dbRef, firebaseConfig } from "./firebaseConfig";
import Papa from "papaparse";

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    question: "",
    options: { option1: "", option2: "", option3: "", option4: "" },
    timesUsed: "",
    timesRemaining: "",
    totalLimit: "",
    comment: "", // added comment field to userData state
  });
  const [latestData, setLatestData] = useState({});
  // const [totalLimit, setTotalLimit] = useState(100);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setFile(file);
    parseFile(file);
  }, []);

  useEffect(() => {
    const questionsRef = dbRef.child("questions");
    questionsRef.on("value", (snapshot) => {
      const questions = [];
      snapshot.forEach((childSnapshot) => {
        const question = childSnapshot.val();
        question.id = childSnapshot.key;
        questions.push(question);
      });
      setLatestData(questions[questions.length - 1]); // get the last item in the array
    });
  }, []);

  const newQuestion = async () => {
    try {
      const newQuestionRef = dbRef.child("questions").push();
      const newQuestion = {
        question: userData.question.trim(),
        option1: userData.options["option1"].trim(),
        option2: userData.options["option2"].trim(),
        option3: userData.options["option3"].trim(),
        option4: userData.options["option4"].trim(),
        timesUsed: 0,
        timesRemaining: parseInt(userData.timesRemaining),
        totalLimit: parseInt(userData.totalLimit),
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        comment: userData.comment.trim(),
        text: text.trim(), // add the text property to the newQuestion object
      };
      await newQuestionRef.set(newQuestion);
      setUserData({
        question: "",
        options: { option1: "", option2: "", option3: "", option4: "" },
        timesUsed: "",
        timesRemaining: "",
        totalLimit: "",
        comment: "",
      });
      setText(""); // clear the text state
    } catch (error) {
      console.error(error);
      setError("Error uploading question. Please try again.");
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleQuestionChange = (event) => {
    // update userData state with the new value of the question input
    setUserData((prevState) => ({
      ...prevState,
      question: event.target.value,
    }));
  };

  const handleOptionChange = (event) => {
    // update userData state with the new value of the option inputs
    setUserData((prevState) => ({
      ...prevState,
      options: {
        ...prevState.options,
        [event.target.name]: event.target.value,
      },
    }));
  };

  const handleTimesUsedChange = (event) => {
    // update userData state with the new value of the timesUsed input
    setUserData((prevState) => ({
      ...prevState,
      timesUsed: event.target.value,
    }));
  };

  const handleTimesRemainingChange = (event) => {
    // update userData state with the new value of the timesRemaining input
    setUserData((prevState) => ({
      ...prevState,
      timesRemaining: event.target.value,
    }));
  };

  const handleTotalLimitChange = (event) => {
    // update userData state with the new value of the totalLimit input
    setUserData((prevState) => ({
      ...prevState,
      totalLimit: event.target.value,
    }));
  };

  const handleCommentChange = (event) => {
    // update userData state with the new value of the comment input
    setUserData((prevState) => ({
      ...prevState,
      comment: event.target.value,
    }));
  };

  const handleNumericChange = (name) => (event) => {
    setUserData({ ...userData, [name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    let questions;
    if (file) {
      questions = await parseFile(file);
    } else {
      questions = [
        {
          text: userData.question.trim(),
          options: [
            userData.options.option1.trim(),
            userData.options.option2.trim(),
            userData.options.option3.trim(),
            userData.options.option4.trim(),
          ],
          remainingUsage: parseInt(userData.timesRemaining),
          lastUsed: null,
        },
      ];
    }
    try {
      await uploadQuestions(questions);
      await newQuestion();
      await uploadUserData();
      setFile(null); // clear the file state
      setUserData({
        question: "",
        options: { option1: "", option2: "", option3: "", option4: "" },
        timesUsed: "",
        timesRemaining: "",
        totalLimit: "",
        comment: "",
      }); // reset the userData state
      alert("Questions uploaded successfully!");
    } catch (error) {
      console.error(error);
      setError("Error uploading questions. Please try again.");
    }
  };

  const parseFile = async (file) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async (event) => {
        const content = event.target.result;
        let questions;
        if (file.name.endsWith(".csv")) {
          questions = parseCSV(content);
        } else {
          questions = parseText(content);
        }
        try {
          await uploadQuestions(questions);
          alert("Questions uploaded successfully!");
          resolve(questions);
        } catch (error) {
          console.error(error);
          reject(new Error("Error uploading questions. Please try again."));
        }
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      reader.readAsText(file);
    });
  };

  const parseCSV = (text) => {
    const results = Papa.parse(text, { header: true });
    return results.data.map((parsedQuestion) => ({
      question: parsedQuestion.question.trim(),
      options: [
        parsedQuestion.option1.trim(),
        parsedQuestion.option2.trim(),
        parsedQuestion.option3.trim(),
        parsedQuestion.option4.trim(),
      ],
      timesUsed: 0,
      timesRemaining: 100,
      totalLimit: null,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      comment: "",
    }));
  };

  const parseText = (text) => {
    const lines = text.trim().split("\n");
    const questions = lines.map((line) => {
      const [questionText, ...options] = line.trim().split(",");
      return {
        question: questionText.trim(),
        options: options.map((option) => option.trim()),
        timesUsed: 0,
        timesRemaining: 100,
        totalLimit: null,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        comment: "",
      };
    });
    return questions;
  };

  const uploadQuestions = async (questions) => {
    const dbRef = firebase.database().ref("questions");

    for (const question of questions) {
      const newQuestionRef = dbRef.push();
      const newQuestion = {
        question: question.text,
        option1: question.options[0],
        option2: question.options[1],
        option3: question.options[2],
        option4: question.options[3],
        timesUsed: question.lastUsed ? 1 : 0,
        timesRemaining: question.remainingUsage,
        totalLimit: 100,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
      };
      await newQuestionRef.set(newQuestion);
    }

    // Get the latest uploaded data from Firebase
    dbRef.limitToLast(1).once("value", (snapshot) => {
      const latest = snapshot.val();
      if (latest) {
        setLatestData(latest[Object.keys(latest)[0]]);
      }
    });
  };

  const uploadUserData = async () => {
    try {
      const userDataRef = dbRef.child("userData");
      const snapshot = await userDataRef.once("value");
      const userData = snapshot.val() || {};
      const newUserData = {
        ...userData,
        [latestData.text]: {
          option1: latestData.options[0],
          option2: latestData.options[1],
          option3: latestData.options[2],
          option4: latestData.options[3],
          timesUsed: latestData.lastUsed ? 1 : 0,
          timesRemaining: latestData.remainingUsage,
          totalLimit: 100,
        },
      };
      await userDataRef.set(newUserData);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fileUpload">Upload Questions from File</label>
          <div {...getRootProps({ className: "dropzone" })}>
            <input {...getInputProps()} />
            {file ? (
              <p>File: {file.name}</p>
            ) : (
              <p className="drag-drop-select">
                Drag and drop a file here, or click to select a file. Only .txt
                and .csv files are supported.
              </p>
            )}
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="question">Question Text</label>
          <input
            type="text"
            className="form-control inputarea"
            id="question"
            name="question"
            placeholder="Enter Your Question Here..."
            value={userData.question}
            onChange={handleQuestionChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="option1">Option 1</label>
          <input
            type="text"
            className="form-control inputarea"
            id="option1"
            name="option1"
            placeholder="Enter Your Option Here..."
            value={userData.options.option1}
            onChange={handleOptionChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="option2">Option 2</label>
          <input
            type="text"
            className="form-control inputarea"
            id="option2"
            name="option2"
            placeholder="Enter Your Option Here..."
            value={userData.options.option2}
            onChange={handleOptionChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="option3">Option 3</label>
          <input
            type="text"
            className="form-control inputarea"
            id="option3"
            name="option3"
            placeholder="Enter Your Option Here..."
            value={userData.options.option3}
            onChange={handleOptionChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="option4">Option 4</label>
          <input
            type="text"
            className="form-control inputarea"
            id="option4"
            name="option4"
            placeholder="Enter Your Option Here..."
            value={userData.options.option4}
            onChange={handleOptionChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="timesUsed">Times Used</label>
          <input
            type="number"
            className="form-control"
            id="timesUsed"
            value={userData.timesUsed}
            onChange={handleTimesUsedChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="timesRemaining">Times Remaining</label>
          <input
            type="number"
            className="form-control"
            id="timesRemaining"
            value={userData.timesRemaining}
            onChange={handleTimesRemainingChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="totalLimit">Total Limit</label>
          <input
            type="number"
            className="form-control"
            id="totalLimit"
            value={userData.totalLimit}
            onChange={handleTotalLimitChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="textUpload">Your Comments:</label>
          <textarea
            name="text"
            id="text"
            className="form-control inputarea"
            placeholder="Type your question here..."
            value={text}
            onChange={handleTextChange} // add the onChange prop
          />
          <textarea
            className="form-control inputarea"
            placeholder="Enter Your Comments Here"
            id="textUpload"
            rows="3"
            value={userData.text}
            onChange={handleCommentChange}
          />
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
        {error && <p className="errorMsg">{error}</p>}
      </form>
      <div className="latestUploaded">
        <h3>Latest Uploaded Question:</h3>
        <p>
          {latestData[latestData.length - 1] &&
            latestData[latestData.length - 1].question}
          Test
        </p>
        <p>
          {latestData.length > 0
            ? latestData[latestData.length - 1].question
            : ""}
        </p>
        <h3>Options:</h3>
        <ul>
          <li>
            {latestData[latestData.length - 1] &&
              latestData[latestData.length - 1].option1}
          </li>
          <li>
            {latestData[latestData.length - 1] &&
              latestData[latestData.length - 1].option2}
          </li>
          <li>
            {latestData[latestData.length - 1] &&
              latestData[latestData.length - 1].option3}
          </li>
          <li>
            {latestData[latestData.length - 1] &&
              latestData[latestData.length - 1].option4}
          </li>
        </ul>
        <h3>Times Used:</h3>
        <p>
          {latestData[latestData.length - 1] &&
            latestData[latestData.length - 1].timesUsed}
        </p>
        <h3>Times Remaining:</h3>
        <p>
          {latestData[latestData.length - 1] &&
            latestData[latestData.length - 1].timesRemaining}
        </p>
        <h3>Total Limit:</h3>
        <p>
          {latestData[latestData.length - 1] &&
            latestData[latestData.length - 1].totalLimit}
        </p>
        <h3>Comment:</h3>
        <p>
          {latestData[latestData.length - 1] &&
            latestData[latestData.length - 1].comment}
        </p>
      </div>
    </div>
  );
};
export default UploadForm;
