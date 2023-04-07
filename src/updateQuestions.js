import React from 'react'

export const updateQuestions = async questions => {
    const db = firebase.firestore();
    const batch = db.batch();
    for (const question of questions) {
      const ref = db.collection('questions').doc(question.id);
      batch.update(ref, {
        remainingUsage: question.remainingUsage,
        lastUsed: question.lastUsed
      });
    }
    await batch.commit();
  };

export default updateQuestions