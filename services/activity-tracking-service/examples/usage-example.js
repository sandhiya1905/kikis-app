/**
 * Usage Examples for Activity Tracking Service
 * 
 * This file demonstrates how to integrate and use the Activity Tracking Service
 * in the Nova Learn Platform ecosystem.
 */

// Example 1: Basic Activity Logging
async function logUserActivity() {
  const response = await fetch('http://localhost:3006/api/activity/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-jwt-token',
      'X-Session-ID': 'session-123'
    },
    body: JSON.stringify({
      actionType: 'view',
      resourceType: 'material',
      resourceId: 'material-456',
      context: {
        duration: 120,
        interactionDepth: 3,
        referrer: 'https://nova-learn.com/dashboard'
      },
      metadata: {
        materialTitle: 'Introduction to Machine Learning',
        subject: 'computer-science'
      }
    })
  });

  const result = await response.json();
  console.log('Activity logged:', result);
}

// Example 2: Enhanced Material Interaction Tracking
async function trackEnhancedMaterialInteraction() {
  const response = await fetch('http://localhost:3006/api/activity/material-interaction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-jwt-token',
      'X-Session-ID': 'session-123'
    },
    body: JSON.stringify({
      materialId: 'material-789',
      interactionType: 'view',
      duration: 1800, // 30 minutes
      completionPercentage: 85,
      position: 450, // seconds into video/document
      notesTaken: true,
      bookmarked: false,
      scrollDepth: 92,
      timeOnPage: 1650,
      clickCount: 15,
      focusTime: 1500,
      idleTime: 150,
      navigationPattern: [
        {
          action: 'scroll',
          timestamp: new Date(),
          element: 'content-section-1',
          position: { x: 0, y: 250 }
        },
        {
          action: 'click',
          timestamp: new Date(),
          element: 'highlight-button',
          position: { x: 120, y: 300 }
        }
      ],
      contentEngagement: {
        sectionsViewed: ['introduction', 'main-content', 'examples', 'conclusion'],
        timePerSection: {
          'introduction': 180,
          'main-content': 900,
          'examples': 450,
          'conclusion': 120
        },
        interactiveElementsUsed: ['code-runner', 'quiz-widget', 'diagram-explorer'],
        mediaEngagement: {
          videosWatched: 2,
          imagesViewed: 8,
          audioPlayed: 1
        }
      },
      learningIndicators: {
        conceptsIdentified: ['machine-learning', 'neural-networks', 'deep-learning'],
        difficultyRating: 3,
        confidenceLevel: 4,
        questionsGenerated: 5,
        keyTermsHighlighted: 12
      },
      additionalData: {
        playbackSpeed: 1.25,
        qualityLevel: '720p'
      }
    })
  });

  const result = await response.json();
  console.log('Enhanced Material Interaction Tracked:', result);
}

// Example 3: Search Query Recording
async function recordSearchQuery() {
  const response = await fetch('http://localhost:3006/api/activity/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-jwt-token',
      'X-Session-ID': 'session-123'
    },
    body: JSON.stringify({
      queryText: 'machine learning algorithms',
      filters: {
        subject: 'computer-science',
        difficulty: 'intermediate',
        type: 'video'
      },
      resultsCount: 42,
      clickedResults: ['result-1', 'result-5', 'result-12'],
      results: [
        { id: 'result-1', title: 'Linear Regression Explained', score: 0.95 },
        { id: 'result-2', title: 'Decision Trees Tutorial', score: 0.87 }
      ]
    })
  });

  const result = await response.json();
  console.log('Search query recorded:', result);
}

// Example 4: Learning Session Management
async function manageLearningSession() {
  // Start a learning session (implicit - happens with first activity)
  
  // Update session with materials and outcomes
  const response = await fetch('http://localhost:3006/api/activity/learning-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-jwt-token',
      'X-Session-ID': 'session-123'
    },
    body: JSON.stringify({
      sessionId: 'session-123',
      startTime: '2023-12-01T10:00:00Z',
      endTime: '2023-12-01T12:30:00Z',
      materialsAccessed: [
        {
          materialId: 'mat-1',
          duration: 3600,
          completionPercentage: 100
        },
        {
          materialId: 'mat-2',
          duration: 2400,
          completionPercentage: 75
        }
      ],
      learningObjectives: [
        'Understand linear regression concepts',
        'Practice implementing algorithms'
      ],
      outcomes: [
        {
          outcomeType: 'concept_understood',
          description: 'Successfully grasped linear regression mathematics',
          confidenceLevel: 4
        }
      ]
    })
  });

  const result = await response.json();
  console.log('Learning session captured:', result);
}

// Example 5: Retrieving User Analytics
async function getUserAnalytics(userId) {
  const response = await fetch(`http://localhost:3006/api/analytics/user/${userId}?startDate=2023-11-01&endDate=2023-12-01`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer your-jwt-token'
    }
  });

  const analytics = await response.json();
  console.log('User Analytics:', {
    totalActivities: analytics.data.totalActivities,
    learningPatterns: analytics.data.learningPatterns,
    engagementMetrics: analytics.data.engagementMetrics,
    materialPreferences: analytics.data.materialPreferences
  });
}

// Example 6: Real-time Analytics (Admin)
async function getRealTimeAnalytics() {
  const response = await fetch('http://localhost:3006/api/analytics/real-time?timeframe=hour', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer admin-jwt-token'
    }
  });

  const realTimeData = await response.json();
  console.log('Real-time Analytics:', {
    totalActivities: realTimeData.data.totalActivities,
    uniqueUsers: realTimeData.data.uniqueUsers,
    actionBreakdown: realTimeData.data.actionBreakdown,
    lastUpdated: realTimeData.data.lastUpdated
  });
}

// Example 7: Material Performance Analytics
async function getMaterialAnalytics(materialId) {
  const response = await fetch(`http://localhost:3006/api/analytics/material/${materialId}`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer your-jwt-token'
    }
  });

  const analytics = await response.json();
  console.log('Material Analytics:', {
    totalInteractions: analytics.data.totalInteractions,
    uniqueUsers: analytics.data.uniqueUsers,
    avgDuration: analytics.data.avgDuration,
    actionBreakdown: analytics.data.actionBreakdown,
    deviceBreakdown: analytics.data.deviceBreakdown
  });
}

// Example 8: Performance Monitoring
async function trackSessionPerformance() {
  const response = await fetch('http://localhost:3006/api/performance/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-jwt-token'
    },
    body: JSON.stringify({
      sessionId: 'session-123',
      pageLoadTime: 1200, // milliseconds
      interactionLatency: 50,
      memoryUsage: 85.5, // MB
      networkLatency: 120,
      errorCount: 0,
      featureUsage: {
        'search': 5,
        'bookmark': 2,
        'note-taking': 8
      },
      devicePerformance: {
        cpuUsage: 45,
        memoryPressure: 'low',
        batteryLevel: 78,
        connectionType: 'wifi'
      }
    })
  });

  const result = await response.json();
  console.log('Session performance tracked:', result);
}

// Example 9: Material Performance Monitoring
async function monitorMaterialPerformance() {
  const response = await fetch('http://localhost:3006/api/performance/material', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-jwt-token'
    },
    body: JSON.stringify({
      materialId: 'material-789',
      loadTime: 800,
      renderTime: 150,
      interactionDelay: 25,
      scrollDepth: 85,
      timeToFirstInteraction: 2500,
      bounceRate: 15,
      engagementDepth: 75
    })
  });

  const result = await response.json();
  console.log('Material performance monitored:', result);
}

// Example 10: Learning Analytics Tracking
async function trackLearningAnalytics() {
  const response = await fetch('http://localhost:3006/api/performance/learning-analytics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-jwt-token'
    },
    body: JSON.stringify({
      sessionId: 'session-123',
      learningEfficiency: 78,
      cognitiveLoad: 65,
      attentionSpan: 1800, // seconds
      comprehensionRate: 82,
      retentionIndicators: {
        shortTerm: 85,
        mediumTerm: 70,
        longTerm: 60
      },
      learningVelocity: 1.2,
      performanceContext: {
        deviceType: 'desktop',
        timeOfDay: 'morning',
        environmentalFactors: ['quiet', 'well-lit']
      }
    })
  });

  const result = await response.json();
  console.log('Learning analytics tracked:', result);
}

// Example 11: Performance Report Generation
async function getPerformanceReport(userId) {
  const response = await fetch(`http://localhost:3006/api/performance/report/${userId}?startDate=2023-11-01&endDate=2023-12-01`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer your-jwt-token'
    }
  });

  const report = await response.json();
  console.log('Performance Report:', {
    performanceMetrics: report.data.performanceMetrics,
    sessionPerformance: report.data.sessionPerformance,
    learningEfficiency: report.data.learningEfficiency,
    recommendations: report.data.recommendations
  });
}

// Example 12: Session Statistics
async function getSessionStats(userId) {
  const response = await fetch(`http://localhost:3006/api/sessions/stats/summary?days=30`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer your-jwt-token'
    }
  });

  const stats = await response.json();
  console.log('Session Statistics:', {
    totalSessions: stats.data.totalSessions,
    totalLearningTime: stats.data.totalLearningTime,
    avgSessionDuration: stats.data.avgSessionDuration,
    learningStreak: stats.data.learningStreak,
    outcomesSummary: stats.data.outcomesSummary
  });
}

// Example Integration with Frontend
class ActivityTracker {
  constructor(baseUrl, authToken) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
    this.sessionId = this.generateSessionId();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async logActivity(actionType, resourceType, resourceId, context = {}, metadata = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/activity/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
          'X-Session-ID': this.sessionId
        },
        body: JSON.stringify({
          actionType,
          resourceType,
          resourceId,
          context: {
            ...context,
            referrer: window.location.href,
            timestamp: new Date().toISOString()
          },
          metadata
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to log activity:', error);
      return { success: false, error: error.message };
    }
  }

  async trackMaterialView(materialId, duration, completionPercentage) {
    return this.logActivity('view', 'material', materialId, {
      duration,
      interactionDepth: 1
    }, {
      completion_percentage: completionPercentage,
      view_type: 'full'
    });
  }

  async trackSearch(query, filters, results) {
    const response = await fetch(`${this.baseUrl}/api/activity/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`,
        'X-Session-ID': this.sessionId
      },
      body: JSON.stringify({
        queryText: query,
        filters,
        resultsCount: results.length,
        results: results.slice(0, 10) // Send first 10 results
      })
    });

    return await response.json();
  }

  async endSession(outcomes = []) {
    const response = await fetch(`${this.baseUrl}/api/sessions/current/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({ outcomes })
    });

    return await response.json();
  }
}

// Usage in a React component
/*
import { useEffect, useState } from 'react';

function MaterialViewer({ materialId, authToken }) {
  const [tracker] = useState(() => new ActivityTracker('http://localhost:3006', authToken));
  const [startTime] = useState(Date.now());

  useEffect(() => {
    // Log material view start
    tracker.logActivity('view', 'material', materialId, {
      duration: 0,
      interactionDepth: 1
    });

    // Track view completion on unmount
    return () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      tracker.trackMaterialView(materialId, duration, 100);
    };
  }, [materialId, tracker, startTime]);

  return (
    <div>
      Material content here...
    </div>
  );
}
*/

// Export examples for testing
module.exports = {
  logUserActivity,
  trackEnhancedMaterialInteraction,
  recordSearchQuery,
  manageLearningSession,
  getUserAnalytics,
  getRealTimeAnalytics,
  getMaterialAnalytics,
  trackSessionPerformance,
  monitorMaterialPerformance,
  trackLearningAnalytics,
  getPerformanceReport,
  getSessionStats,
  ActivityTracker
};