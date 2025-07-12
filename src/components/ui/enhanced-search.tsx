import { useState, useEffect } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { Card } from './card';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'property' | 'page' | 'action' | 'user';
  href?: string;
  action?: () => void;
  metadata?: Record<string, any>;
}

interface EnhancedSearchProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => Promise<SearchResult[]>;
  showRecentSearches?: boolean;
  showSuggestions?: boolean;
}

export function EnhancedSearch({ 
  placeholder = "Search properties, pages, and more...",
  className,
  onSearch,
  showRecentSearches = true,
  showSuggestions = true
}: EnhancedSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Search handler with debouncing
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        if (onSearch) {
          const searchResults = await onSearch(query);
          setResults(searchResults);
        } else {
          // Default search behavior
          const defaultResults = await performDefaultSearch(query);
          setResults(defaultResults);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  const performDefaultSearch = async (searchQuery: string): Promise<SearchResult[]> => {
    // Simulate API call with mock data
    const mockResults: SearchResult[] = [
      {
        id: '1',
        title: 'Dubai Marina Luxury Apartment',
        description: 'Premium waterfront living with 8% annual returns',
        type: 'property',
        href: '/properties/1',
        metadata: { price: 'AED 2.5M', returns: '8%' }
      },
      {
        id: '2',
        title: 'Portfolio Dashboard',
        description: 'View your investments and performance',
        type: 'page',
        href: '/portfolio'
      },
      {
        id: '3',
        title: 'Properties',
        description: 'Browse all available investment opportunities',
        type: 'page',
        href: '/properties'
      }
    ];

    return mockResults.filter(result => 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      // Add to recent searches
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recent-searches', JSON.stringify(updated));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        } else if (query.trim()) {
          handleSearch(query);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    handleSearch(query);
    if (result.action) {
      result.action();
    } else if (result.href) {
      window.location.href = result.href;
    }
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent-searches');
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'property': return '🏢';
      case 'page': return '📄';
      case 'action': return '⚡';
      case 'user': return '👤';
      default: return '🔍';
    }
  };

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="global-search"
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length > 0) {
              setIsOpen(true);
            }
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            // Only auto-open if there's content or we want to show suggestions
            if (query || showRecentSearches || showSuggestions) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
              setSelectedIndex(-1);
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query.length > 0 || (showRecentSearches && recentSearches.length > 0) || (showSuggestions && recentSearches.length === 0)) && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-[9998] max-h-96 overflow-hidden shadow-2xl border-2 border-primary/20 bg-white" data-state="open">
          <div className="max-h-96 overflow-y-auto">
            {/* Loading State */}
            {isLoading && (
              <div className="p-4 text-center text-muted-foreground">
                Searching...
              </div>
            )}

            {/* Search Results */}
            {!isLoading && query && results.length > 0 && (
              <div>
                <div className="p-2 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b">
                  Results
                </div>
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={cn(
                      "w-full text-left p-3 hover:bg-muted/50 transition-colors flex items-center gap-3",
                      selectedIndex === index && "bg-muted/50"
                    )}
                  >
                    <span className="text-lg">{getResultIcon(result.type)}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{result.title}</div>
                      <div className="text-xs text-muted-foreground">{result.description}</div>
                      {result.metadata && (
                        <div className="flex gap-2 mt-1">
                          {Object.entries(result.metadata).map(([key, value]) => (
                            <span key={key} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && query && results.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                No results found for "{query}"
              </div>
            )}

            {/* Recent Searches */}
            {!query && showRecentSearches && recentSearches.length > 0 && (
              <div>
                <div className="p-2 flex items-center justify-between border-b">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Recent Searches
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="text-xs h-6 px-2"
                  >
                    Clear
                  </Button>
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(search);
                      handleSearch(search);
                    }}
                    className="w-full text-left p-3 hover:bg-muted/50 transition-colors flex items-center gap-3"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{search}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Popular Searches */}
            {!query && showSuggestions && recentSearches.length === 0 && (
              <div>
                <div className="p-2 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b">
                  Popular Searches
                </div>
                {['Dubai Marina', 'High Yield Properties', 'Downtown Investments'].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(suggestion);
                      handleSearch(suggestion);
                    }}
                    className="w-full text-left p-3 hover:bg-muted/50 transition-colors flex items-center gap-3"
                  >
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9997]" 
          onClick={() => setIsOpen(false)}
          data-search-backdrop="true"
        />
      )}
    </div>
  );
}