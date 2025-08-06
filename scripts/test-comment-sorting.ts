// Test script for TikTok-like comment sorting algorithm

interface TestComment {
  id: string;
  content: string;
  likeCount: number;
  dislikeCount: number;
  replies: any[];
  createdAt: string;
}

// TikTok-like comment sorting algorithm (copied from db-utils.ts)
function sortCommentsTikTokStyle(comments: TestComment[]) {
  return comments.sort((a, b) => {
    // Calculate engagement score for each comment
    const scoreA = calculateCommentScore(a);
    const scoreB = calculateCommentScore(b);
    
    // Primary sort by engagement score (descending)
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    
    // Secondary sort by recency (newer comments get slight boost)
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    const timeDiff = timeA - timeB;
    
    // If comments are within 1 hour of each other, newer gets slight boost
    if (Math.abs(timeDiff) < 60 * 60 * 1000) {
      return timeDiff;
    }
    
    // Otherwise, stick with engagement score order
    return 0;
  });
}

// Calculate engagement score similar to TikTok's algorithm
function calculateCommentScore(comment: TestComment) {
  const now = new Date().getTime();
  const commentTime = new Date(comment.createdAt).getTime();
  const hoursSinceCreation = (now - commentTime) / (1000 * 60 * 60);
  
  // Base engagement metrics
  const likes = comment.likeCount || 0;
  const dislikes = comment.dislikeCount || 0;
  const replies = comment.replies?.length || 0;
  
  // Calculate net engagement (likes - dislikes)
  const netEngagement = likes - dislikes;
  
  // Time decay factor (comments lose relevance over time)
  const timeDecay = Math.pow(0.95, hoursSinceCreation / 24); // 5% decay per day
  
  // Engagement velocity (how quickly the comment gained engagement)
  const engagementVelocity = netEngagement / Math.max(hoursSinceCreation, 1);
  
  // Reply bonus (comments that spark discussion get higher scores)
  const replyBonus = replies * 2;
  
  // Controversy factor (comments with both likes and dislikes get slight boost)
  const controversyFactor = Math.min(likes, dislikes) * 0.5;
  
  // Final score calculation
  const baseScore = netEngagement + replyBonus + controversyFactor;
  const timeAdjustedScore = baseScore * timeDecay;
  const velocityBoost = engagementVelocity * 10;
  
  return timeAdjustedScore + velocityBoost;
}

// Test data
const testComments: TestComment[] = [
  {
    id: '1',
    content: 'Old comment with high engagement',
    likeCount: 50,
    dislikeCount: 5,
    replies: [{}, {}, {}],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: '2',
    content: 'New comment with low engagement',
    likeCount: 2,
    dislikeCount: 0,
    replies: [],
    createdAt: new Date().toISOString(), // Just now
  },
  {
    id: '3',
    content: 'Recent comment with medium engagement',
    likeCount: 15,
    dislikeCount: 2,
    replies: [{}],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: '4',
    content: 'Controversial comment',
    likeCount: 20,
    dislikeCount: 18,
    replies: [{}, {}],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
  },
];

console.log('Testing TikTok-like comment sorting algorithm...\n');

console.log('Original order:');
testComments.forEach((comment, index) => {
  const score = calculateCommentScore(comment);
  console.log(`${index + 1}. "${comment.content}" - Score: ${score.toFixed(2)}`);
});

console.log('\nSorted order:');
const sortedComments = sortCommentsTikTokStyle([...testComments]);
sortedComments.forEach((comment, index) => {
  const score = calculateCommentScore(comment);
  console.log(`${index + 1}. "${comment.content}" - Score: ${score.toFixed(2)}`);
});

console.log('\nAlgorithm test completed successfully!'); 