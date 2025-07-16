import React, { useState } from 'react';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  DollarSign, 
  TrendingUp, 
  Building2, 
  Shield, 
  Settings,
  MessageCircle,
  Check,
  CheckCheck,
  X,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const notificationIcons = {
  investment: DollarSign,
  return: TrendingUp,
  property_update: Building2,
  kyc: Shield,
  system: Settings,
  chat: MessageCircle,
};

const notificationColors = {
  investment: 'text-green-600',
  return: 'text-blue-600',
  property_update: 'text-purple-600',
  kyc: 'text-orange-600',
  system: 'text-gray-600',
  chat: 'text-pink-600',
};

export function EnhancedNotificationCenter() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useRealTimeNotifications();

  const [selectedTab, setSelectedTab] = useState('all');

  const filteredNotifications = notifications.filter(notification => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'unread') return !notification.read;
    return notification.type === selectedTab;
  });

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const notificationTypes = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'investment', label: 'Investments', count: notifications.filter(n => n.type === 'investment').length },
    { value: 'return', label: 'Returns', count: notifications.filter(n => n.type === 'return').length },
    { value: 'property_update', label: 'Properties', count: notifications.filter(n => n.type === 'property_update').length },
    { value: 'kyc', label: 'KYC', count: notifications.filter(n => n.type === 'kyc').length },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <div className="px-6 pb-3">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              {notificationTypes.map((type) => (
                <TabsTrigger
                  key={type.value}
                  value={type.value}
                  className="flex items-center gap-1 text-xs"
                >
                  {type.label}
                  {type.count > 0 && (
                    <Badge variant="secondary" className="h-4 w-4 rounded-full p-0 text-xs">
                      {type.count > 99 ? '99+' : type.count}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {notificationTypes.map((type) => (
            <TabsContent key={type.value} value={type.value} className="mt-0">
              <ScrollArea className="h-96">
                {filteredNotifications.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No notifications</p>
                    <p className="text-sm">
                      {selectedTab === 'unread' ? "You're all caught up!" : "No notifications in this category."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredNotifications.map((notification) => {
                      const Icon = notificationIcons[notification.type as keyof typeof notificationIcons] || Bell;
                      const iconColor = notificationColors[notification.type as keyof typeof notificationColors] || 'text-gray-600';
                      
                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            "flex items-start gap-3 p-4 hover:bg-muted/50 cursor-pointer border-l-4 transition-colors",
                            !notification.read 
                              ? "bg-muted/30 border-l-primary" 
                              : "border-l-transparent",
                            notification.priority >= 3 && "bg-red-50 border-l-red-500"
                          )}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className={cn("flex-shrink-0 mt-1", iconColor)}>
                            <Icon className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className={cn(
                                  "text-sm font-medium mb-1",
                                  !notification.read && "font-semibold"
                                )}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {notification.message}
                                </p>
                                
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-muted-foreground">
                                    {getTimeAgo(notification.created_at)}
                                  </span>
                                  
                                  <Badge variant="outline" className="text-xs">
                                    {notification.type.replace('_', ' ')}
                                  </Badge>
                                  
                                  {notification.priority >= 3 && (
                                    <Badge variant="destructive" className="text-xs">
                                      High Priority
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                {notification.action_url && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleNotificationClick(notification);
                                    }}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                )}
                                
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}