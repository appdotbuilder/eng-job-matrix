import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Using type-only imports for better TypeScript compliance
import type { EditHistoryEntry } from '../../../server/src/schema';

interface HistoryViewProps {
  editHistory: EditHistoryEntry[];
}

export function HistoryView({ editHistory }: HistoryViewProps) {
  // Sort history entries by date, most recent first
  const sortedHistory = [...editHistory].sort((a: EditHistoryEntry, b: EditHistoryEntry) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString; // Fallback to original string if parsing fails
    }
  };

  const getChangeIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('published') || desc.includes('initial') || desc.includes('v1')) {
      return '🚀';
    } else if (desc.includes('explicit') || desc.includes('clarif') || desc.includes('updat')) {
      return '✏️';
    } else if (desc.includes('spell') || desc.includes('typo') || desc.includes('fix')) {
      return '🔤';
    } else if (desc.includes('tweak') || desc.includes('adjust') || desc.includes('refine')) {
      return '🔧';
    } else if (desc.includes('add') || desc.includes('new')) {
      return '➕';
    } else if (desc.includes('deprecat') || desc.includes('remov')) {
      return '🗑️';
    } else {
      return '📝';
    }
  };

  const getChangeBadgeVariant = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('published') || desc.includes('v1')) {
      return 'default' as const;
    } else if (desc.includes('explicit') || desc.includes('major')) {
      return 'secondary' as const;
    } else {
      return 'outline' as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Edit History</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Track changes and updates to the Engineering Job Matrix over time. 
          This transparency helps maintain trust in the framework and shows our commitment to continuous improvement.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📈</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{editHistory.length}</div>
                <div className="text-sm text-gray-500">Total Updates</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📅</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {sortedHistory.length > 0 ? formatDate(sortedHistory[0].date).split(' ')[0] : 'N/A'}
                </div>
                <div className="text-sm text-gray-500">Latest Update</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🎯</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">v1.0</div>
                <div className="text-sm text-gray-500">Current Version</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">📋</span>
            <span>Change Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-gray-500 text-lg">No edit history available.</p>
              <p className="text-gray-400 text-sm mt-2">
                Changes and updates will appear here as they are made.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedHistory.map((entry: EditHistoryEntry, index: number) => (
                <div
                  key={entry.id}
                  className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50/50 transition-colors"
                >
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-white border-2 border-blue-200 rounded-full text-lg">
                      {getChangeIcon(entry.description)}
                    </div>
                    {index < sortedHistory.length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getChangeBadgeVariant(entry.description)}>
                          {formatDate(entry.date)}
                        </Badge>
                        {index === 0 && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Latest
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-800 leading-relaxed">{entry.description}</p>
                    
                    {/* Additional context for major changes */}
                    {entry.description.toLowerCase().includes('v1 published') && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                        🎉 Initial publication of the Engineering Job Matrix framework
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Versioning Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">ℹ️</span>
            <span>About Versioning</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            We maintain a detailed edit history to ensure transparency and accountability in how our 
            engineering standards evolve. This helps everyone understand:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">📝 What Changed</h4>
              <p className="text-sm text-gray-600">
                Every modification to the matrix is documented with clear descriptions 
                of what was updated and why.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">📅 When It Changed</h4>
              <p className="text-sm text-gray-600">
                Precise timestamps help track the evolution of expectations 
                and ensure fair application of standards.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">🔍 Impact Assessment</h4>
              <p className="text-sm text-gray-600">
                Understanding changes helps managers and ICs assess how 
                updates might affect ongoing reviews or career plans.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">📈 Continuous Improvement</h4>
              <p className="text-sm text-gray-600">
                Regular updates show our commitment to refining and 
                improving the framework based on feedback and experience.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}