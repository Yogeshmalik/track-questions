import React, { useCallback, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';

const uploadQuestions = async questions => {
    const db = firebase.firestore();
    for (const question of questions) {
      await db.collection('questions').add({
        text: question.text,
        remainingUsage: 100,
        lastUsed: null
      });
    }
    return (<>Hello{db}</>)
  };
//   return (
//     <div>uploadQuestions</div>
//   )
// }

export default uploadQuestions