import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OverviewContent {
  goals: string[];
  principles: string[];
}

interface OverviewViewProps {
  overview: OverviewContent;
}

export function OverviewView({ overview }: OverviewViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">About the Engineering Job Matrix</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Understanding the purpose, goals, and guiding principles behind our engineering career framework.
        </p>
      </div>

      {/* Goals Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">🎯</span>
            <span>Goals & Purpose</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            The Engineering Job Matrix serves multiple critical functions within our organization:
          </p>
          
          {overview.goals.length > 0 ? (
            <ul className="space-y-3">
              {overview.goals.map((goal: string, index: number) => (
                <li key={index} className="flex items-start space-x-3">
                  <Badge variant="secondary" className="mt-0.5 shrink-0">
                    {index + 1}
                  </Badge>
                  <span className="text-gray-700">{goal}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-blue-800">
                This matrix serves as the foundation for our engineering organization's career development, 
                performance evaluation, and hiring processes. It provides clear expectations and growth paths 
                for all engineering roles.
              </p>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-semibold text-gray-900 mb-2">Key Applications:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">📈</span>
                <span className="text-sm text-gray-700">Performance Reviews</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">🏆</span>
                <span className="text-sm text-gray-700">Promotion Committees</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">👥</span>
                <span className="text-sm text-gray-700">Hiring Process</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">🚀</span>
                <span className="text-sm text-gray-700">Career Planning</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Principles Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">💡</span>
            <span>Core Principles</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            These fundamental principles guide how we think about engineering roles and career progression:
          </p>
          
          {overview.principles.length > 0 ? (
            <div className="space-y-4">
              {overview.principles.map((principle: string, index: number) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50/50">
                  <p className="text-gray-800 font-medium">{principle}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50/50">
                <p className="text-gray-800 font-medium">
                  Impact and ownership are the most important factors for career progression
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50/50">
                <p className="text-gray-800 font-medium">
                  Criteria and levels are consistent across the organization, while specific expectations may vary by department
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50/50">
                <p className="text-gray-800 font-medium">
                  Clear expectations enable accountability and meaningful performance discussions
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How to Use Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">📋</span>
            <span>How to Use This Matrix</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                <span className="text-lg">👤</span>
                <span>For Individual Contributors</span>
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Understand expectations for your current level</li>
                <li>• Identify areas for growth and development</li>
                <li>• Plan your career progression path</li>
                <li>• Prepare for performance reviews and 1:1s</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                <span className="text-lg">👨‍💼</span>
                <span>For Managers</span>
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Set clear expectations for team members</li>
                <li>• Provide structured feedback and coaching</li>
                <li>• Make informed promotion recommendations</li>
                <li>• Support career development conversations</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                <span className="text-lg">🎯</span>
                <span>For Hiring</span>
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Define role requirements and expectations</li>
                <li>• Assess candidate capabilities consistently</li>
                <li>• Determine appropriate level for new hires</li>
                <li>• Align interview processes with criteria</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                <span className="text-lg">📈</span>
                <span>For Promotion Reviews</span>
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Evaluate candidates against clear criteria</li>
                <li>• Ensure consistency across different teams</li>
                <li>• Provide evidence-based promotion decisions</li>
                <li>• Document growth and capability development</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}