Study-Talk is an online website that contains 4 different pages each with their own unique features:

## 📖 **Detailed Feature Breakdown**

### **1. Study Groups Page** 📚
**First webpage called the Study Groups page** allows students to study together by joining online video call study groups, track time studied by an individual, users can also track their time on a leaderboard with the students with the most amount of hours studied in a day and in a week being awarded medals. Users can also view rooms that have been created and set as public by the room creator. While creating the room, the host can set the maximum number of participants allowed in their room, whether the participants should have their mics on or off, same with camera and also whether the room should be displayed publicly on the webpage to allow random strangers to join.

### **2. Confessions Page** 💭
**Second webpage** access by clicking the Read Confessions option on the meetups page allows students all over the world to make confessions post about the various activities they have done while at college, press the believers button if a student believes the confession or the non believer button if they do not believe the post, make comments, share posts on various other platforms like Facebook, whatsapp or twitter, save a post and even report it if user feels as though it goes against the policies governed by the website. The webpage also has a section to display the hottest post of the week, filter posts by universities, save post and also view posts the user has made in the past.

### **3. Compete Page** 🏆
**Third webpage** accessed by clicking the compete button allows users to join a random video call, create a video call or join a certain video call. However, it differs from the first page as this one allows users to compete by answering questions on various topics like minecraft to calculus in a video call environment allowing users to rank each other according to how many correct answers they achieved at the end of the quiz. This was inspired by Kahoot, an online quiz platform. However, Kahoot doesn't have video call implementation so I decided to implement my improved version of it. While making the video room, hosts can choose the topics the questions will be derived from, or even make their own questions. In addition, they can choose the time each participant is allowed to answer each question, how many questions will be asked, whether the participants mics should be on or off, whether the participants camera should be on or off, as well as whether the video call should be publicly accessible to other strangers or not.

### **4. Talk Page** 🗣️
**The last webpage** can be accessed by clicking the Talk button. This is an omegle styled video call which allows students to talk to random other students currently on the website. This works by using Redis' extremely low latency tech stack as well as docker containerisation with a separated socket-io server running to power this page.

---

## 🎯 **Technical Implementation Summary**

This is an implementation I am **overwhelmingly proud of** as I had to learn to implement a serverless pipeline using prisma, Next.js as well as implementing a separate websocket server using socket-io dockerized with redis for very fast caching.

---

## 📸 **Pictures of How It Works**

### **Home Page:**

<img width="1148" height="1300" alt="Image" src="https://github.com/user-attachments/assets/d5ae60f3-f047-4516-a79a-475a064dc24b" />

<img width="1148" height="1300" alt="Homepage-bottom" src="https://github.com/user-attachments/assets/14d16dc2-b099-449f-97b2-01d273bb4fa0" />

### **Meetups Page:**

<img width="1163" height="1318" alt="meetups" src="https://github.com/user-attachments/assets/280e41f2-bd2b-46ba-86d7-f603b166a023" />

### **Pricing Page:**

<img width="1148" height="1317" alt="pricingPage" src="https://github.com/user-attachments/assets/2cddc1f8-0bc3-4691-9dce-e1deda54e653" />

### **About Page:**

<img width="1150" height="1319" alt="AboutPage" src="https://github.com/user-attachments/assets/9c6e608a-4ac5-4bb2-92c4-762a46e7629c" />

### **Account Page:**

<img width="1161" height="1317" alt="AccountPage" src="https://github.com/user-attachments/assets/c00b9fad-81e2-41ac-9691-86c3c0a2b5fd" />

### **Login Page:**

<img width="1163" height="1318" alt="loginPage" src="https://github.com/user-attachments/assets/8b070a4a-5851-46dc-b61b-8d719a7337bc" />

### **Sign In Page:**

<img width="1163" height="1319" alt="signin" src="https://github.com/user-attachments/assets/ace8cde0-e482-40b9-9676-5cd849b63fa1" />

### **Study Groups Page:**

<img width="365" height="813" alt="Screenshot 2025-08-25 222155" src="https://github.com/user-attachments/assets/636626d5-5dec-4c3e-9c4f-f797ed29e39b" />

<img width="555" height="809" alt="Screenshot 2025-08-25 222139" src="https://github.com/user-attachments/assets/3dbc2588-c304-44ec-9624-7c7b41358594" />

<img width="1254" height="885" alt="Screenshot 2025-08-25 155155" src="https://github.com/user-attachments/assets/24714fcb-c6e1-416c-bd28-80ff3f15e6a1" />

<img width="1160" height="1319" alt="Study-Group-Page" src="https://github.com/user-attachments/assets/5938d79b-ec55-4ab1-abe2-64a849982a93" />

<img width="1901" height="926" alt="meetingroom" src="https://github.com/user-attachments/assets/ece71bb2-6915-4f11-9e50-1eadedc8a8d2" />

### **Leaderboard Page:**

<img width="1228" height="928" alt="leaderboard" src="https://github.com/user-attachments/assets/b0a7df52-bee1-43bb-b243-9a9ab7747b95" />

### **Compete Page:**

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

### **Confessions Page:**

<img width="1145" height="1317" alt="ConfessionsPage" src="https://github.com/user-attachments/assets/cd167503-4dd2-4f02-a777-024a8f394b6e" />

<img width="1718" height="1314" alt="Make a confessions post" src="https://github.com/user-attachments/assets/a005a126-61ce-4949-a0f6-535978edc4a1" />

<img width="1704" height="1317" alt="Confessions-with-Comments" src="https://github.com/user-attachments/assets/3d51e8f2-b4c7-4784-9720-e7202ae5db3c" />

<img width="1147" height="1316" alt="ConfessionsUniversitiesSection" src="https://github.com/user-attachments/assets/1ebd064d-cdc0-4590-bb0f-f09d5945cabb" />

### **Talk Page:**

<img width="941" height="928" alt="talkPage" src="https://github.com/user-attachments/assets/01969c95-4cb4-46fd-b33a-0fddddb29c74" />

<img width="1900" height="928" alt="laptop-talkPage" src="https://github.com/user-attachments/assets/725cc21a-2e4f-42ee-a2fb-6cf319e4bf5a" />

# 🏆 User Reputation System

My most proudest achievement is the user reputation system which was implemented on the confesssions posts. The reputation system led me to learn about the different ways social media websites create strong and robust algorithms. It is designed to distinguish quality users from spam bots and improve content quality on the confession platform. It uses multiple factors to calculate a comprehensive reputation score and detect suspicious activity patterns.

## 🎯 Key Features

### **Multi-Factor Reputation Scoring**
- **Activity Score (25%)**: Account age, confession count, voting activity, recent engagement
- **Quality Score (35%)**: Average votes received, positive vote ratio, comment engagement, content length
- **Trust Score (40%)**: Report history, account verification, consistent activity, suspicious pattern detection

### **Bot Detection Algorithm**
- **Activity Rate Analysis**: Detects rapid posting patterns
- **Content Repetition**: Identifies duplicate or similar content
- **Timing Patterns**: Detects unnatural posting intervals
- **Engagement Analysis**: Flags accounts with no community interaction
- **Suspicious Patterns**: Identifies generic content and short posts

### **Verification Levels**
- **NEW_USER**: Default for new accounts
- **VERIFIED**: Users with reputation > 200
- **TRUSTED**: Users with reputation > 500
- **SUSPICIOUS**: Users with bot probability > 70%

## 📊 Reputation Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| **LEGENDARY** | 800+ | Top contributors, highly trusted |
| **EXPERT** | 600-799 | Experienced, reliable users |
| **TRUSTED** | 400-599 | Verified, active community members |
| **ACTIVE** | 200-399 | Regular contributors |
| **REGULAR** | 100-199 | Established users |
| **NEW** | 0-99 | New or low-activity users |

## 🔧 Technical Implementation

### Database Schema

```prisma
model User {
  // Reputation fields
  reputationScore    Int @default(0)
  activityScore      Int @default(0)
  qualityScore       Int @default(0)
  trustScore         Int @default(0)
  
  // Activity tracking
  lastActivityAt     DateTime?
  dailyConfessionCount Int @default(0)
  dailyVoteCount      Int @default(0)
  dailyCommentCount   Int @default(0)
  
  // Bot detection
  botProbability     Int @default(0)
  isFlagged          Boolean @default(false)
  verificationLevel   String @default("NEW_USER")
  
  // Audit trail
  reputationHistory  ReputationHistory[]
}

model ReputationHistory {
  id              String @id @default(auto()) @map("_id") @db.ObjectId
  userId          String
  changeType      String
  changeAmount    Int
  reason          String
  previousScore   Int
  newScore        Int
  createdAt       DateTime @default(now())
}
```

### Core Functions

#### `calculateUserReputation(userId: string)`
Calculates comprehensive reputation score based on:
- Activity patterns
- Content quality metrics
- Community trust indicators
- Bot detection analysis

#### `monitorUserActivity(userId: string, action: 'confession' | 'vote' | 'comment')`
Tracks user activity and triggers reputation recalculation every 10 actions.

#### `detectBotActivity(user: User)`
Analyzes user behavior for suspicious patterns:
- High activity rates (>2 confessions/hour)
- Repetitive content detection
- Unnatural timing patterns
- No engagement flags

## 🛡️ Bot Detection Features

### **Activity Rate Monitoring**
```typescript
const activityRate = user.confessions.length / accountAgeHours;
if (activityRate > 2) {
  botScore += 30; // High activity penalty
}
```

### **Content Repetition Detection**
```typescript
// Check for duplicate titles and content
const duplicateTitles = titles.filter((title, index) => 
  titles.indexOf(title) !== index
).length;
```

### **Timing Pattern Analysis**
```typescript
// Detect too-regular intervals (bot-like behavior)
const regularIntervals = intervals.filter(interval => 
  interval > 5000 && interval < 15000
).length;
```

### **Suspicious Pattern Detection**
```typescript
// Check for generic content and short posts
const genericTitles = user.confessions.filter(c => 
  c.title.toLowerCase().includes('test') || 
  c.title.toLowerCase().includes('hello')
).length;
```

## 📈 Reputation Calculation

### Activity Score (Max 1000 points)
- **Account Age**: 1 point per day (max 365)
- **Confession Activity**: 5 points per confession
- **Voting Activity**: 1 point per vote
- **Comment Activity**: 2 points per comment
- **Recent Activity**: 3 points per confession in last 7 days

### Quality Score (Max 1000 points)
- **Average Votes**: 10 points per average vote received
- **Positive Ratio**: Up to 200 points for 100% positive votes
- **Comment Engagement**: 15 points per average comment received
- **Content Length**: Up to 50 points for longer content

### Trust Score (Max 300 points)
- **No Reports**: 100 points bonus
- **Account Verification**: 50 points bonus
- **Consistent Activity**: 50 points bonus
- **No Suspicious Patterns**: 100 points bonus

## 🎨 UI Components

### UserReputationBadge
Displays user reputation and verification status with tooltips showing detailed metrics.

```tsx
<UserReputationBadge 
  userId={user.id} 
  showDetails={true} 
/>
```

### Reputation Colors
- **LEGENDARY**: Purple
- **EXPERT**: Blue  
- **TRUSTED**: Green
- **ACTIVE**: Yellow
- **REGULAR**: Orange
- **NEW**: Gray

## 🔄 Integration Points

### Automatic Reputation Updates
- **Confession Creation**: Triggers activity monitoring
- **Voting**: Updates reputation every 10 votes
- **Commenting**: Tracks engagement patterns
- **Background Processing**: Periodic recalculation

### API Endpoints
- `GET /api/user/reputation/[id]`: Get user reputation data
- Integrated with existing confession and voting APIs

## 🚀 Benefits

### **For Users**
- **Quality Content**: Reputation encourages better contributions
- **Community Trust**: Users can identify reliable sources
- **Recognition**: Achievement system for active contributors

### **For Platform**
- **Spam Prevention**: Bot detection reduces low-quality content
- **Content Quality**: Reputation incentivizes better posts
- **Community Health**: Trust indicators improve user experience

### **For Moderation**
- **Automated Flagging**: Suspicious users are automatically flagged
- **Audit Trail**: Complete history of reputation changes
- **Risk Assessment**: Bot probability helps identify problematic accounts

## 🔧 Maintenance

### Daily Tasks
- Monitor flagged users for manual review
- Check reputation distribution for anomalies
- Review bot detection accuracy

### Weekly Tasks
- Analyze reputation trends
- Adjust scoring weights if needed
- Review false positive/negative rates

### Monthly Tasks
- Comprehensive reputation audit
- Update detection algorithms
- Performance optimization

## 📊 Monitoring & Analytics

### Key Metrics
- **Average Reputation Score**: Platform health indicator
- **Bot Detection Rate**: Effectiveness of spam prevention
- **Reputation Distribution**: User engagement levels
- **False Positive Rate**: Accuracy of bot detection

### Alerts
- High bot probability users (>70%)
- Rapid reputation changes
- Suspicious activity patterns
- System performance issues

## 🛠️ Future Enhancements

### Planned Features
- **Reputation Decay**: Scores decrease over inactivity
- **Community Moderation**: User-powered reputation adjustments
- **Advanced Bot Detection**: Machine learning-based detection
- **Reputation Marketplace**: Gamification elements

### Potential Improvements
- **Real-time Updates**: Live reputation score changes
- **Reputation Challenges**: User engagement activities
- **Reputation Transfer**: Legacy account benefits
- **Reputation Insurance**: Protection against false flags

---

### **Step-by-Step Installation Process**

#### **1. Clone Repository**
```bash
# Clone the main repository
git clone https://github.com/yourusername/study-talk.git

# Navigate to project directory
cd study-talk

# Verify you're in the correct directory
ls -la
```

#### **2. Environment Variables Setup**

Create a `.env` file in the root directory with the following variables:

```bash
# Database Configuration
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/study-talk?retryWrites=true&w=majority"

# Authentication (Kinde)
KINDE_CLIENT_ID="your_kinde_client_id"
KINDE_CLIENT_SECRET="your_kinde_client_secret"
KINDE_ISSUER_URL="https://your-domain.kinde.com"
KINDE_SITE_URL="http://localhost:3000"
KINDE_POST_LOGOUT_REDIRECT_URL="http://localhost:3000"
KINDE_POST_LOGIN_REDIRECT_URL="http://localhost:3000"

# Stream Configuration
STREAM_API_KEY="your_stream_api_key"
STREAM_API_SECRET="your_stream_api_secret"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# WebSocket Server
WEBSOCKET_SERVER_URL="http://localhost:3001"

# Stripe (for premium features)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"

# Email Service (SendGrid)
SENDGRID_API_KEY="your_sendgrid_api_key"
FROM_EMAIL="noreply@studytalk.com"

# Security
JWT_SECRET="your_jwt_secret_key_here"
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"
```

**Required Service Setups:**

**MongoDB Atlas:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and new cluster
3. Create a database user with read/write permissions
4. Get your connection string and replace in DATABASE_URL
5. Add your IP address to the IP Access List

**Stream Account:**
1. Visit [GetStream.io](https://getstream.io/)
2. Create a new app for video calling
3. Copy your API Key and Secret from the dashboard
4. Configure video calling settings in your Stream dashboard

**Kinde Authentication:**
1. Go to [Kinde.com](https://kinde.com/)
2. Create a new application
3. Configure OAuth settings and redirect URLs
4. Copy your Client ID, Secret, and Issuer URL

#### **3. Redis Setup with Docker**

```bash
# Start Redis container
docker run -d \
  --name study-talk-redis \
  -p 6379:6379 \
  redis:7-alpine

# Verify Redis is running
docker ps

# Test Redis connection
docker exec -it study-talk-redis redis-cli ping
# Should return "PONG"

# Optional: Persist Redis data
docker run -d \
  --name study-talk-redis \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7-alpine
```

#### **4. Install Dependencies**

```bash
# Install Node.js dependencies
npm install

# Install additional development dependencies
npm install -D @types/node @types/react @types/react-dom

# Verify installation
npm list --depth=0
```

#### **5. Database Setup**

```bash
# Generate Prisma client
npx prisma generate

# Push database schema to MongoDB
npx prisma db push

# Optional: Seed initial data
npm run seed

# Verify database connection
npx prisma studio
```

#### **6. Start Development Server**

```bash
# Start the main Next.js application
npm run dev

# In a separate terminal, start the WebSocket server
cd websocket
npm install
npm run dev

# Verify both servers are running
# Main app: http://localhost:3000
# WebSocket: http://localhost:3001
```
