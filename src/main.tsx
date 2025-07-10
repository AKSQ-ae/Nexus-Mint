import { createRoot } from 'react-dom/client'
import './index.css'

const App = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            🏢 Nexus Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Real Estate Investment Made Simple - Invest in premium real estate through blockchain technology
          </p>
          <div className="space-y-4">
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary/90 mr-4">
              Browse Properties
            </button>
            <button className="border border-primary text-primary px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary hover:text-primary-foreground">
              Sign In
            </button>
          </div>
        </div>
        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 border rounded-lg">
            <div className="text-2xl mb-4">📈</div>
            <h3 className="text-lg font-semibold mb-2">High Returns</h3>
            <p className="text-muted-foreground">Earn 8-12% annual returns through rental income</p>
          </div>
          <div className="text-center p-6 border rounded-lg">
            <div className="text-2xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold mb-2">Secure & Transparent</h3>
            <p className="text-muted-foreground">Blockchain technology ensures secure transactions</p>
          </div>
          <div className="text-center p-6 border rounded-lg">
            <div className="text-2xl mb-4">💰</div>
            <h3 className="text-lg font-semibold mb-2">Accessible</h3>
            <p className="text-muted-foreground">Start investing with just $100</p>
          </div>
        </div>
      </div>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
