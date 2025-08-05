import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAllTabsVoteSync() {
  try {
    console.log('🧪 Testing All Tabs Vote Synchronization...\n');

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

    // Test the vote API endpoint from different "tabs" (simulated)
    console.log('🔄 Testing vote API endpoint from different tabs...');
    
    const testVoteFromTab = async (tabName: string, voteType: 'BELIEVE' | 'DOUBT') => {
      try {
        console.log(`\n📱 Testing vote from ${tabName} tab...`);
        
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
          console.log(`✅ Vote ${voteType} from ${tabName} tab successful`);
          return result;
        } else {
          const error = await response.text();
          console.log(`❌ Vote ${voteType} from ${tabName} tab failed:`, error);
          return null;
        }
      } catch (error) {
        console.log(`❌ Vote ${voteType} from ${tabName} tab error:`, error);
        return null;
      }
    };

    // Simulate voting from different tabs
    const tabs = ['posts', 'hottest', 'saved', 'my-posts'];
    const results = [];

    for (const tab of tabs) {
      const result = await testVoteFromTab(tab, 'BELIEVE');
      results.push({ tab, result });
      
      // Small delay to simulate real user behavior
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n📊 Results by tab:');
    results.forEach(({ tab, result }) => {
      if (result) {
        console.log(`- ${tab} tab: ✅ Success`);
      } else {
        console.log(`- ${tab} tab: ❌ Failed/Blocked`);
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
      console.log('✅ SUCCESS: Only one vote exists (all tabs synchronized)');
    } else {
      console.log('❌ FAILURE: Multiple votes exist (tabs not synchronized)');
    }

    // Test vote switching from different tabs
    console.log('\n🔄 Testing vote switching from different tabs...');
    
    const switchVoteResults = [];
    
    for (const tab of tabs.slice(0, 2)) { // Test with first 2 tabs
      const result = await testVoteFromTab(tab, 'DOUBT');
      switchVoteResults.push({ tab, result });
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n📊 Vote switching results:');
    switchVoteResults.forEach(({ tab, result }) => {
      if (result) {
        console.log(`- ${tab} tab: ✅ Vote switched successfully`);
      } else {
        console.log(`- ${tab} tab: ❌ Vote switch failed/blocked`);
      }
    });

    // Final verification
    const finalSwitchVote = await prisma.confessionVote.findFirst({
      where: {
        userId: user.id,
        confessionId: confession.id
      }
    });

    console.log(`\n🎯 Final vote after switching: ${finalSwitchVote ? finalSwitchVote.voteType : 'None'}`);

    console.log('\n🎉 All tabs vote synchronization test completed!');

  } catch (error) {
    console.error('❌ Error testing all tabs vote sync:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAllTabsVoteSync(); 