'use server';

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { StreamClient } from '@stream-io/node-sdk';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

export const tokenProvider = async () => {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      console.error('User is not authenticated in token provider');
      throw new Error('User is not authenticated');
    }
    
    if (!apiKey) {
      console.error('Stream API key secret is missing');
      throw new Error('Stream API key secret is missing');
    }
    
    if (!apiSecret) {
      console.error('Stream API secret is missing');
      throw new Error('Stream API secret is missing');
    }

    // Ensure user ID is properly formatted and consistent
    const userId = user.id?.toString();
    if (!userId) {
      console.error('User ID is missing or invalid in token provider:', user);
      throw new Error('User ID is missing or invalid');
    }

    const client = new StreamClient(apiKey, apiSecret);

    // Ensure the Stream backend knows the latest user data (name & avatar)
    try {
      await client.upsertUsers([
        {
          id: userId,
          name:
            user.given_name && user.family_name
              ? `${user.given_name} ${user.family_name}`
              : userId,
          image: user.picture || undefined,
        },
      ]);
    } catch (upsertError) {
      console.error('Error upserting user in Stream:', upsertError);
      // Continue with token creation even if upsert fails
    }

    const exp = Math.floor(Date.now() / 1000) + 3600;
    const issued = Math.floor(Date.now() / 1000) - 60;

    const token = client.createToken(userId, exp, issued);

    return token;
  } catch (error) {
    console.error('Error in token provider:', error);
    throw error;
  }
};
