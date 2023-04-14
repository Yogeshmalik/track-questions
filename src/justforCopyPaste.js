my latest updated github repo for reference: https://github.com/Yogeshmalik/track-questions 
my firebase realtime database: https://console.firebase.google.com/u/1/project/track-questions/database/track-questions-default-rtdb/data/~2F

i did not ask for the explanation, i asked to re-write(nothing else) the final updated UploadForm.js components using the following instructions: 

import React, { useCallback, useState } from "react";
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
  });
  const [latestData, setLatestData] = useState({});
  // const [totalLimit, setTotalLimit] = useState(100);

  const newQuestion = async () => {
    try {
      const newQuestionRef = dbRef.child("questions").push();
      const newQuestion = {
        question: userData.question.trim(),
        option1: userData.options.option1.trim(),
        option2: userData.options.option2.trim(),
        option3: userData.options.option3.trim(),
        option4: userData.options.option4.trim(),
        timesUsed: 0,
        timesRemaining: parseInt(userData.timesRemaining),
        totalLimit: parseInt(userData.totalLimit),
        createdAt: firebase.database.ServerValue.TIMESTAMP,
      };
      await newQuestionRef.set(newQuestion);
      setUserData({
        question: "",
        options: { option1: "", option2: "", option3: "", option4: "" },
        timesUsed: "",
        timesRemaining: "",
        totalLimit: "",
      });
    } catch (error) {
      console.error(error);
      setError("Error uploading question. Please try again.");
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleTextChange = (event) => {
    setText(event.target.value);
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
      alert("Questions uploaded successfully!");
    } catch (error) {
      console.error(error);
      setError("Error uploading questions. Please try again.");
    }
  };

  const parseFile = async (file) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = (event) => {
        const content = event.target.result;
        let questions;
        if (file.name.endsWith(".csv")) {
          questions = parseCSV(content);
        } else {
          questions = parseText(content);
        }
        resolve(questions);
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      reader.readAsText(file);
    });
  };

  const parseCSV = (text) => {
    const results = Papa.parse(text, { header: true });
    return results.data.map((item) => {
      return {
        text: item.question,
        options: [item.option1, item.option2, item.option3, item.option4],
        remainingUsage: 100,
        lastUsed: null,
      };
    });
  };

  const parseText = (text) => {
    const lines = text.trim().split("\n");
    const questions = lines.map((line) => {
      const [questionText, ...options] = line.trim().split(",");
      return {
        text: questionText.trim(),
        options: options.map((option) => option.trim()),
        remainingUsage: 100,
        lastUsed: null,
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

  const handleOptionChange = (optionNumber) => (event) => {
    setUserData({
      ...userData,
      options: {
        ...userData.options,
        [`option${optionNumber}`]: event.target.value,
      },
    });
  };

  const handleNumericChange = (name) => (event) => {
    setUserData({ ...userData, [name]: event.target.value });
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <p className="drag-drop-select">
            Drag and drop a file here, or click HERE to select a file
          </p>
        </div>
        <textarea
          placeholder="ENTER YOUR QUESTION HERE..."
          className="inputarea"
          value={text}
          onChange={handleTextChange}
        />
        <div className="options-container">
          <label>
            Option 1:
            <input
              type="text"
              value={userData.options.option1}
              onChange={handleOptionChange(1)}
            />
          </label>
          <label>
            Option 2:
            <input
              type="text"
              value={userData.options.option2}
              onChange={handleOptionChange(2)}
            />
          </label>
          <label>
            Option 3:
            <input
              type="text"
              value={userData.options.option3}
              onChange={handleOptionChange(3)}
            />
          </label>
          <label>
            Option 4:
            <input
              type="text"
              value={userData.options.option4}
              onChange={handleOptionChange(4)}
            />
          </label>
        </div>
        <div className="numeric-inputs-container">
          <label>
            Times used:
            <input
              type="number"
              value={userData.timesUsed}
              onChange={handleNumericChange("timesUsed")}
            />
          </label>
          <label>
            Times remaining:
            <input
              type="number"
              value={userData.timesRemaining}
              onChange={handleNumericChange("timesRemaining")}
            />
          </label>
          <label>
            Total limit:
            <input
              type="number"
              value={userData.totalLimit}
              onChange={handleNumericChange("totalLimit")}
            />
          </label>
        </div>
        <button type="submit">UPLOAD</button>

        {error && <p className="errorMsg">{error}</p>}
      </form>
    </>
  );
};

export default UploadForm;

the above code is not uploading the questions(and other things) to firebase database and later not retrieving the latest uploaded question under the form. modify the code and make it work. Just write the final updated code for UploadForm.js without explanation. Im giving you generated code, finish the code without reapeating whats already written:

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
  });
  const [latestData, setLatestData] = useState({});

  const newQuestion = async () => {
    try {
      const newQuestionRef = dbRef.child("questions").push();
      const newQuestion = {
        question: userData.question.trim(),
        option1: userData.options.option1.trim(),
        option2: userData.options.option2.trim(),
        option3: userData.options.option3.trim(),
        option4: userData.options.option4.trim(),
        timesUsed: 0,
        timesRemaining: parseInt(userData.timesRemaining),
        totalLimit: parseInt(userData.totalLimit),
        createdAt: firebase.database.ServerValue.TIMESTAMP,
      };
      await newQuestionRef.set(newQuestion);
      setUserData({
        question: "",
        options: { option1: "", option2: "", option3: "", option4: "" },
        timesUsed: "",
        timesRemaining: "",
        totalLimit: "",
      });
    } catch (error) {
      console.error(error);
      setError("Error uploading question. Please try again.");
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleTextChange = (event) => {
    setText(event.target.value);
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
          question: userData.question.trim(), /* text was replaced by question (text: user...) */
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
      alert("Questions uploaded successfully!");
    } catch (error) {
      console.error(error);
      setError("Error uploading questions. Please try again.");
    }
  };

  const parseFile = async (file) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = (event) => {
        const content = event.target.result;
        let questions;
        if (file.name.endsWith(".csv")) {
          questions = parseCSV(content);
        } else {
          questions = parseText(content);
        }
        resolve(questions);
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      reader.readAsText(file);
    });
  };
const parseCSV = (text) => {
  const results = Papa.parse(text, { header: true });
  return results.data.map((item) => {
    return {
      question: item.question.trim(),
options: [
item.option1.trim(),
item.option2.trim(),
item.option3.trim(),
item.option4.trim(),
],
remainingUsage: parseInt(item.remainingUsage),
lastUsed: null,
};
});
};

const parseText = (text) => {
const questions = text
.split(/\r?\n/)
.filter((line) => line.trim())
.map((line) => {
const [question, option1, option2, option3, option4, remainingUsage] =
line.split("|").map((item) => item.trim());
return {
question: question.trim(),
options: [option1.trim(), option2.trim(), option3.trim(), option4.trim()],
remainingUsage: parseInt(remainingUsage),
lastUsed: null,
};
});
return questions;
};

const uploadQuestions = async (questions) => {
  try {
    const questionsRef = dbRef.child("questions");
    const updates = {};
    questions.forEach((question) => {
      const newQuestionRef = questionsRef.push();
      updates[newQuestionRef.key] = question;
    });
    await questionsRef.update(updates);
  } catch (error) {
    console.error(error);
    setError("Error uploading questions. Please try again.");
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
  const userDataRef = firebase.database().ref("userData");
  const newUserDataRef = userDataRef.push();
  const newUserData = {
    email: "",
    createdAt: firebase.database.ServerValue.TIMESTAMP,
    latestQuestionId: latestData ? latestData.id : null,
  };
  await newUserDataRef.set(newUserData);
};

const handleInputChange = (event) => {
  const { name, value } = event.target;
  setUserData((prevUserData) => ({
    ...prevUserData,
    [name]: value.trim(),
  }));
};

const handleOptionChange = (event) => {
  const { name, value } = event.target;
  setUserData((prevUserData) => ({
    ...prevUserData,
    options: {
      ...prevUserData.options,
      [name]: value.trim(),
    },
  }));
};
const handleNumericChange = (name) => (event) => {
    setUserData({ ...userData, [name]: event.target.value });
  };

  return (
    <>
      <form className="upload-form" onSubmit={handleSubmit}>
      <h2>Upload Questions</h2>
      <div className="dropzone-container" {...getRootProps()}>
        <input {...getInputProps()} />
        {file ? (
          <p>{file.name}</p>
        ) : (
          <p className="drag-drop-select">
            Drag and drop a file here, or click HERE to select a file
          </p>
          )}
        </div>
        <textarea
          placeholder="ENTER YOUR QUESTION HERE..."
          className="inputarea"
          value={text}
          onChange={handleTextChange}
        />
        <div className="options-container">
          <label>
            Option 1:
            <input
              type="text"
              value={userData.options.option1}
              onChange={handleOptionChange(1)}
            />
          </label>
          <label>
            Option 2:
            <input
              type="text"
              value={userData.options.option2}
              onChange={handleOptionChange(2)}
            />
          </label>
          <label>
            Option 3:
            <input
              type="text"
              value={userData.options.option3}
              onChange={handleOptionChange(3)}
            />
          </label>
          <label>
            Option 4:
            <input
              type="text"
              value={userData.options.option4}
              onChange={handleOptionChange(4)}
            />
          </label>
        </div>
        <div className="numeric-inputs-container">
          <label>
            Times used:
            <input
              type="number"
              value={userData.timesUsed}
              onChange={handleNumericChange("timesUsed")}
            />
          </label>
          <label>
            Times remaining:
            <input
              type="number"
              value={userData.timesRemaining}
              onChange={handleNumericChange("timesRemaining")}
            />
          </label>
          <label>
            Total limit:
            <input
              type="number"
              value={userData.totalLimit}
              onChange={handleNumericChange("totalLimit")}
            />
          </label>
        </div>
        <button type="submit">UPLOAD</button>

        {error && <p className="errorMsg">{error}</p>}
        {/* the data entered below this line is unfinished and you must use chatg to finish it
        and accordingly remove faaaltu things from the final return statement of UploadFrom */}
        <div className="text-container">
        <label htmlFor="question">Question</label>
        <input
          type="text"
          id="question"
          name="question"
          value={userData.question}
          onChange={(e) =>
            setUserData({ ...userData, question: e.target.value })
          }
        />
      </div>
      <div className="options-container">
        <div className="option">
          <label htmlFor="option1">Option 1</label>
          <input
            type="text"
            id="option1"
            name="option1"
            value={userData.options.option1}
            onChange={(e) =>
              setUserData({
                ...userData,
                options: { ...userData.options, option1: e.target.value },
              })
            }
          />
        </div>
        <div className="option">
          <label htmlFor="option2">Option 2</label>
          <input
            type="text"
            id="option2"
            name="option2"
            value={userData.options.option2}
            onChange={(e) =>
              setUserData({
                ...userData,
                options: { ...userData.options, option2: e.target.value },
              })
            }
          />
        </div>
        <div className="option">
          <label htmlFor="option3">Option 3</label>
          <input
            type="text"
            id="option3"
            name="option3"
            value={userData.options.option3}
            onChange={(e) =>
              setUserData({
                ...userData,
                options: { ...userData.options, option3: e.target.value },
              })
            }
          />
        </div>
        <div className="option">
          <label htmlFor="option4">Option 4</label>
          <input
            type="text"
            id="option4"
            name="option4"
            value={userData.options.option4}
            onChange={(e) =>
              setUserData({
                ...userData,
                options: { ...userData.options, option4: e.target.value },
              })
            }
          />
        </div>
      </div>
      <div className="usage-container">
        <div className="times-used">
          <label htmlFor="timesUsed">Times Used</label>
          <input
            type="text"
            id="timesUsed"
            name="timesUsed"
            value={userData.timesUsed}
            onChange={(e) =>
              setUserData({ ...userData, timesUsed: e.target.value })
            }
          />
        </div>
        <div className="times-remaining">
          <label htmlFor="timesRemaining">Times Remaining</label>
          <input
            type="text"
            id="timesRemaining"
            name="timesRemaining"
            value={userData.timesRemaining}
            onChange={(e) =>
              setUserData





              
      </form>
    </>
  );
};

export default UploadForm;