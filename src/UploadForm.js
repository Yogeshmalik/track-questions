// To create the form component in React, you could use a library like react-dropzone 
// or react-file-input to simplify the file upload process. 
// Here's an example of how you could create a file upload component using react-dropzone:

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import firebase from 'firebase/app';
import 'firebase/firestore';
import parseFile from './parseFile';
import uploadQuestions from './uploadQuestions'

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback(acceptedFiles => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    try {
      const questions = await parseFile(file);
      await uploadQuestions(questions);
      alert('File uploaded successfully!');
    } catch (error) {
      console.error(error);
      setError('Error uploading file. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <p>Drag and drop a file here, or click to select a file</p>
      </div>
      {error && <p>{error}</p>}
      <button type="submit">Upload</button>
    </form>
  );
};
export default UploadForm;

// const parseFile = async file => {
//   // Write code to parse the file and return an array of questions
// };

// const uploadQuestions = async questions => {
//   const db = firebase.firestore();
//   for (const question of questions) {
//     await db.collection('questions').add({
//       text: question.text,
//       remainingUsage: 100,
//       lastUsed: null
//     });
//   }
// };
