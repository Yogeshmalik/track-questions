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

  // const userData = {};

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
      // document.getElementById("correct-answer").value =
      //   latestData.correctOption;
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
  const handleTotalLimitChange = (e) => {
    setUserData((prevState) => ({
      ...prevState,
      totalLimit: e.target.value,
    }));
  };

  const handleCommentChange = (e) => {
    setUserData((prevState) => ({
      ...prevState,
      comment: e.target.value,
    }));
  };

  const handleCorrectOptionChange = (e) => {
    setUserData((prevState) => ({
      ...prevState,
      correctOption: e.target.value,
    }));
  };

  const parseCSV = (text) => {
    const results = Papa.parse(text.trim(), { header: true, delimiter: "," });
    return results.data.map((parsedQuestion) => ({
      question: parsedQuestion.question.trim(),
      options: [
        parsedQuestion.option1.trim(),
        parsedQuestion.option2.trim(),
        parsedQuestion.option3.trim(),
        parsedQuestion.option4.trim(),
      ],
      correctOption: parsedQuestion.correctOption.trim(),
      createdAt: Date.now(),
      comment: parsedQuestion.comment ? parsedQuestion.comment.trim() : "",
      totalLimit: parsedQuestion.totalLimit
        ? parseInt(parsedQuestion.totalLimit.trim()) || 100
        : 100,
    }));
  };

  const parseText = (text) => {
    const rows = text.trim().split(/\r?\n/);
    const header = rows[0].split(",").map((value) => value.trim());
    if (
      header.includes("question") &&
      header.includes("option1") &&
      header.includes("option2") &&
      header.includes("option3") &&
      header.includes("option4") &&
      header.includes("correctOption")
    ) {
      return rows.slice(1).map((row) => {
        const values = row.split(",").map((value) => value.trim());
        return {
          question: values[header.indexOf("question")],
          options: {
            option1: values[header.indexOf("option1")],
            option2: values[header.indexOf("option2")],
            option3: values[header.indexOf("option3")],
            option4: values[header.indexOf("option4")],
          },
          correctOption: values[header.indexOf("correctOption")],
          createdAt: Date.now(),
          comment: values[header.indexOf("comment")] || "",
          totalLimit: values[header.indexOf("totalLimit")]
            ? parseInt(values[header.indexOf("totalLimit")].trim()) || 100
            : 100,
        };
      });
    } else {
      throw new Error("Invalid file format.");
    }
  };

  const parseFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target.result;
        try {
          let questions;
          if (file.name.endsWith(".csv")) {
            questions = parseCSV(content);
          } else {
            questions = parseText(content);
          }
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

  const uploadQuestions = async (questions) => {
    const dbRef = firebase.database().ref("questions");
    try {
      for (const question of questions) {
        const newQuestionRef = dbRef.push();
        const newQuestion = {
          question: question.question,
          option1: question.options.option1,
          option2: question.options.option2,
          option3: question.options.option3,
          option4: question.options.option4,
          correctOption: question.correctOption,
          totalLimit: question.totalLimit || 100,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          comment: question.comment || "",
        };
        await newQuestionRef.set(newQuestion);
      }
      dbRef.limitToLast(1).once("value", (snapshot) => {
        const latest = snapshot.val();
        if (latest) {
          setLatestData(latest[Object.keys(latest)[0]]);
        }
      });
      setFile(null);
      setError(null);
    } catch (error) {
      console.error(error);
      setError("Error uploading questions. Please try again.");
    }
  };

  const uploadUserData = async () => {
    try {
      const questionsRef = firebase.database().ref("questions");
      const newQuestionRef = questionsRef.push();
      const newQuestionKey = newQuestionRef.key;
      const timestamp = Date.now();
      const formattedData = {
        ...userData,
        createdAt: timestamp,
      };
      await newQuestionRef.set(formattedData);
      setLatestData({ ...formattedData, key: newQuestionKey });
      setUserData({
        question: "",
        options: { option1: "", option2: "", option3: "", option4: "" },
        totalLimit: 100,
        comment: "",
        correctOption: "",
      });
      const userDataRef = firebase.database().ref("userData");
      const snapshot = await userDataRef.once("value");
      const existingUserData = snapshot.val() || {};
      const newUserData = {
        ...existingUserData,
        [newQuestionKey]: {
          option1: formattedData.options.option1,
          option2: formattedData.options.option2,
          option3: formattedData.options.option3,
          option4: formattedData.options.option4,
          totalLimit: formattedData.totalLimit,
          comment: formattedData.comment,
          correctOption: formattedData.correctOption,
        },
      };
      await userDataRef.set(newUserData);
    } catch (error) {
      console.error(error);
      setError("Error uploading question. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      await uploadUserData();
    } catch (error) {
      console.error(error);
      setError("Error uploading question. Please try again.");
    }
    newQuestion();
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

  return (
    <div className="upload-form-container">
      <form id="myForm" onSubmit={handleSubmit}>
        <div {...getRootProps({ className: "dropzone" })}>
          <input {...getInputProps()} />
          {file ? (
            <p>File: {file.name}</p>
          ) : (
            <p className="drag-drop-select">
              Drag and drop a file here or click to select a file.
            </p>
          )}
        </div>
        {error && <p className="error-msg">{error}</p>}
        <div className="form-group">
          <label htmlFor="question">Question:</label>
          <input
            className="form-control inputarea"
            placeholder="Enter Your Question Here..."
            type="text"
            id="question"
            onChange={handleQuestionChange}
            value={userData.question}
          />
        </div>
        <div className="form-group">
          <label htmlFor="option1">Option 1:</label>
          <input
            className="form-control inputarea"
            placeholder="Enter Your Option Here..."
            type="text"
            id="option1"
            onChange={handleOptionChange}
            value={userData.options.option1}
          />
        </div>
        <div className="form-group">
          <label htmlFor="option2">Option 2:</label>
          <input
            className="form-control inputarea"
            placeholder="Enter Your Option Here..."
            type="text"
            id="option2"
            onChange={handleOptionChange}
            value={userData.options.option2}
          />
        </div>
        <div className="form-group">
          <label htmlFor="option3">Option 3:</label>
          <input
            className="form-control inputarea"
            placeholder="Enter Your Option Here..."
            type="text"
            id="option3"
            onChange={handleOptionChange}
            value={userData.options.option3}
          />
        </div>
        <div className="form-group">
          <label htmlFor="option4">Option 4:</label>
          <input
            className="form-control inputarea"
            placeholder="Enter Your Option Here..."
            type="text"
            id="option4"
            onChange={handleOptionChange}
            value={userData.options.option4}
          />
        </div>
        <div className="form-group">
          <label htmlFor="correct-answer">Correct Option:</label>
          <input
            type="number"
            min="1"
            max="4"
            className="form-control inputarea"
            placeholder="Set The Correct Answer Here"
            id="correct-answer"
            onChange={handleCorrectOptionChange}
            value={userData.correctOption}
          />
        </div>
        <div className="form-group">
          <label htmlFor="total-limit">Total Limit:</label>
          <input
            className="form-control inputarea"
            placeholder="Define your limit..."
            type="number"
            id="total-limit"
            min="1"
            max="100"
            onChange={handleTotalLimitChange}
            value={userData.totalLimit}
          />
        </div>
        <div className="form-group">
          <label htmlFor="comment">Comment:</label>
          <input
            className="form-control inputarea"
            placeholder="Enter Your Comments Here"
            type="text"
            id="comment"
            onChange={handleCommentChange}
            value={userData.comment}
          />
        </div>
        <button type="submit">Upload</button>
      </form>
      {latestData.question && (
        <div id="latestFetchedData">
          <h3>Latest Uploaded Data:</h3>
          <p>Question: {latestData.question}</p>
          <p>Option 1: {latestData.options.option1}</p>
          <p>Option 2: {latestData.options.option2}</p>
          <p>Option 3: {latestData.options.option3}</p>
          <p>Option 4: {latestData.options.option4}</p>
          <p>Correct Option: {latestData.correctOption}</p>
          <p>Comment: {latestData.comment}</p>
          <p>Total Limit: {latestData.totalLimit}</p>
        </div>
      )}
      {error && <p>Error uploading question. Please try again.</p>}
      <LatestData latestData={latestData} />
    </div>
  );
};
export default UploadForm;
