import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// Using type-only imports for better TypeScript compliance
import type { Criterion } from '../../../server/src/schema';

interface CriteriaOverviewProps {
  criteria: Criterion[];
}

export function CriteriaOverview({ criteria }: CriteriaOverviewProps) {
  // Group criteria by category
  const criteriaByCategory = useMemo(() => {
    const grouped: Record<string, Criterion[]> = {};
    criteria.forEach((criterion: Criterion) => {
      if (!grouped[criterion.category]) {
        grouped[criterion.category] = [];
      }
      grouped[criterion.category].push(criterion);
    });
    
    // Sort subcategories within each category
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a: Criterion, b: Criterion) => 
        a.sub_category.localeCompare(b.sub_category)
      );
    });
    
    return grouped;
  }, [criteria]);

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('craft')) return '🔧';
    if (cat.includes('impact')) return '🎯';
    if (cat.includes('collaboration')) return '🤝';
    if (cat.includes('growth')) return '🌱';
    if (cat.includes('effectiveness')) return '⚡';
    return '📋';
  };

  const getCategoryColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('craft')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (cat.includes('impact')) return 'bg-green-100 text-green-800 border-green-200';
    if (cat.includes('collaboration')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (cat.includes('growth')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (cat.includes('effectiveness')) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getCategoryDescription = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('craft')) {
      return 'Technical skills, expertise, and the scope of engineering work you can handle effectively.';
    }
    if (cat.includes('impact')) {
      return 'Your ability to plan, execute, and deliver meaningful results for the business and users.';
    }
    if (cat.includes('collaboration')) {
      return 'Communication skills, teamwork, and your ability to work effectively with others.';
    }
    if (cat.includes('growth')) {
      return 'How you develop others, learn continuously, and contribute to organizational growth.';
    }
    if (cat.includes('effectiveness')) {
      return 'Your bias to action, ability to get things done, and drive for results.';
    }
    return 'Key aspects of your role and responsibilities.';
  };

  const getSubCategoryDescription = (category: string, subCategory: string) => {
    const cat = category.toLowerCase();
    const sub = subCategory.toLowerCase();
    
    // Craft descriptions
    if (cat.includes('craft')) {
      if (sub.includes('technical') || sub.includes('expertise')) {
        return 'Your depth of technical knowledge and ability to apply it effectively.';
      }
      if (sub.includes('scope')) {
        return 'The complexity and scale of problems you can solve independently.';
      }
    }
    
    // Impact descriptions
    if (cat.includes('impact')) {
      if (sub.includes('planning')) {
        return 'Your ability to plan, estimate, and coordinate work effectively.';
      }
      if (sub.includes('execution')) {
        return 'How you deliver results and drive projects to completion.';
      }
    }
    
    // Collaboration descriptions
    if (cat.includes('collaboration')) {
      if (sub.includes('communication')) {
        return 'Your written and verbal communication skills with team members and stakeholders.';
      }
    }
    
    // Growth descriptions
    if (cat.includes('growth')) {
      if (sub.includes('mentorship')) {
        return 'How you help others grow and develop their skills.';
      }
    }
    
    // Effectiveness descriptions
    if (cat.includes('effectiveness')) {
      if (sub.includes('bias') || sub.includes('action')) {
        return 'Your drive to take action, make decisions, and push for results.';
      }
    }
    
    return 'A key aspect of your performance in this category.';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Criteria Overview</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Comprehensive breakdown of all evaluation criteria used in the Engineering Job Matrix. 
          These categories and sub-categories define what we look for at each level.
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📊</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{Object.keys(criteriaByCategory).length}</div>
                <div className="text-sm text-gray-500">Categories</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🎯</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{criteria.length}</div>
                <div className="text-sm text-gray-500">Sub-criteria</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">⚖️</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">5</div>
                <div className="text-sm text-gray-500">Core Areas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(criteriaByCategory).map(([category, categoryItems]) => (
          <Card key={category} className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <span className="text-2xl">{getCategoryIcon(category)}</span>
                <div className="flex items-center space-x-2">
                  <span>{category}</span>
                  <Badge variant="outline">{categoryItems.length} sub-criteria</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                {getCategoryDescription(category)}
              </p>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm">Sub-categories:</h4>
                {categoryItems.map((criterion: Criterion, index: number) => (
                  <div key={criterion.id}>
                    <div className="flex items-start space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getCategoryColor(category)}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 text-sm">{criterion.sub_category}</h5>
                        <p className="text-gray-600 text-xs mt-1">
                          {getSubCategoryDescription(category, criterion.sub_category)}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          ID: <code className="bg-gray-100 px-1 rounded">{criterion.id}</code>
                        </p>
                      </div>
                    </div>
                    {index < categoryItems.length - 1 && (
                      <Separator className="my-3" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Criteria List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">📋</span>
            <span>Complete Criteria Reference</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(criteriaByCategory).map(([category, categoryItems]) => (
              <div key={category}>
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-xl">{getCategoryIcon(category)}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                  <Badge variant="outline" className={getCategoryColor(category)}>
                    {categoryItems.length} items
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
                  {categoryItems.map((criterion: Criterion) => (
                    <div key={criterion.id} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50/50">
                      <h4 className="font-medium text-gray-900 text-sm mb-1">
                        {criterion.sub_category}
                      </h4>
                      <p className="text-gray-600 text-xs mb-2">
                        {getSubCategoryDescription(category, criterion.sub_category)}
                      </p>
                      <p className="text-gray-400 text-xs">
                        <code className="bg-gray-100 px-1 rounded">{criterion.id}</code>
                      </p>
                    </div>
                  ))}
                </div>
                
                {/* Don't add separator after last category */}
                {category !== Object.keys(criteriaByCategory)[Object.keys(criteriaByCategory).length - 1] && (
                  <Separator className="mt-6" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">💡</span>
            <span>How to Use These Criteria</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">For Self-Assessment</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Review each category to understand evaluation areas</li>
                <li>• Compare your current abilities against level expectations</li>
                <li>• Identify growth opportunities and skill gaps</li>
                <li>• Focus development efforts on key areas</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">For Performance Reviews</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Use as structured framework for evaluation</li>
                <li>• Provide specific examples for each category</li>
                <li>• Ensure comprehensive coverage of all areas</li>
                <li>• Set SMART goals aligned with criteria</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">For Career Planning</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Understand requirements for target levels</li>
                <li>• Plan skill development across all categories</li>
                <li>• Balance technical and soft skill growth</li>
                <li>• Track progress systematically over time</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">For Hiring</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Structure interviews around key criteria</li>
                <li>• Assess candidates consistently across areas</li>
                <li>• Determine appropriate level placement</li>
                <li>• Document evaluation reasoning clearly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}