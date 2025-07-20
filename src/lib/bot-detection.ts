import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface BotDetectionResult {
  probability: number;
  indicators: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendations: string[];
}

export interface UserActivityPattern {
  userId: string;
  actionType: 'confession' | 'vote' | 'comment';
  timestamp: Date;
  content?: string;
  metadata?: Record<string, any>;
}

export class BotDetectionService {
  private static instance: BotDetectionService;
  
  public static getInstance(): BotDetectionService {
    if (!BotDetectionService.instance) {
      BotDetectionService.instance = new BotDetectionService();
    }
    return BotDetectionService.instance;
  }

  /**
   * Comprehensive bot detection analysis
   */
  async detectBot(userId: string): Promise<BotDetectionResult> {
    const indicators: string[] = [];
    let totalScore = 0;
    const maxScore = 100;

    // 1. Activity Pattern Analysis
    const activityScore = await this.analyzeActivityPatterns(userId);
    totalScore += activityScore.score;
    indicators.push(...activityScore.indicators);

    // 2. Content Analysis
    const contentScore = await this.analyzeContentPatterns(userId);
    totalScore += contentScore.score;
    indicators.push(...contentScore.indicators);

    // 3. Timing Analysis
    const timingScore = await this.analyzeTimingPatterns(userId);
    totalScore += timingScore.score;
    indicators.push(...timingScore.indicators);

    // 4. Engagement Analysis
    const engagementScore = await this.analyzeEngagementPatterns(userId);
    totalScore += engagementScore.score;
    indicators.push(...engagementScore.indicators);

    // 5. Device/IP Analysis
    const deviceScore = await this.analyzeDevicePatterns(userId);
    totalScore += deviceScore.score;
    indicators.push(...deviceScore.indicators);

    // 6. Social Graph Analysis
    const socialScore = await this.analyzeSocialPatterns(userId);
    totalScore += socialScore.score;
    indicators.push(...socialScore.indicators);

    const probability = Math.min(Math.max(totalScore / maxScore * 100, 0), 100);
    const riskLevel = this.calculateRiskLevel(probability);
    const recommendations = this.generateRecommendations(indicators, riskLevel);

    return {
      probability,
      indicators,
      riskLevel,
      recommendations
    };
  }

  /**
   * Analyze activity patterns for suspicious behavior
   */
  private async analyzeActivityPatterns(userId: string): Promise<{ score: number; indicators: string[] }> {
    const indicators: string[] = [];
    let score = 0;

    // Get user's recent activity
    const recentActivity = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        confessionsCreated: true,
        votesCast: true,
        commentsCreated: true,
        dailyConfessions: true,
        dailyVotes: true,
        dailyComments: true,
        createdAt: true,
        lastActivityAt: true
      }
    });

    if (!recentActivity) return { score: 0, indicators };

    // Check for excessive activity
    const totalActions = (recentActivity.dailyConfessions || 0) + 
                        (recentActivity.dailyVotes || 0) + 
                        (recentActivity.dailyComments || 0);

    if (totalActions > 50) {
      score += 20;
      indicators.push('Excessive daily activity (>50 actions)');
    } else if (totalActions > 30) {
      score += 15;
      indicators.push('High daily activity (>30 actions)');
    }

    // Check for activity bursts
    const activityBursts = await this.detectActivityBursts(userId);
    if (activityBursts > 3) {
      score += 15;
      indicators.push(`Multiple activity bursts detected (${activityBursts})`);
    }

    // Check for consistent activity patterns
    const consistentPatterns = await this.detectConsistentPatterns(userId);
    if (consistentPatterns) {
      score += 10;
      indicators.push('Unnaturally consistent activity patterns');
    }

    return { score, indicators };
  }

  /**
   * Analyze content patterns for bot-like behavior
   */
  private async analyzeContentPatterns(userId: string): Promise<{ score: number; indicators: string[] }> {
    const indicators: string[] = [];
    let score = 0;

    // Get recent confessions and comments
    const recentContent = await prisma.confession.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        content: true,
        title: true,
        createdAt: true
      }
    });

    if (recentContent.length === 0) return { score: 0, indicators };

    // Check for repetitive content
    const repetitiveContent = this.detectRepetitiveContent(recentContent);
    if (repetitiveContent > 0.7) {
      score += 25;
      indicators.push('High content repetition detected');
    } else if (repetitiveContent > 0.5) {
      score += 15;
      indicators.push('Moderate content repetition detected');
    }

    // Check for generic/bot-like content
    const genericContent = this.detectGenericContent(recentContent);
    if (genericContent > 0.6) {
      score += 20;
      indicators.push('Generic/bot-like content patterns');
    }

    // Check for content length patterns
    const lengthPatterns = this.analyzeContentLengthPatterns(recentContent);
    if (lengthPatterns.suspicious) {
      score += 10;
      indicators.push('Suspicious content length patterns');
    }

    return { score, indicators };
  }

  /**
   * Analyze timing patterns for automated behavior
   */
  private async analyzeTimingPatterns(userId: string): Promise<{ score: number; indicators: string[] }> {
    const indicators: string[] = [];
    let score = 0;

    // Get recent activity timestamps
    const recentActivity = await prisma.confession.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { createdAt: true }
    });

    if (recentActivity.length < 5) return { score: 0, indicators };

    // Check for regular intervals
    const regularIntervals = this.detectRegularIntervals(recentActivity);
    if (regularIntervals > 0.8) {
      score += 25;
      indicators.push('Highly regular activity intervals');
    } else if (regularIntervals > 0.6) {
      score += 15;
      indicators.push('Moderately regular activity intervals');
    }

    // Check for 24/7 activity
    const continuousActivity = this.detectContinuousActivity(recentActivity);
    if (continuousActivity) {
      score += 20;
      indicators.push('Continuous 24/7 activity detected');
    }

    // Check for time zone inconsistencies
    const timezoneInconsistencies = await this.detectTimezoneInconsistencies(userId);
    if (timezoneInconsistencies > 0) {
      score += 15;
      indicators.push(`Timezone inconsistencies detected (${timezoneInconsistencies})`);
    }

    return { score, indicators };
  }

  /**
   * Analyze engagement patterns
   */
  private async analyzeEngagementPatterns(userId: string): Promise<{ score: number; indicators: string[] }> {
    const indicators: string[] = [];
    let score = 0;

    // Get user's engagement metrics
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        confessionsCreated: true,
        votesCast: true,
        commentsCreated: true,
        qualityScore: true,
        trustScore: true
      }
    });

    if (!user) return { score: 0, indicators };

    // Check for low engagement despite high activity
    const totalActions = (user.confessionsCreated || 0) + (user.votesCast || 0) + (user.commentsCreated || 0);
    const engagementRatio = totalActions > 0 ? (user.qualityScore || 0) / totalActions : 0;

    if (totalActions > 20 && engagementRatio < 0.1) {
      score += 20;
      indicators.push('Low engagement despite high activity');
    }

    // Check for one-sided interactions
    const oneSidedInteractions = await this.detectOneSidedInteractions(userId);
    if (oneSidedInteractions > 0.8) {
      score += 15;
      indicators.push('One-sided interactions detected');
    }

    return { score, indicators };
  }

  /**
   * Analyze device and IP patterns
   */
  private async analyzeDevicePatterns(userId: string): Promise<{ score: number; indicators: string[] }> {
    const indicators: string[] = [];
    let score = 0;

    // This would typically involve tracking device fingerprints, IP addresses, etc.
    // For now, we'll implement basic checks based on available data

    // Check for multiple accounts from same IP (if we had IP tracking)
    const multipleAccounts = await this.detectMultipleAccounts(userId);
    if (multipleAccounts > 0) {
      score += 20;
      indicators.push(`Multiple accounts detected (${multipleAccounts})`);
    }

    return { score, indicators };
  }

  /**
   * Analyze social graph patterns
   */
  private async analyzeSocialPatterns(userId: string): Promise<{ score: number; indicators: string[] }> {
    const indicators: string[] = [];
    let score = 0;

    // Check for isolated behavior
    const socialConnections = await this.analyzeSocialConnections(userId);
    if (socialConnections.isolationScore > 0.8) {
      score += 15;
      indicators.push('Highly isolated social behavior');
    }

    // Check for artificial social patterns
    const artificialPatterns = await this.detectArtificialSocialPatterns(userId);
    if (artificialPatterns) {
      score += 10;
      indicators.push('Artificial social interaction patterns');
    }

    return { score, indicators };
  }

  /**
   * Helper methods for pattern detection
   */
  private async detectActivityBursts(userId: string): Promise<number> {
    // Implementation would analyze activity timestamps for bursts
    // For now, return a placeholder
    return 0;
  }

  private async detectConsistentPatterns(userId: string): Promise<boolean> {
    // Implementation would analyze activity patterns for unnatural consistency
    return false;
  }

  private detectRepetitiveContent(content: any[]): number {
    // Implementation would analyze content similarity
    // For now, return a placeholder
    return 0;
  }

  private detectGenericContent(content: any[]): number {
    // Implementation would analyze content for generic/bot-like patterns
    return 0;
  }

  private analyzeContentLengthPatterns(content: any[]): { suspicious: boolean } {
    // Implementation would analyze content length patterns
    return { suspicious: false };
  }

  private detectRegularIntervals(activity: any[]): number {
    // Implementation would analyze time intervals between activities
    return 0;
  }

  private detectContinuousActivity(activity: any[]): boolean {
    // Implementation would check for 24/7 activity patterns
    return false;
  }

  private async detectTimezoneInconsistencies(userId: string): Promise<number> {
    // Implementation would analyze activity across different time zones
    return 0;
  }

  private async detectOneSidedInteractions(userId: string): Promise<number> {
    // Implementation would analyze interaction patterns
    return 0;
  }

  private async detectMultipleAccounts(userId: string): Promise<number> {
    // Implementation would check for multiple accounts from same source
    return 0;
  }

  private async analyzeSocialConnections(userId: string): Promise<{ isolationScore: number }> {
    // Implementation would analyze social graph connections
    return { isolationScore: 0 };
  }

  private async detectArtificialSocialPatterns(userId: string): Promise<boolean> {
    // Implementation would detect artificial social interaction patterns
    return false;
  }

  /**
   * Calculate risk level based on probability
   */
  private calculateRiskLevel(probability: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (probability >= 80) return 'CRITICAL';
    if (probability >= 60) return 'HIGH';
    if (probability >= 30) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Generate recommendations based on detection results
   */
  private generateRecommendations(indicators: string[], riskLevel: string): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'CRITICAL') {
      recommendations.push('Immediate account review required');
      recommendations.push('Consider temporary suspension');
      recommendations.push('Manual verification needed');
    } else if (riskLevel === 'HIGH') {
      recommendations.push('Enhanced monitoring recommended');
      recommendations.push('Consider additional verification');
      recommendations.push('Review recent activity patterns');
    } else if (riskLevel === 'MEDIUM') {
      recommendations.push('Monitor for suspicious activity');
      recommendations.push('Consider gentle verification prompts');
    } else {
      recommendations.push('Continue normal monitoring');
    }

    return recommendations;
  }

  /**
   * Update user's bot probability in database
   */
  async updateUserBotProbability(userId: string, probability: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { botProbability: probability }
    });
  }

  /**
   * Get bot detection statistics
   */
  async getBotDetectionStats(): Promise<{
    totalUsers: number;
    suspiciousUsers: number;
    criticalUsers: number;
    averageProbability: number;
  }> {
    const users = await prisma.user.findMany({
      select: { botProbability: true }
    });

    const totalUsers = users.length;
    const suspiciousUsers = users.filter(u => (u.botProbability || 0) > 30).length;
    const criticalUsers = users.filter(u => (u.botProbability || 0) > 80).length;
    const averageProbability = users.reduce((sum, u) => sum + (u.botProbability || 0), 0) / totalUsers;

    return {
      totalUsers,
      suspiciousUsers,
      criticalUsers,
      averageProbability
    };
  }
}

export const botDetectionService = BotDetectionService.getInstance(); 