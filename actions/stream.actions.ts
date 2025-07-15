'use server';

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { StreamClient } from '@stream-io/node-sdk';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

export const tokenProvider = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) throw new Error('User is not authenticated');
  if (!apiKey) throw new Error('Stream API key secret is missing');
  if (!apiSecret) throw new Error('Stream API secret is missing');

  const client = new StreamClient(apiKey, apiSecret);

  // Ensure the Stream backend knows the latest user data (name & avatar)
  await client.upsertUsers([
    {
      id: user.id,
      name:
        user.given_name && user.family_name
          ? `${user.given_name} ${user.family_name}`
          : user.id,
      image: user.picture || undefined,
    },
  ]);

  const exp = Math.floor(Date.now() / 1000) + 3600;
  const issued = Math.floor(Date.now() / 1000) - 60;

  const token = client.createToken(user.id, exp, issued);

  return token;
};
