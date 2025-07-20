# 🏆 User Reputation System

## Overview

The reputation system is designed to distinguish quality users from spam bots and improve content quality on the confession platform. It uses multiple factors to calculate a comprehensive reputation score and detect suspicious activity patterns.

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

*This reputation system provides a robust foundation for maintaining content quality and community trust while effectively distinguishing between genuine users and automated spam.* 