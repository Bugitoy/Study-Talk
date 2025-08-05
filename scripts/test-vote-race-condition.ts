import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testVoteRaceCondition() {
  try {
    console.log('🧪 Testing Vote Race Condition Fix...\n');

    // Get a confession to test with
    const confession = await prisma.confession.findFirst({
      where: {
        isHidden: false
      },
      include: {
        votes: {
          take: 5,
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
    console.log(`- Total votes in database: ${confession._count.votes}`);
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
          console.log(`✅ Vote ${voteType} successful:`, result);
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

    // Test rapid voting (simulating race condition)
    console.log('🏃‍♂️ Testing rapid voting (race condition simulation)...');
    
    const promises = [
      testVote('BELIEVE'),
      testVote('BELIEVE'),
      testVote('DOUBT'),
      testVote('DOUBT')
    ];

    const results = await Promise.all(promises);
    
    console.log('\n📊 Results:');
    results.forEach((result, index) => {
      if (result) {
        console.log(`- Vote ${index + 1}: Success`);
      } else {
        console.log(`- Vote ${index + 1}: Failed/Blocked`);
      }
    });

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
      console.log('✅ SUCCESS: Only one vote exists (race condition prevented)');
    } else {
      console.log('❌ FAILURE: Multiple votes exist (race condition occurred)');
    }

    console.log('\n🎉 Vote race condition test completed!');

  } catch (error) {
    console.error('❌ Error testing vote race condition:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testVoteRaceCondition(); 