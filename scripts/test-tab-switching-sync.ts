import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testTabSwitchingSync() {
  try {
    console.log('🧪 Testing Tab Switching Vote Synchronization...\n');

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

    // Test fetching from different endpoints to simulate different tabs
    const testTabData = async (tabName: string, endpoint: string) => {
      try {
        const response = await fetch(`http://localhost:3000${endpoint}`);
        if (response.ok) {
          const data = await response.json();
          const confessions = data.confessions || data;
          
          if (Array.isArray(confessions) && confessions.length > 0) {
            const confessionData = confessions.find((c: any) => c.id === confession.id);
            if (confessionData) {
              console.log(`- ${tabName} tab: believe=${confessionData.believeCount}, doubt=${confessionData.doubtCount}, userVote=${confessionData.userVote}`);
              return confessionData;
            } else {
              console.log(`- ${tabName} tab: confession not found in results`);
              return null;
            }
          } else {
            console.log(`- ${tabName} tab: no confessions returned`);
            return null;
          }
        } else {
          console.log(`- ${tabName} tab: failed to fetch (${response.status})`);
          return null;
        }
      } catch (error) {
        console.log(`- ${tabName} tab: error fetching (${error})`);
        return null;
      }
    };

    // Simulate the tab switching scenario
    console.log('📱 Simulating tab switching scenario...');
    
    // 1. Vote from posts tab
    console.log('\n1️⃣ Voting from posts tab...');
    const voteResult = await testVote('BELIEVE');
    
    if (voteResult) {
      console.log('✅ Vote successful from posts tab');
      
      // 2. Immediately check all tabs (simulating quick tab switching)
      console.log('\n2️⃣ Immediately checking all tabs (simulating quick tab switching)...');
      
      const endpoints = [
        '/api/confessions/infinite?limit=1&sortBy=recent',
        '/api/confessions/infinite?limit=1&sortBy=hot',
        '/api/confessions/saved?userId=' + user.id,
        '/api/confessions/user?limit=1&sortBy=recent&userId=' + user.id
      ];
      
      const tabNames = ['posts', 'hottest', 'saved', 'my-posts'];
      
      const tabResults = [];
      for (let i = 0; i < endpoints.length; i++) {
        const result = await testTabData(tabNames[i], endpoints[i]);
        tabResults.push({ tab: tabNames[i], result });
      }

      // 3. Check consistency across tabs
      console.log('\n3️⃣ Checking consistency across tabs...');
      const voteCounts = tabResults
        .filter(r => r.result)
        .map(r => ({ tab: r.tab, believe: r.result.believeCount, doubt: r.result.doubtCount, userVote: r.result.userVote }));

      if (voteCounts.length > 0) {
        const firstVote = voteCounts[0];
        const allConsistent = voteCounts.every(vote => 
          vote.believe === firstVote.believe && 
          vote.doubt === firstVote.doubt && 
          vote.userVote === firstVote.userVote
        );

        if (allConsistent) {
          console.log('✅ SUCCESS: All tabs show consistent vote counts');
          voteCounts.forEach(vote => {
            console.log(`  - ${vote.tab}: believe=${vote.believe}, doubt=${vote.doubt}, userVote=${vote.userVote}`);
          });
        } else {
          console.log('❌ FAILURE: Tabs show inconsistent vote counts');
          voteCounts.forEach(vote => {
            console.log(`  - ${vote.tab}: believe=${vote.believe}, doubt=${vote.doubt}, userVote=${vote.userVote}`);
          });
        }
      }

      // 4. Test vote switching and immediate tab switching
      console.log('\n4️⃣ Testing vote switching and immediate tab switching...');
      const switchResult = await testVote('DOUBT');
      
      if (switchResult) {
        console.log('✅ Vote switch successful');
        
        // Immediately check all tabs again
        console.log('\n5️⃣ Immediately checking all tabs after vote switch...');
        
        const switchTabResults = [];
        for (let i = 0; i < endpoints.length; i++) {
          const result = await testTabData(tabNames[i], endpoints[i]);
          switchTabResults.push({ tab: tabNames[i], result });
        }

        // Check consistency after vote switch
        const switchVoteCounts = switchTabResults
          .filter(r => r.result)
          .map(r => ({ tab: r.tab, believe: r.result.believeCount, doubt: r.result.doubtCount, userVote: r.result.userVote }));

        if (switchVoteCounts.length > 0) {
          const firstSwitchVote = switchVoteCounts[0];
          const allSwitchConsistent = switchVoteCounts.every(vote => 
            vote.believe === firstSwitchVote.believe && 
            vote.doubt === firstSwitchVote.doubt && 
            vote.userVote === firstSwitchVote.userVote
          );

          if (allSwitchConsistent) {
            console.log('✅ SUCCESS: All tabs show consistent vote counts after switch');
            switchVoteCounts.forEach(vote => {
              console.log(`  - ${vote.tab}: believe=${vote.believe}, doubt=${vote.doubt}, userVote=${vote.userVote}`);
            });
          } else {
            console.log('❌ FAILURE: Tabs show inconsistent vote counts after switch');
            switchVoteCounts.forEach(vote => {
              console.log(`  - ${vote.tab}: believe=${vote.believe}, doubt=${vote.doubt}, userVote=${vote.userVote}`);
            });
          }
        }
      }
    }

    // Final verification
    console.log('\n🔍 Final verification...');
    
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
      console.log('✅ SUCCESS: Only one vote exists (tab switching sync working)');
    } else {
      console.log('❌ FAILURE: Multiple votes exist (tab switching sync not working)');
    }

    console.log('\n🎉 Tab switching vote synchronization test completed!');

  } catch (error) {
    console.error('❌ Error testing tab switching sync:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTabSwitchingSync(); 