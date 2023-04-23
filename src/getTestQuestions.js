import firebase from "firebase/compat/app";
import "firebase/firestore";

const GetTestQuestions = async () => {
  const db = firebase.firestore();
  const snapshot = await db
    .collection("questions")
    .where("remainingUsage", ">", 0)
    .orderBy("lastUsed", "asc")
    .limit(120)
    .get();
  const questions = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    questions.push({
      id: doc.id,
      text: data.text,
      remainingUsage: data.remainingUsage - 1,
      lastUsed: new Date(),
    });
  });
  await updateQuestions(questions);
  return questions;
};

export const updateQuestions = async (questions) => {
  const db = firebase.firestore();
  const batch = db.batch();
  for (const question of questions) {
    const ref = db.collection("questions").doc(question.id);
    batch.update(ref, {
      remainingUsage: question.remainingUsage,
      lastUsed: question.lastUsed,
    });
  }
  await batch.commit();
};

export default GetTestQuestions;
/* This code retrieves a random subset of questions that have a remaining usage greater than 0,
ordered by their last usage timestamp in ascending order, and limited to 120 questions.
It then updates the usage limit and timestamp for each question in the batch.
Again, this is just a basic example, and you will need to customize it to fit your specific requirements.*/
