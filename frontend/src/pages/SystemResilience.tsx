import React from 'react';
import { PaymentResilience } from '@/components/resilience/PaymentResilience';
import { SessionResilience } from '@/components/resilience/SessionResilience';
import { DatabaseResilience } from '@/components/resilience/DatabaseResilience';
import { SecurityResilience } from '@/components/resilience/SecurityResilience';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Shield, Database, User, CreditCard, AlertTriangle } from 'lucide-react';

export default function SystemResilience() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">System Resilience Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive monitoring and protection for critical financial operations
        </p>
      </div>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-yellow-700">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Mission-Critical Protection Active</span>
          </div>
          <p className="text-sm text-yellow-600 mt-2">
            All Tier 1 resilience systems are operational. Financial platform integrity is protected against failures, attacks, and data corruption.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Resilience
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Session Management
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database Integrity
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security Protection
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">Payment Gateway Resilience</h2>
            <p className="text-muted-foreground">
              Circuit breaker protection, automatic retries, and failure recovery for investment transactions
            </p>
          </div>
          <PaymentResilience />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">Session & Authentication Resilience</h2>
            <p className="text-muted-foreground">
              Proactive session management, automatic refresh, and backup restoration for uninterrupted access
            </p>
          </div>
          <SessionResilience />
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">Database Integrity & Resilience</h2>
            <p className="text-muted-foreground">
              Transaction monitoring, automatic backups, and data corruption prevention for financial records
            </p>
          </div>
          <DatabaseResilience />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">Security & Threat Protection</h2>
            <p className="text-muted-foreground">
              Real-time threat detection, SSL monitoring, and automated security responses
            </p>
          </div>
          <SecurityResilience />
        </TabsContent>
      </Tabs>
    </div>
  );
}