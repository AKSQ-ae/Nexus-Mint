import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  GripVertical, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  DollarSign,
  Building,
  Bell,
  Calendar,
  Globe,
  Sparkles
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Widget {
  id: string;
  title: string;
  component: string;
  isVisible: boolean;
  size: 'small' | 'medium' | 'large';
  icon: React.ReactNode;
  description: string;
  category: 'overview' | 'analytics' | 'alerts' | 'actions';
}

interface CustomizableWidgetsProps {
  children: React.ReactNode;
  userId?: string;
}

const DEFAULT_WIDGETS: Widget[] = [
  {
    id: 'portfolio-value',
    title: 'Portfolio Value',
    component: 'PortfolioValue',
    isVisible: true,
    size: 'medium',
    icon: <DollarSign className="h-4 w-4" />,
    description: 'Total portfolio value and growth',
    category: 'overview'
  },
  {
    id: 'total-invested',
    title: 'Total Invested',
    component: 'TotalInvested',
    isVisible: true,
    size: 'medium',
    icon: <Building className="h-4 w-4" />,
    description: 'Total amount invested across all properties',
    category: 'overview'
  },
  {
    id: 'performance-chart',
    title: 'Performance Chart',
    component: 'PerformanceChart',
    isVisible: true,
    size: 'large',
    icon: <BarChart3 className="h-4 w-4" />,
    description: 'Portfolio performance over time',
    category: 'analytics'
  },
  {
    id: 'allocation-chart',
    title: 'Allocation Chart',
    component: 'AllocationChart',
    isVisible: true,
    size: 'large',
    icon: <PieChart className="h-4 w-4" />,
    description: 'Investment distribution by property type',
    category: 'analytics'
  },
  {
    id: 'smart-alerts',
    title: 'AI Insights',
    component: 'SmartAlerts',
    isVisible: true,
    size: 'large',
    icon: <Sparkles className="h-4 w-4" />,
    description: 'AI-powered recommendations and alerts',
    category: 'alerts'
  },
  {
    id: 'recent-transactions',
    title: 'Recent Transactions',
    component: 'RecentTransactions',
    isVisible: true,
    size: 'large',
    icon: <Calendar className="h-4 w-4" />,
    description: 'Latest investment activity',
    category: 'overview'
  },
  {
    id: 'market-news',
    title: 'Market News',
    component: 'MarketNews',
    isVisible: false,
    size: 'medium',
    icon: <Globe className="h-4 w-4" />,
    description: 'Latest real estate market updates',
    category: 'alerts'
  },
  {
    id: 'roi-tracker',
    title: 'ROI Tracker',
    component: 'ROITracker',
    isVisible: false,
    size: 'medium',
    icon: <TrendingUp className="h-4 w-4" />,
    description: 'Return on investment tracking',
    category: 'analytics'
  }
];

export function CustomizableWidgets({ children, userId }: CustomizableWidgetsProps) {
  const [widgets, setWidgets] = useState<Widget[]>(DEFAULT_WIDGETS);
  const [isCustomizing, setIsCustomizing] = useState(false);

  useEffect(() => {
    // Load user's widget preferences from localStorage
    const savedWidgets = localStorage.getItem(`dashboard-widgets-${userId || 'default'}`);
    if (savedWidgets) {
      try {
        const parsed = JSON.parse(savedWidgets);
        setWidgets(parsed);
      } catch (error) {
        console.error('Error loading widget preferences:', error);
      }
    }
  }, [userId]);

  const saveWidgetPreferences = (newWidgets: Widget[]) => {
    setWidgets(newWidgets);
    localStorage.setItem(`dashboard-widgets-${userId || 'default'}`, JSON.stringify(newWidgets));
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    const newWidgets = widgets.map(widget =>
      widget.id === widgetId ? { ...widget, isVisible: !widget.isVisible } : widget
    );
    saveWidgetPreferences(newWidgets);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    saveWidgetPreferences(items);
  };

  const resetToDefault = () => {
    saveWidgetPreferences(DEFAULT_WIDGETS);
  };

  const getVisibleWidgets = () => {
    return widgets.filter(widget => widget.isVisible);
  };

  const getCategoryWidgets = (category: string) => {
    return widgets.filter(widget => widget.category === category);
  };

  return (
    <div className="space-y-6">
      {/* Customization Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Customize your investment overview</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Customize
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Customize Dashboard</DialogTitle>
              <DialogDescription>
                Choose which widgets to display and arrange them to your preference.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Widget Categories */}
              {['overview', 'analytics', 'alerts', 'actions'].map(category => (
                <div key={category} className="space-y-3">
                  <h3 className="font-semibold capitalize">{category} Widgets</h3>
                  <div className="space-y-2">
                    {getCategoryWidgets(category).map(widget => (
                      <div
                        key={widget.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {widget.icon}
                          <div>
                            <p className="font-medium">{widget.title}</p>
                            <p className="text-sm text-muted-foreground">{widget.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {widget.size}
                          </Badge>
                          <Switch
                            checked={widget.isVisible}
                            onCheckedChange={() => toggleWidgetVisibility(widget.id)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Drag and Drop Reordering */}
              <div className="space-y-3">
                <h3 className="font-semibold">Widget Order</h3>
                <p className="text-sm text-muted-foreground">
                  Drag widgets to reorder them on your dashboard.
                </p>
                
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="widgets">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {getVisibleWidgets().map((widget, index) => (
                          <Draggable key={widget.id} draggableId={widget.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`flex items-center gap-3 p-3 border rounded-lg transition-all ${
                                  snapshot.isDragging ? 'shadow-lg bg-background' : 'hover:bg-muted/50'
                                }`}
                              >
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                {widget.icon}
                                <span className="font-medium">{widget.title}</span>
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  {index + 1}
                                </Badge>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>

              {/* Reset Button */}
              <div className="pt-4 border-t">
                <Button variant="outline" onClick={resetToDefault} className="w-full">
                  Reset to Default Layout
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {React.Children.toArray(children).filter((_, index) => {
          const visibleWidgets = getVisibleWidgets();
          return index < visibleWidgets.length && visibleWidgets[index]?.isVisible;
        })}
      </div>

      {/* Widget Status */}
      <div className="text-center text-sm text-muted-foreground">
        Showing {getVisibleWidgets().length} of {widgets.length} available widgets
      </div>
    </div>
  );
}