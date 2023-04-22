import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import { dbRef } from "./firebaseConfig";
import Papa from "papaparse";

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    question: "",
    options: { option1: "", option2: "", option3: "", option4: "" },
    totalLimit: 100,
    comment: "",
    correctOption: "",
  });
  const [latestData, setLatestData] = useState({});
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setFile(file);
    parseFile(file);
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const fetchLatestQuestion = async () => {
    try {
      const response = await fetch(
        "https://track-questions-default-rtdb.firebaseio.com/questions.json?orderBy=%22createdAt%22&limitToLast=1"
      );
      const data = await response.json();
      if (data) {
        const latestQuestionKey = Object.keys(data)[0];
        setLatestData({ ...data[latestQuestionKey], key: latestQuestionKey });
      }
      console.log("Question fetched successfully.", userData, latestData);
    } catch (error) {
      console.error(error);
      setError("Error fetching latest question. Please try again.");
    }
  };

  useEffect(() => {
    if (Object.keys(latestData).length > 0) {
      setUserData((prevState) => ({
        ...prevState,
        question: latestData.question,
        options: { ...latestData.options },
        totalLimit:
          latestData.totalLimit !== "" ? parseInt(latestData.totalLimit) : 100,
        comment: latestData.comment,
        correctOption: latestData.correctOption,
      }));
      document.getElementById("correct-answer").value =
        latestData.correctOption;
    }
  }, [latestData]);

  useEffect(() => {
    fetchLatestQuestion();
  }, []);

  const newQuestion = async (userData) => {
    try {
      if (
        userData.question.trim() === "" ||
        Object.keys(userData.options).some(
          (option) => userData.options[option].trim() === ""
        ) ||
        userData.correctOption === ""
      ) {
        setError("Please fill in all fields.");
        return;
      }
      const questionData = {
        question: userData.question.trim(),
        options: {
          option1: userData.options.option1.trim(),
          option2: userData.options.option2.trim(),
          option3: userData.options.option3.trim(),
          option4: userData.options.option4.trim(),
        },
        totalLimit:
          userData.totalLimit !== "" ? parseInt(userData.totalLimit) : 100,
        comment: userData.comment.trim(),
        correctOption: userData.correctOption.trim(),
        createdAt: Date.now(),
      };
      const snapshot = await firebase
        .database()
        .ref("questions")
        .push(questionData);
      console.log("Question added successfully.", snapshot.key);
      setLatestData({ ...questionData, key: snapshot.key });
      setUserData({
        question: "",
        options: { option1: "", option2: "", option3: "", option4: "" },
        totalLimit: 100,
        comment: "",
        correctOption: "",
      });
      setError(null);
    } catch (error) {
      console.error(error);
      setError("Error uploading question. Please try again.");
    }
  };

  const handleQuestionChange = (event) => {
    setUserData((prevState) => ({
      ...prevState,
      question: event.target.value,
    }));
  };
  const handleOptionChange = (event) => {
    setUserData((prevState) => ({
      ...prevState,
      options: {
        ...prevState.options,
        [event.target.name]: event.target.value,
      },
    }));
  };
  const handleTotalLimitChange = (event) => {
    const value = parseInt(event.target.value, 10) || 100;
    setUserData((prevState) => ({
      ...prevState,
      totalLimit: value,
    }));
  };
  const handleCommentChange = (event) => {
    setUserData((prevState) => ({
      ...prevState,
      comment: event.target.value,
    }));
  };
  const handleCorrectOptionChange = (e) => {
    setUserData((prevState) => ({
      ...prevState,
      correctOption: e.target.value.trim(),
    }));
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
        totalLimit: 100,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
      };
      await newQuestionRef.set(newQuestion);
    }
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
          totalLimit: 100,
        },
      };
      await userDataRef.set(newUserData);
    } catch (error) {
      console.error(error);
    }
  };
  const LatestData = ({ latestData }) => {
    if (Object.keys(latestData).length === 0) {
      return null;
    }
    return (
      <div id="latestFetchedData">
        <h3>Latest Uploaded Data:</h3>
        {Object.keys(latestData).length > 0 ? (
          <div>
            <p>Question: {latestData.question}</p>
            {latestData.options && (
              <>
                <p>Option 1: {latestData.options.option1}</p>
                <p>Option 2: {latestData.options.option2}</p>
                <p>Option 3: {latestData.options.option3}</p>
                <p>Option 4: {latestData.options.option4}</p>
              </>
            )}
            <p>Total Limit: {latestData.totalLimit}</p>
            <p>Comment: {latestData.comment}</p>
            <p>Correct Option: {latestData.correctOption}</p>
          </div>
        ) : (
          <p>No data uploaded yet.</p>
        )}
      </div>
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (file) {
        await parseFile(file);
        setFile(null);
      } else {
        if (
          userData.question.trim() === "" ||
          Object.keys(userData.options).some(
            (option) => userData.options[option].trim() === ""
          ) ||
          userData.correctOption === ""
        ) {
          setError("Please fill in all fields.");
          return;
        }

        const questionData = {
          question: userData.question.trim(),
          options: {
            option1: userData.options["option1"].trim(),
            option2: userData.options["option2"].trim(),
            option3: userData.options["option3"].trim(),
            option4: userData.options["option4"].trim(),
          },
          totalLimit: userData.totalLimit,
          comment: userData.comment.trim(),
          correctOption: userData.options[userData.correctOption].trim(),
          createdAt: Date.now(),
        };
        await dbRef.child("questions").push(questionData);
        setLatestData(questionData);
        setUserData({
          question: "",
          options: {
            option1: "",
            option2: "",
            option3: "",
            option4: "",
          },
          totalLimit: 100,
          comment: "",
          correctOption: "",
        });
      }
      setError(null);
    } catch (error) {
      console.error(error);
      setError("Error uploading question. Please try again.");
    }
  };

  return (
    <div>
      <form id="myForm" onSubmit={handleSubmit}>
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
          <label htmlFor="question">Question:</label>
          <input
            type="text"
            className="form-control inputarea"
            id="question"
            name="question"
            placeholder="Enter Your Question Here..."
            value={userData.question}
            onChange={handleQuestionChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="option1">Option 1:</label>
          <input
            type="text"
            className="form-control inputarea"
            id="option1"
            name="option1"
            placeholder="Enter Your Option Here..."
            value={userData.options.option1}
            onChange={handleOptionChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="option2">Option 2:</label>
          <input
            type="text"
            className="form-control inputarea"
            id="option2"
            name="option2"
            placeholder="Enter Your Option Here..."
            value={userData.options.option2}
            onChange={handleOptionChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="option3">Option 3:</label>
          <input
            type="text"
            className="form-control inputarea"
            id="option3"
            name="option3"
            placeholder="Enter Your Option Here..."
            value={userData.options.option3}
            onChange={handleOptionChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="option4">Option 4:</label>
          <input
            type="text"
            className="form-control inputarea"
            id="option4"
            name="option4"
            placeholder="Enter Your Option Here..."
            value={userData.options.option4}
            onChange={handleOptionChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="correct-answer">Correct Answer:</label>
          <input
            type="number"
            id="correct-answer"
            className="form-control inputarea"
            name="correctOption"
            min="1"
            max="4"
            defaultValue=""
            value={userData.correctOption}
            onChange={handleCorrectOptionChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="textUpload">Your Comments:</label>
          <input
            className="form-control inputarea"
            placeholder="Enter Your Comments Here"
            id="textUpload"
            value={userData.text}
            onChange={handleCommentChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="totalLimit">Total Limit</label>
          <input
            type="number"
            className="form-control"
            id="totalLimit"
            value={userData.totalLimit || ""}
            onChange={handleTotalLimitChange}
          />
        </div>
        <div>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
        {error && <p className="errorMsg">{error}</p>}
      </form>
      {error && <p>Error uploading question. Please try again.</p>}
      <LatestData latestData={latestData} />
    </div>
  );
};
export default UploadForm;
