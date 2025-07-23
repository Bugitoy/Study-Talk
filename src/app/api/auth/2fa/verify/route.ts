import { NextRequest, NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import prisma from '@/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId, token, useBackupCode } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get user's 2FA secret
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        isAdmin: true, 
        twoFactorEnabled: true, 
        twoFactorSecret: true,
        backupCodes: true 
      }
    });

    // Allow any authenticated user to verify 2FA (not just admins)
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if 2FA is enabled OR if we're in the initial setup phase
    if (!dbUser.twoFactorEnabled && !dbUser.twoFactorSecret) {
      return NextResponse.json({ error: '2FA not set up' }, { status: 400 });
    }

    let isValid = false;

    if (useBackupCode) {
      // Verify backup code
      isValid = dbUser.backupCodes.includes(token.toUpperCase());
      if (isValid) {
        // Remove used backup code
        const updatedBackupCodes = dbUser.backupCodes.filter(code => code !== token.toUpperCase());
        await prisma.user.update({
          where: { id: userId },
          data: { backupCodes: updatedBackupCodes }
        });
      }
    } else {
      // Verify TOTP token
      isValid = speakeasy.totp.verify({
        secret: dbUser.twoFactorSecret!,
        encoding: 'base32',
        token: token,
        window: 2 // Allow 2 time steps for clock skew
      });
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid 2FA code' }, { status: 400 });
    }

    // For initial setup, enable 2FA after successful verification
    if (!dbUser.twoFactorEnabled) {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          twoFactorEnabled: true
        }
      });
    }

    return NextResponse.json({ 
      success: true,
      message: '2FA verification successful'
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 