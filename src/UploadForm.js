// To create the form component in React, you could use a library like react-dropzone
// or react-file-input to simplify the file upload process.
// Here's an example of how you could create a file upload component using react-dropzone:

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
// import firebase from "firebase/app";
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

import "firebase/firestore";
import 'firebase/storage';

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [error, setError] = useState(null);

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
      questions = parseText(text);
    }
    try {
      await uploadQuestions(questions);
      alert("Questions uploaded successfully!");
    } catch (error) {
      console.error(error);
      setError("Error uploading questions. Please try again.");
    }
  };
  /* parseText, parseFile, uploadQuestions */

  const parseFile = async (file) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = (event) => {
        const content = event.target.result;
        const questions = parseText(content);
        resolve(questions);
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      reader.readAsText(file);
    });
  };

  const parseText = (text) => {
    const lines = text.trim().split("\n");
    const questions = lines.map((line) => ({
      text: line.trim(),
      remainingUsage: 100,
      lastUsed: null,
    }));
    return questions;
  };

  const uploadQuestions = async (questions) => {
    const db = firebase.firestore();
    for (const question of questions) {
      await db.collection("questions").add(question);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <p>Drag and drop a file here, or click to select a file</p>
      </div>
      <textarea value={text} onChange={handleTextChange} />
      {error && <p>{error}</p>}
      <button type="submit">Upload</button>
    </form>
  );
};

export default UploadForm;
