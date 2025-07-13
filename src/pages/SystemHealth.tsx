import { SystemHealthMonitor } from '@/components/analytics/SystemHealthMonitor';
import { SystemHealthDisplay } from '@/components/monitoring/SystemHealthEndpoint';

export default function SystemHealth() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">System Health Dashboard</h1>
      <div className="space-y-8">
        <SystemHealthDisplay />
        <SystemHealthMonitor />
      </div>
    </div>
  );
}