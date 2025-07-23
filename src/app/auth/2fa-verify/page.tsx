'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Shield, Smartphone, Key, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TwoFactorVerifyPage() {
  const { user, isAuthenticated, isLoading } = useKindeBrowserClient();
  const router = useRouter();
  const { toast } = useToast();
  
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/api/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleVerify2FA = async () => {
    if (!user?.id || !verificationCode) return;
    
    setIsVerifying(true);
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,
          token: verificationCode,
          useBackupCode
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: '2FA verification successful',
        });
        // Redirect to the intended page or home
        router.push('/');
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Invalid verification code',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify 2FA',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBackupCode = () => {
    setUseBackupCode(true);
    setVerificationCode('');
  };

  const handleTOTPCode = () => {
    setUseBackupCode(false);
    setVerificationCode('');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-orange-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your verification code to continue
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              {useBackupCode ? 'Backup Code' : 'Authenticator Code'}
            </CardTitle>
            <CardDescription>
              {useBackupCode 
                ? 'Enter one of your backup codes'
                : 'Enter the 6-digit code from your authenticator app'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                {useBackupCode 
                  ? 'Use one of the backup codes you saved during 2FA setup'
                  : 'Open your authenticator app (Google Authenticator, Authy, etc.) and enter the 6-digit code'
                }
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Input
                type="text"
                placeholder={useBackupCode ? "Enter backup code" : "Enter 6-digit code"}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={useBackupCode ? 8 : 6}
                className="text-center text-lg font-mono"
              />
              
              <Button 
                onClick={handleVerify2FA}
                disabled={isVerifying || verificationCode.length === 0}
                className="w-full"
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </Button>
            </div>

            <div className="flex gap-2">
              {useBackupCode ? (
                <Button onClick={handleTOTPCode} variant="outline" className="flex-1">
                  Use Authenticator Code
                </Button>
              ) : (
                <Button onClick={handleBackupCode} variant="outline" className="flex-1">
                  Use Backup Code
                </Button>
              )}
            </div>

            <div className="text-center">
              <Link href="/api/auth/logout" className="text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Sign out
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 