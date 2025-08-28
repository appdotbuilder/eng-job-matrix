import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type ViewType = 'matrix' | 'overview' | 'history' | 'levels-summary' | 'criteria-overview';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    { id: 'matrix' as ViewType, label: 'Job Matrix', icon: '📊' },
    { id: 'levels-summary' as ViewType, label: 'Levels Summary', icon: '📋' },
    { id: 'criteria-overview' as ViewType, label: 'Criteria Overview', icon: '🎯' },
    { id: 'overview' as ViewType, label: 'About', icon: '📖' },
    { id: 'history' as ViewType, label: 'Edit History', icon: '📝' }
  ];

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🚀</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Engineering Job Matrix</h1>
              <p className="text-sm text-gray-500">Career levels & progression paths</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange(item.id)}
                className="flex items-center space-x-2"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Stub data indicator */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
        <div className="container mx-auto">
          <div className="flex items-center space-x-2 text-sm">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Demo Mode
            </Badge>
            <span className="text-amber-700">
              Currently using sample data - backend API integration pending
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}