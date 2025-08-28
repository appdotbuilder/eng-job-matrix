import { useState, useEffect, useCallback } from 'react';
// import { trpc } from '@/utils/trpc'; // TODO: Enable when backend handlers are implemented
import { Navigation } from '@/components/Navigation';
import { MatrixView } from '@/components/MatrixView';
import { OverviewView } from '@/components/OverviewView';
import { HistoryView } from '@/components/HistoryView';
import { LevelsSummaryView } from '@/components/LevelsSummaryView';
import { CriteriaOverview } from '@/components/CriteriaOverview';
import { LoadingSpinner } from '@/components/LoadingSpinner';
// Using type-only imports for better TypeScript compliance
import type { EngineeringJobMatrixData } from '../../server/src/schema';
import './App.css';

// Stub data based on the provided sample - this simulates the backend response
const STUB_DATA: EngineeringJobMatrixData = {
  jobLevels: [
    {
      id: "l1-l2",
      name: "L1 / L2",
      primary_title: "Engineer",
      description_summary: "Intern / New Grad",
      trajectory_note: "We expect Engineers to remain at this level for 2 years on average",
      created_at: new Date()
    },
    {
      id: "l3",
      name: "L3",
      primary_title: "Engineer",
      description_summary: "Intern / New Grad",
      trajectory_note: "We expect Engineers to remain at this level for 2 years on average",
      created_at: new Date()
    },
    {
      id: "l4",
      name: "L4",
      primary_title: "Engineer",
      description_summary: "Junior to Mid-level Engineer",
      trajectory_note: null,
      created_at: new Date()
    },
    {
      id: "l5",
      name: "L5",
      primary_title: "Engineer",
      description_summary: "Leads projects and some cross-team efforts inside their team. An expert in the areas owned by their team. Mentors and guides juniors",
      trajectory_note: "Progression beyond this level is optional. L5 Engineers may follow the IC track (L6) or TL path (Lead Engineer)",
      created_at: new Date()
    },
    {
      id: "tl1",
      name: "TL1",
      primary_title: "Lead Engineer",
      description_summary: "Making technical contributions and leading large-scale efforts, no direct reports",
      trajectory_note: "Progression beyond this level is optional. TLs may continue along the TL path, with deeper technical contributions (TL2) or expand their number of reports and follow the Manager path (EM1). Managerial promotions require a business need for the new position to be created.",
      created_at: new Date()
    },
    {
      id: "em1",
      name: "EM1",
      primary_title: "Engineering Manager",
      description_summary: "An Eng Manager supports Lead Engineers, and is responsible for technical decisions and outcomes on their teams (target max reports: 3 TLs)",
      trajectory_note: "Promotion to EM and above requires there to be a business need for the role",
      created_at: new Date()
    }
  ],
  criteria: [
    {
      id: "craft-technical-expertise",
      category: "Craft",
      sub_category: "Technical Expertise",
      created_at: new Date()
    },
    {
      id: "craft-scope",
      category: "Craft",
      sub_category: "Scope",
      created_at: new Date()
    },
    {
      id: "impact-planning",
      category: "Impact",
      sub_category: "Planning",
      created_at: new Date()
    },
    {
      id: "impact-execution",
      category: "Impact",
      sub_category: "Execution",
      created_at: new Date()
    },
    {
      id: "collaboration-communication-skills",
      category: "Collaboration",
      sub_category: "Communication Skills",
      created_at: new Date()
    },
    {
      id: "growth-mentorship",
      category: "Growth",
      sub_category: "Mentorship",
      created_at: new Date()
    },
    {
      id: "effectiveness-bias-to-action",
      category: "Effectiveness",
      sub_category: "Bias to Action",
      created_at: new Date()
    }
  ],
  capabilities: [
    {
      id: 1,
      job_level_id: "l1-l2",
      criterion_id: "craft-technical-expertise",
      description: "Has sufficient practical and foundational knowledge to be able to understand and implement features with guidance. Learns best-practices and tools",
      created_at: new Date()
    },
    {
      id: 2,
      job_level_id: "l3",
      criterion_id: "craft-technical-expertise",
      description: "Has sufficient practical and foundational knowledge to be able to understand and implement features with guidance. Learns best-practices and tools",
      created_at: new Date()
    },
    {
      id: 3,
      job_level_id: "l5",
      criterion_id: "craft-technical-expertise",
      description: "A domain expert. Able to contribute across many teams areas of expertise. Follows relevant research Raises the bar of what we can achieve.",
      created_at: new Date()
    },
    {
      id: 4,
      job_level_id: "tl1",
      criterion_id: "craft-technical-expertise",
      description: "A domain expert. Able to contribute across many teams areas of expertise. Follows relevant research Raises the bar of what we can achieve.",
      created_at: new Date()
    },
    {
      id: 5,
      job_level_id: "em1",
      criterion_id: "craft-technical-expertise",
      description: "A domain expert. Able to contribute across many teams areas of expertise. Follows relevant research Raises the bar of what we can achieve.",
      created_at: new Date()
    },
    {
      id: 6,
      job_level_id: "l1-l2",
      criterion_id: "craft-scope",
      description: "Owns tasks and small projects",
      created_at: new Date()
    },
    {
      id: 7,
      job_level_id: "l3",
      criterion_id: "craft-scope",
      description: "Medium-to-Large Changes. Able to predict production behaviour by following best-practise and testing (correctness and performance)",
      created_at: new Date()
    },
    {
      id: 8,
      job_level_id: "l5",
      criterion_id: "craft-scope",
      description: "Designs systems spanning across teams and complex problem domains, brings insight that simplifies design and implementation. Makes the right tradeoffs. Sets the bar for technical excellence within the team. Evaluates and adopts new tools and technologies for the company",
      created_at: new Date()
    },
    {
      id: 9,
      job_level_id: "tl1",
      criterion_id: "craft-scope",
      description: "Owns the problem-domain of their team and their team's success. Adapts approach and tools when appropriate",
      created_at: new Date()
    },
    {
      id: 10,
      job_level_id: "em1",
      criterion_id: "craft-scope",
      description: "Owns the problem-domain of their teams",
      created_at: new Date()
    },
    {
      id: 11,
      job_level_id: "l3",
      criterion_id: "impact-planning",
      description: "Documents tasks for large features/small system. Gives reliable estimates for project work. Plans roll-out of their feature to users, not just merging PRs",
      created_at: new Date()
    },
    {
      id: 12,
      job_level_id: "l5",
      criterion_id: "impact-planning",
      description: "Writes specs for large systems that address complex problems. Coordinates efforts across teams.",
      created_at: new Date()
    },
    {
      id: 13,
      job_level_id: "tl1",
      criterion_id: "impact-planning",
      description: "Defines Roadmap for their team for the Quarter ahead, balancing company priorities against the quality of their features and technical debt. Maintains a sketch of the Quarter beyond. Holds sufficient capacity 'unplanned' to account for surprises.",
      created_at: new Date()
    },
    {
      id: 14,
      job_level_id: "em1",
      criterion_id: "impact-planning",
      description: "Ensures that roadmaps match company priorities and that prioritization/focus is appropriate. Ensures that cross-team dependencies are well-communicated in advance & committed-to.",
      created_at: new Date()
    },
    {
      id: 15,
      job_level_id: "l3",
      criterion_id: "collaboration-communication-skills",
      description: "Demonstrates good communication skills, both written and verbal. Is able to respectfully collaborate with colleagues. Is aware how their emotions and those of their colleagues affect the work environment",
      created_at: new Date()
    },
    {
      id: 16,
      job_level_id: "l5",
      criterion_id: "collaboration-communication-skills",
      description: "Demonstrates a mastery of communications and handles cross functional interactions. Sets the standard for communication, ensuring effective dialogue both within the their team and with external departments or stakeholders.",
      created_at: new Date()
    },
    {
      id: 17,
      job_level_id: "em1",
      criterion_id: "collaboration-communication-skills",
      description: "Demonstrates a mastery of communications and handles cross functional interactions. Sets the standard for communication, ensuring effective dialogue both within the their team and with external departments or stakeholders. Is skilled at navigating interpersonal issues and demonstrates high emotional intelligence.",
      created_at: new Date()
    }
  ],
  editHistory: [
    { id: 1, date: "2024-05-20", description: "v1 published, previous docs deprecated", created_at: new Date() },
    { id: 2, date: "2024-05-25", description: "Made some Director-level rows more explicit", created_at: new Date() },
    { id: 3, date: "2024-05-25", description: "Explicitly list 'Bias to Action' for TLs+", created_at: new Date() },
    { id: 4, date: "2024-05-25", description: "Spellcheck", created_at: new Date() },
    { id: 5, date: "2024-05-29", description: "Tweaked language around complexity - celebrate simple designs that address complex problems", created_at: new Date() }
  ],
  overview: {
    goals: [
      "process of reviews and promotion committees as well as for the process of hiring."
    ],
    principles: [
      "Most important is impact and ownership",
      "Criteria Matrix and levels unilateral across org; yet job titles and specific requirements/expectations may vary per department",
      "How do you hold people accountable if you don't know what they are SUPPOSED to be doing?"
    ]
  }
};

type ViewType = 'matrix' | 'overview' | 'history' | 'levels-summary' | 'criteria-overview';

function App() {
  const [matrixData, setMatrixData] = useState<EngineeringJobMatrixData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('matrix');

  // Load matrix data - currently using stub data due to placeholder backend handlers
  const loadMatrixData = useCallback(async () => {
    try {
      // TODO: Replace with real API call when backend is implemented
      // const result = await trpc.getMatrixData.query();
      
      // Using stub data for now - marked clearly as placeholder
      console.warn('Using stub data - backend handlers are placeholder implementations');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      setMatrixData(STUB_DATA);
    } catch (error) {
      console.error('Failed to load matrix data:', error);
      // Fallback to stub data even on error
      setMatrixData(STUB_DATA);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatrixData();
  }, [loadMatrixData]);

  const renderView = () => {
    if (!matrixData) return null;

    switch (currentView) {
      case 'matrix':
        return (
          <MatrixView 
            jobLevels={matrixData.jobLevels}
            criteria={matrixData.criteria}
            capabilities={matrixData.capabilities}
          />
        );
      case 'overview':
        return <OverviewView overview={matrixData.overview} />;
      case 'history':
        return <HistoryView editHistory={matrixData.editHistory} />;
      case 'levels-summary':
        return <LevelsSummaryView jobLevels={matrixData.jobLevels} />;
      case 'criteria-overview':
        return <CriteriaOverview criteria={matrixData.criteria} />;
      default:
        return (
          <MatrixView 
            jobLevels={matrixData.jobLevels}
            criteria={matrixData.criteria}
            capabilities={matrixData.capabilities}
          />
        );
    }
  };

  if (isLoading || !matrixData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="container mx-auto px-4 py-6">
        {renderView()}
      </main>
    </div>
  );
}

export default App;