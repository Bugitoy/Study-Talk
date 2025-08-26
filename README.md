Study-Talk is an online website that contains 4 different pages each with their own unique features:

Overview:

1. First webpage called the Study Groups page allows students to study together by joining online video call study groups, track time studied by
an individual, users can also track their time on a leaderboard with the students with the most amount of hours studied in a day and in a
week being awarded medals. Users can also view rooms that have been created and set as public by the
room creator. While creating the room, the host can set the maximum number of participants allowed in
their room, whether the participants should have their mics on or off, same with  camera and also
whether the room should be displayed publicly on the weboage to allow random strangers to join.

2.  Second webpage access by clicking the Read Confessions option on the meetups page allows students all
over the world to make confessions post about the various activities they have done while at college,
press the believers button if a student believes the confession or the non believer button if they do not
believe the post, make comments, share posts on various other platforms like Facebook, whatsapp or
twitter, save a post and even report it if user feels as though it goes against the policies governed
by the website. The webpage also has a section to display the hottest post of the week, filter posts
by universities, save post and also view posts the user has made in the past.

3. Third webpage accessed by clicking the compete button allows users to join a random video call,
   create a video call or join a certain video call. However, it differs from the first page as this
   one allows users to compete by answering questions on various topics like minecraft to calculus in
   a video call environment allowing users to rank each other according to how many correct answers
   they achieved at the end of the quiz. This was inspired by Kahoot, an online quiz platform. However,
   Kahoot doesn't have video call implementation so I decided to implement my improved version of it.
   While making the video room, hosts can choose the topics the questions will be derived from, or
   even make their own questions. In addition, they can choose the time each participant is allowed to
   answer each question, how many questions will be asked, whether the participants mics should be on
   or off, whether the participants camera should be on or off, as well as whether the video call
   should be publicly accessible to other strangers or not.
   
4. The last webpage can be accessed by clicking the Talk button. This is an omegle styled video call which
   allows students to talk to random other students currently on the website. This works by using Redis'
   extremely low latency tech stack as well as docker containerisation with a separated socket-io server
   running to power this page.

   This is an implementation I am overwhelmingly proud of as I had to learn to
   implement a serverless pipeline using prisma, Next.js as well as implementing a separate websocket server
   using socket-io dockerized with redis for very fast caching.

Pictures of how it works:

Home Page:

<img width="50" height="100" alt="Image" src="https://github.com/user-attachments/assets/d5ae60f3-f047-4516-a79a-475a064dc24b" />

<img width="1148" height="1300" alt="Homepage-bottom" src="https://github.com/user-attachments/assets/14d16dc2-b099-449f-97b2-01d273bb4fa0" />

Meetups Page:

<img width="1163" height="1318" alt="meetups" src="https://github.com/user-attachments/assets/280e41f2-bd2b-46ba-86d7-f603b166a023" />

Pricing Page:

<img width="1148" height="1317" alt="pricingPage" src="https://github.com/user-attachments/assets/2cddc1f8-0bc3-4691-9dce-e1deda54e653" />

<img width="1148" height="1318" alt="PricingPage-middle" src="https://github.com/user-attachments/assets/c1916990-df9b-43e1-bd40-066109405db8" />

<img width="1144" height="1317" alt="PricingPage-bottom" src="https://github.com/user-attachments/assets/bb786ea3-7e9a-43d7-ae65-ffaf7a467448" />

About Page:

<img width="1150" height="1319" alt="AboutPage" src="https://github.com/user-attachments/assets/9c6e608a-4ac5-4bb2-92c4-762a46e7629c" />

<img width="1148" height="1317" alt="AboutPage-middle" src="https://github.com/user-attachments/assets/c2feff79-fa58-4d54-8771-f6b1c062f7bf" />

<img width="1148" height="1317" alt="AboutPage-bottom" src="https://github.com/user-attachments/assets/0ad4d74c-9a66-43da-a569-56bdb0ebcc88" />

Account Page:

<img width="1161" height="1317" alt="AccountPage" src="https://github.com/user-attachments/assets/c00b9fad-81e2-41ac-9691-86c3c0a2b5fd" />

Login Page:

<img width="1163" height="1318" alt="loginPage" src="https://github.com/user-attachments/assets/8b070a4a-5851-46dc-b61b-8d719a7337bc" />

Sign In Page:

<img width="1163" height="1319" alt="signin" src="https://github.com/user-attachments/assets/ace8cde0-e482-40b9-9676-5cd849b63fa1" />

Study Groups Page:

<img width="365" height="813" alt="Screenshot 2025-08-25 222155" src="https://github.com/user-attachments/assets/636626d5-5dec-4c3e-9c4f-f797ed29e39b" />

<img width="555" height="809" alt="Screenshot 2025-08-25 222139" src="https://github.com/user-attachments/assets/3dbc2588-c304-44ec-9624-7c7b41358594" />

<img width="1254" height="885" alt="Screenshot 2025-08-25 155155" src="https://github.com/user-attachments/assets/24714fcb-c6e1-416c-bd28-80ff3f15e6a1" />

<img width="1160" height="1319" alt="Study-Group-Page" src="https://github.com/user-attachments/assets/5938d79b-ec55-4ab1-abe2-64a849982a93" />

<img width="1901" height="926" alt="meetingroom" src="https://github.com/user-attachments/assets/ece71bb2-6915-4f11-9e50-1eadedc8a8d2" />

Leaderboard Page:

<img width="1228" height="928" alt="leaderboard" src="https://github.com/user-attachments/assets/b0a7df52-bee1-43bb-b243-9a9ab7747b95" />

Compete Page:

<img width="926" height="928" alt="CompetePage" src="https://github.com/user-attachments/assets/c84473c2-557b-48b4-8bfa-e57a788408d1" />

<img width="1321" height="929" alt="compete-page-create-room1" src="https://github.com/user-attachments/assets/841d8024-405e-4135-8a81-cad74868e672" />

<img width="1713" height="1315" alt="compete-create-room" src="https://github.com/user-attachments/assets/f8c50683-f2c7-4788-975e-3ef09758d356" />

<img width="904" height="824" alt="create-quiz" src="https://github.com/user-attachments/assets/e1d87d1f-62fe-42a8-84f7-77aa66f550cf" />

<img width="1717" height="1319" alt="choose-a-Topic" src="https://github.com/user-attachments/assets/86f345cb-c22e-4c39-b78e-42eebf0d92bd" />

<img width="1717" height="1316" alt="quizLibrary" src="https://github.com/user-attachments/assets/22fae118-06ca-4233-a012-9f5cd46b0bec" />

<img width="1736" height="922" alt="setupPage" src="https://github.com/user-attachments/assets/38d30a47-0e96-444c-b251-d807f1f77f5a" />

<img width="1738" height="927" alt="quizroom" src="https://github.com/user-attachments/assets/9ac2d029-9cd0-4565-9e48-c4adb3e8dd3f" />

<img width="1720" height="920" alt="quiz-questions" src="https://github.com/user-attachments/assets/4535d11a-872d-46e7-84ff-d4b29cd360ed" />

<img width="1319" height="928" alt="quiz-results" src="https://github.com/user-attachments/assets/26a0fa5a-43eb-4d30-8576-1ee9885f411f" />

Confessions Page:

<img width="1145" height="1317" alt="ConfessionsPage" src="https://github.com/user-attachments/assets/cd167503-4dd2-4f02-a777-024a8f394b6e" />

<img width="1718" height="1314" alt="Make a confessions post" src="https://github.com/user-attachments/assets/a005a126-61ce-4949-a0f6-535978edc4a1" />

<img width="1704" height="1317" alt="Confessions-with-Comments" src="https://github.com/user-attachments/assets/3d51e8f2-b4c7-4784-9720-e7202ae5db3c" />

<img width="1147" height="1316" alt="ConfessionsUniversitiesSection" src="https://github.com/user-attachments/assets/1ebd064d-cdc0-4590-bb0f-f09d5945cabb" />

Talk Page:

<img width="941" height="928" alt="talkPage" src="https://github.com/user-attachments/assets/01969c95-4cb4-46fd-b33a-0fddddb29c74" />

<img width="1900" height="928" alt="laptop-talkPage" src="https://github.com/user-attachments/assets/725cc21a-2e4f-42ee-a2fb-6cf319e4bf5a" />

