import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronDown, Search, Filter, X } from 'lucide-react';
// Using type-only imports for better TypeScript compliance
import type { JobLevel, Criterion, Capability } from '../../../server/src/schema';

interface MatrixViewProps {
  jobLevels: JobLevel[];
  criteria: Criterion[];
  capabilities: Capability[];
}

interface Filters {
  levels: string[];
  categories: string[];
  subCategories: string[];
  search: string;
}

export function MatrixView({ jobLevels, criteria, capabilities }: MatrixViewProps) {
  const [filters, setFilters] = useState<Filters>({
    levels: jobLevels.map(level => level.id), // Default to all levels selected
    categories: [],
    subCategories: [],
    search: ''
  });
  
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Group criteria by category for better organization (currently unused but kept for future features)
  // const criteriaByCategory = useMemo(() => {
  //   const grouped: Record<string, Criterion[]> = {};
  //   criteria.forEach((criterion: Criterion) => {
  //     if (!grouped[criterion.category]) {
  //       grouped[criterion.category] = [];
  //     }
  //     grouped[criterion.category].push(criterion);
  //   });
  //   return grouped;
  // }, [criteria]);

  // Get unique categories and subcategories
  const categories = useMemo(() => 
    Array.from(new Set(criteria.map((c: Criterion) => c.category))).sort(),
    [criteria]
  );

  const subCategories = useMemo(() => 
    Array.from(new Set(criteria.map((c: Criterion) => c.sub_category))).sort(),
    [criteria]
  );

  // Filter capabilities based on current filters
  const filteredCapabilities = useMemo(() => {
    return capabilities.filter((capability: Capability) => {
      // Filter by selected levels
      if (filters.levels.length > 0 && !filters.levels.includes(capability.job_level_id)) {
        return false;
      }

      // Find the criterion for this capability
      const criterion = criteria.find((c: Criterion) => c.id === capability.criterion_id);
      if (!criterion) return false;

      // Filter by categories
      if (filters.categories.length > 0 && !filters.categories.includes(criterion.category)) {
        return false;
      }

      // Filter by subcategories
      if (filters.subCategories.length > 0 && !filters.subCategories.includes(criterion.sub_category)) {
        return false;
      }

      // Filter by search text
      if (filters.search && !capability.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [capabilities, criteria, filters]);

  // Organize filtered capabilities for display
  const matrixData = useMemo(() => {
    const result: Record<string, Record<string, Record<string, string>>> = {};
    
    filteredCapabilities.forEach((capability: Capability) => {
      const criterion = criteria.find((c: Criterion) => c.id === capability.criterion_id);
      if (!criterion) return;

      if (!result[criterion.category]) {
        result[criterion.category] = {};
      }
      if (!result[criterion.category][criterion.sub_category]) {
        result[criterion.category][criterion.sub_category] = {};
      }
      
      result[criterion.category][criterion.sub_category][capability.job_level_id] = capability.description;
    });

    return result;
  }, [filteredCapabilities, criteria]);

  // Get filtered job levels for display
  const displayedLevels = useMemo(() => 
    jobLevels.filter((level: JobLevel) => filters.levels.includes(level.id)),
    [jobLevels, filters.levels]
  );

  const handleLevelFilterChange = (levelId: string, checked: boolean) => {
    setFilters((prev: Filters) => ({
      ...prev,
      levels: checked 
        ? [...prev.levels, levelId]
        : prev.levels.filter(id => id !== levelId)
    }));
  };

  const handleCategoryFilterChange = (category: string, checked: boolean) => {
    setFilters((prev: Filters) => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };

  const handleSubCategoryFilterChange = (subCategory: string, checked: boolean) => {
    setFilters((prev: Filters) => ({
      ...prev,
      subCategories: checked 
        ? [...prev.subCategories, subCategory]
        : prev.subCategories.filter(sc => sc !== subCategory)
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      levels: jobLevels.map(level => level.id),
      categories: [],
      subCategories: [],
      search: ''
    });
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Engineering Job Matrix</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Compare capabilities and expectations across different engineering levels and criteria. 
          Use filters to focus on specific roles or areas of interest.
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search & Filters</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search capability descriptions..."
              value={filters.search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFilters((prev: Filters) => ({ ...prev, search: e.target.value }))
              }
              className="pl-10"
            />
            {filters.search && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters((prev: Filters) => ({ ...prev, search: '' }))}
                className="absolute right-2 top-2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Collapsible Filters */}
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleContent className="space-y-4">
              {/* Job Levels Filter */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Job Levels</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {jobLevels.map((level: JobLevel) => (
                    <div key={level.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`level-${level.id}`}
                        checked={filters.levels.includes(level.id)}
                        onCheckedChange={(checked: boolean) => handleLevelFilterChange(level.id, checked)}
                      />
                      <Label
                        htmlFor={`level-${level.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {level.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories Filter */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Categories</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {categories.map((category: string) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={(checked: boolean) => handleCategoryFilterChange(category, checked)}
                      />
                      <Label
                        htmlFor={`category-${category}`}
                        className="text-sm cursor-pointer"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub-categories Filter */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Sub-categories</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {subCategories.map((subCategory: string) => (
                    <div key={subCategory} className="flex items-center space-x-2">
                      <Checkbox
                        id={`subcategory-${subCategory}`}
                        checked={filters.subCategories.includes(subCategory)}
                        onCheckedChange={(checked: boolean) => handleSubCategoryFilterChange(subCategory, checked)}
                      />
                      <Label
                        htmlFor={`subcategory-${subCategory}`}
                        className="text-sm cursor-pointer"
                      >
                        {subCategory}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {filteredCapabilities.length} capabilities shown
                  </Badge>
                </div>
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Matrix Display */}
      <Card>
        <CardHeader>
          <CardTitle>Capability Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(matrixData).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No capabilities match your current filters.</p>
              <Button variant="outline" onClick={clearAllFilters} className="mt-4">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-max">
                {/* Headers */}
                <div className="grid grid-cols-[200px_200px_repeat(auto-fit,minmax(300px,1fr))] gap-4 mb-4 font-medium">
                  <div className="text-sm text-gray-600">Category</div>
                  <div className="text-sm text-gray-600">Sub-category</div>
                  {displayedLevels.map((level: JobLevel) => (
                    <div key={level.id} className="text-sm text-center">
                      <div className="font-semibold text-gray-900">{level.name}</div>
                      <div className="text-xs text-gray-500">{level.primary_title}</div>
                    </div>
                  ))}
                </div>

                {/* Matrix Rows */}
                {Object.entries(matrixData).map(([category, subCategories]) => (
                  <div key={category} className="mb-6">
                    {Object.entries(subCategories).map(([subCategory, levelDescriptions]) => (
                      <div
                        key={`${category}-${subCategory}`}
                        className="grid grid-cols-[200px_200px_repeat(auto-fit,minmax(300px,1fr))] gap-4 py-3 border-b border-gray-100 hover:bg-gray-50/50"
                      >
                        <div className="font-medium text-gray-900">{category}</div>
                        <div className="text-gray-700">{subCategory}</div>
                        {displayedLevels.map((level: JobLevel) => (
                          <div key={level.id} className="text-sm">
                            {levelDescriptions[level.id] ? (
                              <div className="p-3 bg-white border border-gray-200 rounded-md">
                                {highlightSearchTerm(levelDescriptions[level.id], filters.search)}
                              </div>
                            ) : (
                              <div className="p-3 text-gray-400 text-center italic">
                                No description available
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}