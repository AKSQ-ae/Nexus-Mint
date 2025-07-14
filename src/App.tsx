import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import AIReview from "./pages/AIReview";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1">
        <AIReview />
      </main>
      <Toaster />
    </div>
  );
}

export default App;