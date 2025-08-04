const fs = require('fs');
const path = require('path');

const dbUtilsPath = path.join(__dirname, '../src/lib/db-utils.ts');

async function optimizeConfessionById() {
  console.log('🔧 Optimizing getConfessionById function...');
  
  try {
    let content = fs.readFileSync(dbUtilsPath, 'utf8');
    
    // Find and replace the getConfessionById function
    const oldFunction = `export async function getConfessionById(confessionId: string, userId?: string) {
  try {
    const confession = await prisma.confession.findUnique({
      where: { 
        id: confessionId,
        isHidden: false 
      },
      include: {
        author: {
          select: { id: true, name: true, image: true, university: true },
        },
        university: {
          select: { id: true, name: true },
        },
        votes: {
          select: { voteType: true },
        },
        _count: {
          select: {
            comments: true,
            savedBy: true,
          },
        },
      },
    });

    if (!confession) {
      return null;
    }

    // Calculate vote counts and engagement metrics
    const believeCount = confession.votes.filter(v => v.voteType === 'BELIEVE').length;
    const doubtCount = confession.votes.filter(v => v.voteType === 'DOUBT').length;
    
    // Find user's vote if userId is provided
    const userVote = userId ? confession.votes.find(v => (v as any).userId === userId) : null;
    
    return {
      ...confession,
      believeCount,
      doubtCount,
      commentCount: confession._count.comments,
      savedCount: confession._count.savedBy,
      userVote: userVote ? userVote.voteType : null,
      votes: undefined, // Remove raw votes from response
      _count: undefined,
    };`;

    const newFunction = `export async function getConfessionById(confessionId: string, userId?: string) {
  try {
    const confession = await prisma.confession.findUnique({
      where: { 
        id: confessionId,
        isHidden: false 
      },
      select: {
        id: true,
        title: true,
        content: true,
        authorId: true,
        isAnonymous: true,
        hotScore: true,
        commentCount: true,
        replyCount: true,
        believeCount: true,
        doubtCount: true,
        savedCount: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: { id: true, name: true, image: true, university: true },
        },
        university: {
          select: { id: true, name: true },
        },
        // Only fetch user's vote if userId is provided
        ...(userId && {
          votes: {
            where: { userId },
            select: { voteType: true },
            take: 1,
          },
        }),
      },
    });

    if (!confession) {
      return null;
    }

    // Get user's vote if available
    const userVote = userId && confession.votes ? confession.votes[0]?.voteType || null : null;
    
    return {
      ...confession,
      believeCount: confession.believeCount,
      doubtCount: confession.doubtCount,
      commentCount: confession.commentCount,
      savedCount: confession.savedCount,
      userVote,
      votes: undefined, // Remove raw votes from response
    };`;

    // Replace the function
    if (content.includes(oldFunction)) {
      content = content.replace(oldFunction, newFunction);
      fs.writeFileSync(dbUtilsPath, content, 'utf8');
      console.log('✅ Successfully optimized getConfessionById function!');
      console.log('   - Now uses atomic counters (believeCount, doubtCount)');
      console.log('   - Removed manual vote counting');
      console.log('   - Improved performance with optimized select');
      console.log('   - Consistent with other optimized functions');
    } else {
      console.log('❌ Could not find the exact function to replace');
      console.log('   Please check if the function has been modified');
    }

  } catch (error) {
    console.error('❌ Error optimizing getConfessionById:', error);
  }
}

if (require.main === module) {
  optimizeConfessionById()
    .then(() => {
      console.log('✨ Optimization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Optimization failed:', error);
      process.exit(1);
    });
}

module.exports = optimizeConfessionById; 