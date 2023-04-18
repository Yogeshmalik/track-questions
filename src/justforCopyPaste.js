examine my latest updated GitHub repo for reference : https://github.com/Yogeshmalik/track-questions  and
my firebase realtime database for reference: https://console.firebase.google.com/u/1/project/track-questions/database/track-questions-default-rtdb/data/~2F 

Don't explain the code. Your task: not able to upload anything. find bugs and fix them. after that im not able to fetch the latest uploaded questions(including comment, correctOption(or Answer: ) etc.) from firebase realtime database(and keep showing them on my homescreen even if i reload the page or until i upload a new question[and other fields] and then replace it(on the home screen) with new one to be fetched on the dedicated fields) and i have already wrote dedicated field( <div>       {latestData && ( <div> ...  <p>Comment: latestData.comment}</p>  </div>  )} ) in return statement but still not able to fetch question(and other fields). additionally, modify/remove the things which are not needed from my UploadForm() without affecting my react application of uploading and retrieving questions from firebase database. don't write the whole UploadForm function code; just write only the modified/removed lines/functions parts(e.g. modified return, modified handleSubmit, modified newQuestion etc.) with comments:
use above instructions/tasks for the code below:




  
  