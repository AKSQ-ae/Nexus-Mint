import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSetup } from '@/components/profile/ProfileSetup';
import { KYCUpload } from '@/components/kyc/KYCUpload';
import { WalletConnection } from '@/components/wallet/WalletConnection';
import { PaymentMethods } from '@/components/payment/PaymentMethods';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { User, FileText, Wallet, CreditCard, Bell } from 'lucide-react';

export default function Profile() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Account Settings</h1>
        <p className="text-lg text-muted-foreground">
          Complete your setup to start investing in premium real estate
        </p>
        
        {/* Quick Setup Guide */}
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
          <h3 className="font-semibold text-foreground mb-2">🚀 Quick Setup Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span>1. Complete Profile</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>2. Upload KYC Documents</span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              <span>3. Connect Wallet</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="kyc" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            KYC
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSetup />
        </TabsContent>

        <TabsContent value="kyc">
          <KYCUpload />
        </TabsContent>

        <TabsContent value="wallet">
          <WalletConnection />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentMethods />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
}