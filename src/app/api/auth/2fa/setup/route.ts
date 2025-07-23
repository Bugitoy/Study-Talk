import { NextRequest, NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import prisma from '@/db/prisma';

export async function POST(req: NextRequest) {
  try {
    // Get user ID from request headers or body
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true, twoFactorEnabled: true }
    });

    // Allow any authenticated user to setup 2FA (not just admins)
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (dbUser.twoFactorEnabled) {
      return NextResponse.json({ error: '2FA already enabled' }, { status: 400 });
    }

    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: dbUser.isAdmin ? `Study-Talk Admin` : `Study-Talk User`,
      issuer: 'Study-Talk',
      length: 32
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );

    // Store secret and backup codes
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret.base32,
        backupCodes: backupCodes
      }
    });

    return NextResponse.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 