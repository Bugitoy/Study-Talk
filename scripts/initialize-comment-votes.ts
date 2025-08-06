import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initializeCommentVotes() {
  try {
    console.log('Initializing comment vote counts...');
    
    // Get all comments to ensure they have vote counts set
    const comments = await prisma.confessionComment.findMany();
    
    console.log(`Found ${comments.length} comments to update`);
    
    // Update each comment with default vote counts
    for (const comment of comments) {
      await prisma.confessionComment.update({
        where: { id: comment.id },
        data: {
          likeCount: 0,
          dislikeCount: 0,
        },
      });
    }
    
    console.log('Successfully initialized comment vote counts');
  } catch (error) {
    console.error('Error initializing comment vote counts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeCommentVotes(); 