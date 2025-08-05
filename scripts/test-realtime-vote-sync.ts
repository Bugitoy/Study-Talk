import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testRealtimeVoteSync() {
  try {
    console.log('🧪 Testing Real-time Vote Synchronization...\n');

    // Get a confession to test with
    const confession = await prisma.confession.findFirst({
      where: {
        isHidden: false
      },
      include: {
        votes: {
          take: 3,
          include: {
            user: {
              select: {
                name: true,
                university: true
              }
            }
          }
        },
        _count: {
          select: {
            votes: true
          }
        }
      }
    });

    if (!confession) {
      console.log('❌ No confessions found to test with');
      return;
    }

    console.log(`📝 Testing with confession: "${confession.title}"`);
    console.log(`- ID: ${confession.id}`);
    console.log(`- Current believe count: ${confession.believeCount}`);
    console.log(`- Current doubt count: ${confession.doubtCount}`);
    console.log('');

    // Get a user to test with
    const user = await prisma.user.findFirst({
      where: {
        university: { not: null }
      }
    });

    if (!user) {
      console.log('❌ No users found to test with');
      return;
    }

    console.log(`👤 Testing with user: ${user.name} (${user.id})`);
    console.log(`- University: ${user.university}`);
    console.log('');

    // Check current user vote
    const currentVote = await prisma.confessionVote.findFirst({
      where: {
        userId: user.id,
        confessionId: confession.id
      }
    });

    console.log(`🎯 Current user vote: ${currentVote ? currentVote.voteType : 'None'}`);
    console.log('');

    // Test the vote API endpoint
    console.log('🔄 Testing vote API endpoint...');
    
    const testVote = async (voteType: 'BELIEVE' | 'DOUBT') => {
      try {
        const response = await fetch('http://localhost:3000/api/confessions/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            confessionId: confession.id,
            voteType,
            action: 'vote'
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Vote ${voteType} successful`);
          return result;
        } else {
          const error = await response.text();
          console.log(`❌ Vote ${voteType} failed:`, error);
          return null;
        }
      } catch (error) {
        console.log(`❌ Vote ${voteType} error:`, error);
        return null;
      }
    };

    // Test voting and check immediate state
    console.log('📱 Testing vote from posts tab...');
    const voteResult = await testVote('BELIEVE');
    
    if (voteResult) {
      console.log('✅ Vote successful from posts tab');
      
      // Wait a moment for any async updates
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if the vote state is consistent across all tabs
      console.log('\n🔍 Checking vote state consistency across tabs...');
      
      // Test fetching from different endpoints to simulate different tabs
      const endpoints = [
        '/api/confessions/infinite?limit=1&sortBy=recent',
        '/api/confessions/infinite?limit=1&sortBy=hot',
        '/api/confessions/saved?userId=' + user.id,
        '/api/confessions/user?limit=1&sortBy=recent&userId=' + user.id
      ];
      
      const tabNames = ['posts', 'hottest', 'saved', 'my-posts'];
      
      for (let i = 0; i < endpoints.length; i++) {
        try {
          const response = await fetch(`http://localhost:3000${endpoints[i]}`);
          if (response.ok) {
            const data = await response.json();
            const confessions = data.confessions || data;
            
            if (Array.isArray(confessions) && confessions.length > 0) {
              const confessionData = confessions.find((c: any) => c.id === confession.id);
              if (confessionData) {
                console.log(`- ${tabNames[i]} tab: believe=${confessionData.believeCount}, doubt=${confessionData.doubtCount}, userVote=${confessionData.userVote}`);
              } else {
                console.log(`- ${tabNames[i]} tab: confession not found in results`);
              }
            } else {
              console.log(`- ${tabNames[i]} tab: no confessions returned`);
            }
          } else {
            console.log(`- ${tabNames[i]} tab: failed to fetch (${response.status})`);
          }
        } catch (error) {
          console.log(`- ${tabNames[i]} tab: error fetching (${error})`);
        }
      }
    }

    // Test vote switching
    console.log('\n🔄 Testing vote switching...');
    const switchResult = await testVote('DOUBT');
    
    if (switchResult) {
      console.log('✅ Vote switch successful');
      
      // Wait a moment for any async updates
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check final state
      console.log('\n🔍 Checking final state...');
      
      const finalVote = await prisma.confessionVote.findFirst({
        where: {
          userId: user.id,
          confessionId: confession.id
        }
      });

      const updatedConfession = await prisma.confession.findUnique({
        where: { id: confession.id },
        select: {
          believeCount: true,
          doubtCount: true,
          _count: {
            select: { votes: true }
          }
        }
      });

      console.log(`- Final user vote: ${finalVote ? finalVote.voteType : 'None'}`);
      console.log(`- Final believe count: ${updatedConfession?.believeCount}`);
      console.log(`- Final doubt count: ${updatedConfession?.doubtCount}`);
      console.log(`- Total votes in database: ${updatedConfession?._count.votes}`);

      // Verify only one vote exists
      const allUserVotes = await prisma.confessionVote.findMany({
        where: {
          userId: user.id,
          confessionId: confession.id
        }
      });

      console.log(`- Total votes by this user: ${allUserVotes.length}`);
      
      if (allUserVotes.length === 1) {
        console.log('✅ SUCCESS: Only one vote exists (real-time sync working)');
      } else {
        console.log('❌ FAILURE: Multiple votes exist (real-time sync not working)');
      }
    }

    console.log('\n🎉 Real-time vote synchronization test completed!');

  } catch (error) {
    console.error('❌ Error testing real-time vote sync:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRealtimeVoteSync(); 