// import { getAnalytics } from "firebase/analytics";
// import { getStorage } from "firebase/storage";
// import { initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/database";

const firebaseConfig = {
  apiKey: "AIzaSyBX8KTobRdoK4B5bmn65PutFXrMI0-CL2s",
  authDomain: "track-questions.firebaseapp.com",
  databaseURL:
    "https://track-questions-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "track-questions",
  storageBucket: "track-questions.appspot.com",
  messagingSenderId: "645079332384",
  appId: "1:645079332384:web:417e36e1bc06aebb41ae45",
  measurementId: "G-RMBMP4NXP2",

  type: "service_account",
  project_id: "track-questions",
  private_key_id: "7e888000a7e85c7fae3d5b7d206d9e3b341c584c",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC76ffmWGrpwdVb\nYAEev/vMv5cCDRIweoNOILcOe7OZ3zoV5CwGAL0fxk1Y6tVbSStzdo3pjEpRSW/1\nEzFhtdD6de4Ln9bVKS9kXiiouqK8T6d9QyPU3QvR8llerZywD8kUOjgVuxHK0yiv\nPP37t3c5znnDKF8d+m8cfgy9f/SP1/P5o10CDSf4judyjt9rfmVTMPdybpEW8/t5\nELkZ63Lio0jYOQqJRdv4iZdEK7CFTlJN4zbrLDiNg5+sec8rj35tSZMMSWzQvjlU\nLGEtgZe9E38zjxxvFImECt/BTuwV8Wt9+V9QHhiTc/G6GVAQCcvqyDSThb5gHghH\nJuuLPmAdAgMBAAECggEALoJLiXbzyzRe1rVNwasZqsT2nprWmCoSapldRVfnjVt7\nGGT3Ymr3ZDBj/3Br6yKSfwrmN9oxoKnQ7HLaI4lpFjxu9PCULwD5ClnlrVE4Kux6\nE141NZ+aJ9XYOb81izv09C0uqW46Cp21sZ2ibRUtDKEmcN+CnzxXGNG33IUZZipL\nfbbs/nr8d+FDrcniGoCL5ZS6xavhOwvR93dCb8wkEqTLxi29gOGMfDFkMF/AL2yT\nodnlZzVCYVcKGFYCLeOJwnuKmQ0jeu24OaZm3vjLuG7lvpgSHkTIT+4wTRSkBbdJ\nRDz07I81TeMtsSOzbiRTpBdYUOg0P2c8gfW6zE+QvwKBgQDte36kwCqyaCoZHs1L\n54MKW/81dBdvEWWdXhWoW+rdii4ueDrQslfCWLhEGXQFQ0nQM9Wj9Rq+h4h44P3R\nTKGQHx92tOGcvZb2FH7NddlpFyZjtdPgwLDP7UOTjnL9Flw4nmx6DdyT6UDmvuep\n5PRJWH+UX2Q0AYpxkqh/t6yRxwKBgQDKkQNB7/1SZRU6zKgxGQN8I25DJrGdkXmd\nCJkzHZZ2wzBK6hj7dxkR7zShVVjQsvgD9heXiVcPb0h8nz6O3cIRqGVriVp324RU\nY/3WrTjbeonLEExns30mN2+5jSTQxvNJTsQfs35GbNBKYeRwpPng2XaF0701byoH\nY5TD4Fj++wKBgQCynN5sdSfn1RZMnHEV9MMHKJgzEOSLIc+GY3vwi2mDRGllhAHg\nczI0NtwoQ+iSCMDceg/l5/Q8dt165OWh5HvjVLUqZ/MEG0gOPu38A/YH52R1PA1m\njiatzCq2MT5lActMvkKiLgjHqnio086TZmMhQxF5e6F2x+3ja8WVgYSmgwKBgEgq\naXKwQRt9j5anGrSDKM6tALdDrbto/F6Jlaq0O8qLt0S5KbVMtM3C3okrkrynRdyD\na9w8vZtuFfDv+qWDM4R+7cLl6CkTN42pIeG9TKhEe5qwb8fyFf/reA4uzpLijgHr\n4cs5cx873Oji/zNyUuNcFfGPgbTrqZmATJuL7ajJAoGBANcXRjMfInZOPJl3c5bt\nWSZnuw4O5shyIuPeGvdJrUmH4iyrgyQHW8lWaGXWTGlBMVACSNGYsrXFi3N+Y0Zn\nGEW7rtNwHhM1vWi6uwmgu960znPGNrk40BIMSrLzvLPHt0hVOiGbS+tvqbw6R4BE\nWXJdQ3ZE7FYZ1fH16m/39f4V\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-f2bm9@track-questions.iam.gserviceaccount.com",
  client_id: "106232032029776949994",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-f2bm9%40track-questions.iam.gserviceaccount.com",
};
const fbConfig = firebase.initializeApp(firebaseConfig);
const dbRef = firebase.database(fbConfig).ref("questionRecords");

export { dbRef, firebaseConfig };
// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// export const storage = getStorage(app);

// const db = firebase.firestore();
// const database = firebase.database();
// export default firebaseConfig;
