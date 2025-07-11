import { StatusIndicator } from "./status-indicator";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface SystemStatusData {
  id: string;
  label: string;
  status: "healthy" | "warning" | "error";
  tooltip: string;
}

const systemStatus: SystemStatusData[] = [
  {
    id: "database",
    label: "Database Connection",
    status: "healthy",
    tooltip: "Database: 98ms response time"
  },
  {
    id: "api",
    label: "API Services", 
    status: "healthy",
    tooltip: "API Gateway: All endpoints responding"
  },
  {
    id: "blockchain",
    label: "Blockchain Sync",
    status: "healthy", 
    tooltip: "Blockchain: 15,847 blocks synced"
  },
  {
    id: "cache",
    label: "Cache Server",
    status: "warning",
    tooltip: "Cache: 85% memory usage - monitoring"
  },
  {
    id: "security",
    label: "Security Systems",
    status: "healthy",
    tooltip: "Security: All scans passed"
  }
];

export function SystemStatus() {
  const overallStatus = systemStatus.some(s => s.status === "error") 
    ? "error" 
    : systemStatus.some(s => s.status === "warning") 
    ? "warning" 
    : "healthy";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          🏢 Nexus Tokenization Platform
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">System Status</h3>
          <div className="space-y-2">
            {systemStatus.map((item) => (
              <StatusIndicator
                key={item.id}
                status={item.status}
                label={item.label}
                tooltip={item.tooltip}
              />
            ))}
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <StatusIndicator
            status={overallStatus}
            label="All systems configured and ready!"
            tooltip="All critical systems operational - 99.8% uptime"
            className="font-medium"
          />
        </div>
      </CardContent>
    </Card>
  );
}