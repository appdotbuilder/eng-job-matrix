import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// Using type-only imports for better TypeScript compliance
import type { JobLevel } from '../../../server/src/schema';

interface LevelsSummaryViewProps {
  jobLevels: JobLevel[];
}

export function LevelsSummaryView({ jobLevels }: LevelsSummaryViewProps) {
  // Group levels by primary title for better organization
  const levelsByTitle = jobLevels.reduce((acc: Record<string, JobLevel[]>, level: JobLevel) => {
    if (!acc[level.primary_title]) {
      acc[level.primary_title] = [];
    }
    acc[level.primary_title].push(level);
    return acc;
  }, {});

  const getLevelIcon = (primaryTitle: string, levelName: string) => {
    const title = primaryTitle.toLowerCase();
    const name = levelName.toLowerCase();
    
    if (title.includes('manager') || title.includes('director')) {
      return '👨‍💼';
    } else if (title.includes('lead') || name.includes('tl')) {
      return '🎯';
    } else {
      return '👨‍💻';
    }
  };

  const getLevelColor = (primaryTitle: string) => {
    const title = primaryTitle.toLowerCase();
    if (title.includes('director')) {
      return 'bg-purple-100 text-purple-800';
    } else if (title.includes('manager')) {
      return 'bg-blue-100 text-blue-800';
    } else if (title.includes('lead')) {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressionLevel = (levelName: string) => {
    const name = levelName.toLowerCase();
    if (name.includes('l1') || name.includes('l2')) {
      return 1;
    } else if (name.includes('l3')) {
      return 2;
    } else if (name.includes('l4')) {
      return 3;
    } else if (name.includes('l5')) {
      return 4;
    } else if (name.includes('tl') || name.includes('lead')) {
      return 5;
    } else if (name.includes('em') || name.includes('manager')) {
      return 6;
    } else if (name.includes('director')) {
      return 7;
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Engineering Levels Summary</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Complete overview of all engineering levels, their expectations, and career progression paths. 
          Use this as a reference for understanding role definitions and advancement opportunities.
        </p>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📊</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{jobLevels.length}</div>
                <div className="text-sm text-gray-500">Total Levels</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {Object.entries(levelsByTitle).map(([title, levels]) => (
          <Card key={title}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getLevelIcon(title, '')}</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{levels.length}</div>
                  <div className="text-sm text-gray-500">{title}s</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Career Tracks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(levelsByTitle).map(([title, levels]) => {
          // Sort levels by progression
          const sortedLevels = levels.sort((a: JobLevel, b: JobLevel) => 
            getProgressionLevel(a.name) - getProgressionLevel(b.name)
          );

          return (
            <Card key={title} className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">{getLevelIcon(title, '')}</span>
                  <span>{title} Track</span>
                  <Badge variant="outline">{levels.length} levels</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sortedLevels.map((level: JobLevel, index: number) => (
                  <div key={level.id}>
                    <div className="flex items-start space-x-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getLevelColor(level.primary_title)}`}>
                          {index + 1}
                        </div>
                        {index < sortedLevels.length - 1 && (
                          <div className="w-0.5 h-4 bg-gray-200 mt-2"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 pb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{level.name}</h3>
                          <Badge variant="secondary" className={getLevelColor(level.primary_title)}>
                            {level.primary_title}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                          {level.description_summary}
                        </p>
                        
                        {level.trajectory_note && (
                          <div className="bg-blue-50 p-3 rounded-md border-l-4 border-blue-200">
                            <div className="flex items-start space-x-2">
                              <span className="text-blue-600 text-sm">💡</span>
                              <p className="text-blue-800 text-sm">
                                <strong>Progression Note:</strong> {level.trajectory_note}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {index < sortedLevels.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Level Cards */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-900">Detailed Level Information</h3>
        <div className="grid grid-cols-1 gap-4">
          {jobLevels
            .sort((a: JobLevel, b: JobLevel) => getProgressionLevel(a.name) - getProgressionLevel(b.name))
            .map((level: JobLevel) => (
            <Card key={level.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3">
                    <span className="text-2xl">{getLevelIcon(level.primary_title, level.name)}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span>{level.name}</span>
                        <Badge variant="secondary" className={getLevelColor(level.primary_title)}>
                          {level.primary_title}
                        </Badge>
                      </div>
                    </div>
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    Level {getProgressionLevel(level.name)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 leading-relaxed">{level.description_summary}</p>
                </div>
                
                {level.trajectory_note && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Career Progression</h4>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-md border border-blue-200">
                      <p className="text-gray-800">{level.trajectory_note}</p>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  Level ID: <code className="bg-gray-100 px-1 rounded">{level.id}</code>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Progression Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">📈</span>
            <span>Career Progression Guidelines</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Individual Contributor Path</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Start: L1/L2 (New grad/Intern level)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Progress: L3, L4, L5 (Growing expertise)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Branch: L6+ (Senior IC) or TL1 (Lead)</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Management Path</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Entry: TL1 (Tech Lead, no reports)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Management: EM1 (Engineering Manager)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Leadership: Director+ (Org leadership)</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
            <p className="text-amber-800 text-sm">
              <strong>Important:</strong> Progression beyond L5/TL1 is optional and based on business need. 
              Many engineers build fulfilling careers at L5 or continue along the IC track.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}