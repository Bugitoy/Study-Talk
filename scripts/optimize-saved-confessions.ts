import fs from 'fs';
import path from 'path';

const dbUtilsPath = path.join(__dirname, '../src/lib/db-utils.ts');

async function optimizeSavedConfessions() {
  console.log('🔧 Optimizing getSavedConfessions function...');
  
  try {
    let content = fs.readFileSync(dbUtilsPath, 'utf8');
    
    // Find and replace the getSavedConfessions function
    const oldFunction = `export async function getSavedConfessions(userId: string) {
  try {
    const saved = await prisma.savedConfession.findMany({
      where: { userId },
      include: {
        confession: {
          include: {
            author: {
              select: { id: true, name: true, image: true, university: true },
            },
            university: {
              select: { id: true, name: true },
            },
            votes: {
              select: { voteType: true, userId: true },
            },
            _count: {
              select: {
                comments: true,
                savedBy: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return saved.map(item => {
      const confession = item.confession;
      const believeCount = confession.votes.filter(v => v.voteType === 'BELIEVE').length;
      const doubtCount = confession.votes.filter(v => v.voteType === 'DOUBT').length;
      
      // Find user's vote
      const userVote = confession.votes.find(v => v.userId === userId);
      
      return {
        ...confession,
        believeCount,
        doubtCount,
        commentCount: confession._count.comments,
        savedCount: confession._count.savedBy,
        userVote: userVote ? userVote.voteType : null,
        votes: undefined,
        _count: undefined,
      };
    });
  } catch (error) {
    console.error('Error getting saved confessions:', error);
    throw error;
  }
}`;

    const newFunction = `export async function getSavedConfessions(userId: string) {
  try {
    const saved = await prisma.savedConfession.findMany({
      where: { userId },
      include: {
        confession: {
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
              select: { 
                id: true, 
                name: true, 
                image: true, 
                university: true 
              },
            },
            university: {
              select: { 
                id: true, 
                name: true 
              },
            },
            // Only fetch user's vote
            votes: {
              where: { userId },
              select: { voteType: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return saved.map(item => {
      const confession = item.confession;
      const userVote = confession.votes?.[0]?.voteType || null;
      
      return {
        ...confession,
        believeCount: confession.believeCount,
        doubtCount: confession.doubtCount,
        commentCount: confession.commentCount,
        savedCount: confession.savedCount,
        userVote,
        votes: undefined, // Remove raw votes from response
      };
    });
  } catch (error) {
    console.error('Error getting saved confessions:', error);
    throw error;
  }
}`;

    // Replace the function
    if (content.includes(oldFunction)) {
      content = content.replace(oldFunction, newFunction);
      fs.writeFileSync(dbUtilsPath, content, 'utf8');
      console.log('✅ Successfully optimized getSavedConfessions function!');
      console.log('   - Now uses atomic counters (believeCount, doubtCount)');
      console.log('   - Removed manual vote counting');
      console.log('   - Improved performance with optimized select');
      console.log('   - Consistent with other optimized functions');
    } else {
      console.log('❌ Could not find the exact function to replace');
      console.log('   Please check if the function has been modified');
    }

  } catch (error) {
    console.error('❌ Error optimizing saved confessions:', error);
  }
}

if (require.main === module) {
  optimizeSavedConfessions()
    .then(() => {
      console.log('✨ Optimization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Optimization failed:', error);
      process.exit(1);
    });
}

module.exports = optimizeSavedConfessions; 