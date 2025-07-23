'use client';

import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import NextLayout from '@/components/NextLayout';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Shield, Smartphone, Key, Download, Copy, CheckCircle, XCircle } from 'lucide-react';

interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export default function TwoFactorAuthPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  useEffect(() => {
    if (!userLoading && (!user || !user.isAdmin)) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  const handleSetup2FA = async () => {
    if (!user?.id) return;
    
    setIsSettingUp(true);
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      const data = await response.json();
      
      if (response.ok) {
        setSetup(data);
        toast({
          title: '2FA Setup',
          description: 'Scan the QR code with your authenticator app',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to setup 2FA',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to setup 2FA',
        variant: 'destructive',
      });
    } finally {
      setIsSettingUp(false);
    }
  };

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
          useBackupCode: false
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: '2FA has been enabled successfully',
        });
        router.push('/admin/reports');
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

  const copyBackupCodes = () => {
    if (setup?.backupCodes) {
      navigator.clipboard.writeText(setup.backupCodes.join('\n'));
      toast({
        title: 'Copied',
        description: 'Backup codes copied to clipboard',
      });
    }
  };

  const downloadBackupCodes = () => {
    if (setup?.backupCodes) {
      const content = `Study-Talk 2FA Backup Codes

IMPORTANT: Save these codes in a secure location. You can use them if you lose your device.

${setup.backupCodes.join('\n')}

Generated on: ${new Date().toLocaleDateString()}
Security Note: Never share these codes with anyone.`;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'study-talk-2fa-backup-codes.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Downloaded',
        description: 'Backup codes downloaded successfully',
      });
    }
  };

  if (userLoading) {
    return (
      <NextLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-2">Loading...</p>
          </div>
        </div>
      </NextLayout>
    );
  }

  return (
    <NextLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h1>
          <p className="text-gray-600">Secure your Study-Talk admin account with 2FA</p>
        </div>

        <div className="grid gap-6">
          {/* Setup Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Setup 2FA
              </CardTitle>
              <CardDescription>
                Enable two-factor authentication for enhanced security
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!setup ? (
                <Button 
                  onClick={handleSetup2FA} 
                  disabled={isSettingUp}
                  className="w-full"
                >
                  {isSettingUp ? 'Setting up...' : 'Setup 2FA'}
                </Button>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <Smartphone className="h-4 w-4" />
                    <AlertDescription>
                      Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex justify-center">
                    <img 
                      src={setup.qrCode} 
                      alt="QR Code" 
                      className="border rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Verification Code</label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                      />
                      <Button 
                        onClick={handleVerify2FA}
                        disabled={isVerifying || verificationCode.length !== 6}
                      >
                        {isVerifying ? 'Verifying...' : 'Verify'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Backup Codes Section */}
          {setup && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Backup Codes
                </CardTitle>
                <CardDescription>
                  Save these backup codes in a secure location. You can use them if you lose your device.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <AlertDescription>
                    <strong>Important:</strong> These codes are only shown once. Save them securely!
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {setup.backupCodes.map((code, index) => (
                    <div key={index} className="bg-gray-100 p-2 rounded text-center font-mono text-sm">
                      {code}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button onClick={copyBackupCodes} variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Codes
                  </Button>
                  <Button onClick={downloadBackupCodes} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Security Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Use a dedicated authenticator app</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Store backup codes in a secure password manager</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Never share your 2FA codes with anyone</span>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                <span>Don't use SMS-based 2FA for admin accounts</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </NextLayout>
  );
} 