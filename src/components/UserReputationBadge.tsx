import { useUserReputation } from '@/hooks/useUserReputation';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Crown, Star, Award, Medal, Trophy } from 'lucide-react';

interface UserReputationBadgeProps {
  userId: string;
  showDetails?: boolean;
  className?: string;
  variant?: 'badge' | 'shield';
}

export function UserReputationBadge({ userId, showDetails = false, className = '', variant = 'badge' }: UserReputationBadgeProps) {
  const { reputation, loading, getReputationColor, getVerificationBadge } = useUserReputation(userId);

  if (loading) {
    return <Badge variant="secondary" className="animate-pulse">Loading...</Badge>;
  }

  if (!reputation) {
    return null;
  }

  const verificationBadge = getVerificationBadge(reputation.verificationLevel);
  const reputationColor = getReputationColor(reputation.reputationLevel);

  const getShieldIcon = (level: string) => {
    switch (level) {
      case 'LEGENDARY':
        return <Crown className="w-4 h-4 text-purple-600" />;
      case 'EXPERT':
        return <Star className="w-4 h-4 text-blue-600" />;
      case 'TRUSTED':
        return <Award className="w-4 h-4 text-green-600" />;
      case 'ACTIVE':
        return <Medal className="w-4 h-4 text-yellow-600" />;
      case 'REGULAR':
        return <Trophy className="w-4 h-4 text-orange-600" />;
      default:
        return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAchievementDescription = (level: string) => {
    switch (level) {
      case 'LEGENDARY':
        return {
          title: 'Legendary Status',
          description: 'Top 1-2% of users. These are the most trusted and respected community members with exceptional contributions.',
          requirements: '800+ reputation points, high engagement, verified account, no reports',
          benefits: 'Maximum community trust, special recognition, priority support',
          nextLevel: null
        };
      case 'EXPERT':
        return {
          title: 'Expert Status',
          description: 'Top 5-10% of users. Highly trusted community members with significant contributions.',
          requirements: '600-799 reputation points, good engagement, verified account',
          benefits: 'High community trust, recognition for quality contributions',
          nextLevel: 'LEGENDARY',
          nextRequirements: '800+ reputation points, exceptional engagement, verified account, no reports'
        };
      case 'TRUSTED':
        return {
          title: 'Trusted Status',
          description: 'Top 15-25% of users. Reliable community contributors with consistent quality.',
          requirements: '400-599 reputation points, decent engagement, verified account',
          benefits: 'Reliable community standing, trusted contributor status',
          nextLevel: 'EXPERT',
          nextRequirements: '600+ reputation points, good engagement, verified account'
        };
      case 'ACTIVE':
        return {
          title: 'Active Status',
          description: 'Regular contributors (25-40% of users). Established community members.',
          requirements: '200-399 reputation points, regular activity, some engagement',
          benefits: 'Established community member, basic trust level',
          nextLevel: 'TRUSTED',
          nextRequirements: '400+ reputation points, decent engagement, verified account'
        };
      case 'REGULAR':
        return {
          title: 'Regular Status',
          description: 'Established users (40-60% of users). Basic community trust.',
          requirements: '100-199 reputation points, some activity',
          benefits: 'Basic community trust, established user status',
          nextLevel: 'ACTIVE',
          nextRequirements: '200+ reputation points, regular activity, some engagement'
        };
      default:
        return {
          title: 'New User',
          description: 'New or low-activity users (60%+ of users). Building community trust.',
          requirements: '0-99 reputation points, basic activity',
          benefits: 'Building community trust, learning platform norms',
          nextLevel: 'REGULAR',
          nextRequirements: '100+ reputation points, some activity'
        };
    }
  };

  const getAllAchievements = () => {
    return [
      {
        level: 'NEW',
        title: 'New User',
        description: 'New or low-activity users (60%+ of users)',
        requirements: '0-99 reputation points, basic activity',
        color: 'text-gray-600',
        icon: <Shield className="w-4 h-4 text-gray-600" />
      },
      {
        level: 'REGULAR',
        title: 'Regular Status',
        description: 'Established users (40-60% of users)',
        requirements: '100-199 reputation points, some activity',
        color: 'text-orange-600',
        icon: <Trophy className="w-4 h-4 text-orange-600" />
      },
      {
        level: 'ACTIVE',
        title: 'Active Status',
        description: 'Regular contributors (25-40% of users)',
        requirements: '200-399 reputation points, regular activity',
        color: 'text-yellow-600',
        icon: <Medal className="w-4 h-4 text-yellow-600" />
      },
      {
        level: 'TRUSTED',
        title: 'Trusted Status',
        description: 'Top 15-25% of users. Reliable community contributors',
        requirements: '400-599 reputation points, decent engagement',
        color: 'text-green-600',
        icon: <Award className="w-4 h-4 text-green-600" />
      },
      {
        level: 'EXPERT',
        title: 'Expert Status',
        description: 'Top 5-10% of users. Highly trusted community members',
        requirements: '600-799 reputation points, good engagement',
        color: 'text-blue-600',
        icon: <Star className="w-4 h-4 text-blue-600" />
      },
      {
        level: 'LEGENDARY',
        title: 'Legendary Status',
        description: 'Top 1-2% of users. Most trusted and respected members',
        requirements: '800+ reputation points, exceptional engagement',
        color: 'text-purple-600',
        icon: <Crown className="w-4 h-4 text-purple-600" />
      }
    ];
  };

  if (variant === 'shield') {
    const achievement = getAchievementDescription(reputation.reputationLevel);
    const allAchievements = getAllAchievements();
    const currentAchievementIndex = allAchievements.findIndex(a => a.level === reputation.reputationLevel);
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <button className={`p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 ${className}`}>
            {getShieldIcon(reputation.reputationLevel)}
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getShieldIcon(reputation.reputationLevel)}
              {achievement.title}
            </DialogTitle>
            <DialogDescription>
              {achievement.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Requirements:</h4>
              <p className="text-sm text-gray-600">{achievement.requirements}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Benefits:</h4>
              <p className="text-sm text-gray-600">{achievement.benefits}</p>
            </div>
            {achievement.nextLevel && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-blue-800">Next Level: {achievement.nextLevel}</h4>
                <p className="text-sm text-blue-700">{achievement.nextRequirements}</p>
              </div>
            )}
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span>Reputation Score:</span>
                <span className="font-medium">{reputation.reputationScore}</span>
              </div>
              {reputation.botProbability > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Bot Probability:</span>
                  <span>{reputation.botProbability}%</span>
                </div>
              )}
            </div>
            
            {/* All Achievements List */}
            <div className="pt-4 border-t">
              <h4 className="font-semibold text-sm mb-3">All Achievement Levels:</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allAchievements.map((achievement, index) => {
                  const isCurrent = achievement.level === reputation.reputationLevel;
                  const isCompleted = index <= currentAchievementIndex;
                  const isNext = index === currentAchievementIndex + 1;
                  
                  return (
                    <div 
                      key={achievement.level}
                      className={`p-2 rounded-lg border ${
                        isCurrent 
                          ? 'bg-blue-50 border-blue-200' 
                          : isCompleted 
                            ? 'bg-green-50 border-green-200' 
                            : isNext
                              ? 'bg-yellow-50 border-yellow-200'
                              : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {achievement.icon}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium text-sm ${achievement.color}`}>
                              {achievement.title}
                            </span>
                            {isCurrent && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Current</span>
                            )}
                            {isCompleted && !isCurrent && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">✓ Achieved</span>
                            )}
                            {isNext && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Next</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{achievement.requirements}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge className={`${verificationBadge.color} ${className}`}>
              {verificationBadge.text}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p>Reputation: {reputation.reputationScore}</p>
              <p>Level: {reputation.reputationLevel}</p>
              <p>Plan: {reputation.plan?.toUpperCase() || 'FREE'}</p>
              {reputation.plan === 'free' && reputation.verificationLevel === 'USER' && (
                <p className="text-blue-600">Upgrade to Plus/Premium for verification</p>
              )}
              {reputation.botProbability > 0 && (
                <p className="text-red-600">Bot Probability: {reputation.botProbability}%</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Badge className={verificationBadge.color}>
          {verificationBadge.text}
        </Badge>
        <Badge className={reputationColor}>
          {reputation.reputationLevel}
        </Badge>
        {reputation.isFlagged && (
          <Badge variant="destructive">Flagged</Badge>
        )}
      </div>
      
      <div className="text-xs text-gray-600 space-y-1">
        <div className="flex justify-between">
          <span>Reputation Score:</span>
          <span className="font-medium">{reputation.reputationScore}</span>
        </div>
        <div className="flex justify-between">
          <span>Activity Score:</span>
          <span>{reputation.activityScore}</span>
        </div>
        <div className="flex justify-between">
          <span>Quality Score:</span>
          <span>{reputation.qualityScore}</span>
        </div>
        <div className="flex justify-between">
          <span>Trust Score:</span>
          <span>{reputation.trustScore}</span>
        </div>
        {reputation.botProbability > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Bot Probability:</span>
            <span>{reputation.botProbability}%</span>
          </div>
        )}
      </div>
    </div>
  );
} 