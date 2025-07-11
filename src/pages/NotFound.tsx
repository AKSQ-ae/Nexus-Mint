import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Home, Search, HelpCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const quickLinks = [
    { label: "Properties", path: "/properties", icon: Search },
    { label: "Analytics", path: "/analytics", icon: HelpCircle },
    { label: "Trading", path: "/global-trading", icon: Search },
    { label: "Demo", path: "/demo", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <h1 className="text-6xl font-bold mb-4 text-foreground">404</h1>
          <p className="text-xl text-muted-foreground mb-4">Page not found</p>
          <p className="text-sm text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={handleGoBack} variant="outline" className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button asChild className="flex-1">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Quick Links</p>
              <div className="grid grid-cols-2 gap-2">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Button 
                      key={link.path}
                      asChild 
                      variant="ghost" 
                      size="sm"
                      className="h-auto p-2"
                    >
                      <Link to={link.path} className="flex flex-col items-center gap-1">
                        <Icon className="h-4 w-4" />
                        <span className="text-xs">{link.label}</span>
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
