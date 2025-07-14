import 'dotenv/config';
import { StreamClient } from '@stream-io/node-sdk';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const apiSecret = process.env.STREAM_SECRET_KEY!;

if (!apiKey || !apiSecret) {
  console.error('Missing Stream credentials');
  process.exit(1);
}

async function cleanup() {
  const client = new StreamClient(apiKey, apiSecret);
  let next: string | undefined = undefined;
  let totalProcessed = 0;

  do {
    const query: any = { limit: 50 };
    if (typeof next !== "undefined") {
      query.next = next;
    }
    if (typeof next === "undefined") {
      query.sort = [{ field: "created_at", direction: -1 }];
    }
    const { calls, next: nextToken } = await client.video.queryCalls(query);

    for (const c of calls) {
      const callId = c.call.id;
      const callType = c.call.type;
      const hostId = c.call.created_by?.id;

      const membersResp = await client.video.queryCallMembers({ id: callId, type: callType });
      const members = membersResp.members ?? [];
      const hostPresent = members.some(m => (m.user_id || m.user?.id) === hostId);

      if (!hostPresent) {
        console.log(`Ending call ${callId}`);
        try {
          await client.video.endCall({ id: callId, type: callType });
          await client.video.deleteCall({ id: callId, type: callType, hard: true });
        } catch (err) {
          console.error(`Failed to clean up call ${callId}`, err);
        }
      }
      totalProcessed++;
    }
    next = nextToken;
  } while (next);

  console.log(`Processed ${totalProcessed} calls.`);
}

cleanup().catch(e => {
  console.error('Cleanup failed', e);
  process.exit(1);
});