import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

// Simple components for now
const Index = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-foreground mb-6">
          🏢 Nexus Platform
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Real Estate Investment Made Simple - Invest in premium real estate through blockchain technology
        </p>
        <div className="space-x-4">
          <Link to="/properties">
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary/90">
              Browse Properties
            </button>
          </Link>
          <Link to="/auth/signin">
            <button className="border border-primary text-primary px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary hover:text-primary-foreground">
              Sign In
            </button>
          </Link>
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

const Properties = () => (
  <div className="container mx-auto px-4 py-16">
    <h1 className="text-4xl font-bold text-center mb-8">Property Listings</h1>
    <p className="text-center text-muted-foreground">Property listings will be displayed here</p>
  </div>
);

const SignIn = () => (
  <div className="container mx-auto px-4 py-16">
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Sign In</h1>
      <div className="space-y-4">
        <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg" />
        <input type="password" placeholder="Password" className="w-full p-3 border rounded-lg" />
        <button className="w-full bg-primary text-primary-foreground p-3 rounded-lg">
          Sign In
        </button>
      </div>
    </div>
  </div>
);

const Navbar = () => (
  <nav className="border-b bg-background">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        <Link to="/" className="text-xl font-bold">🏢 Nexus Platform</Link>
        <div className="flex space-x-6">
          <Link to="/properties" className="hover:text-primary">Properties</Link>
          <Link to="/auth/signin" className="hover:text-primary">Sign In</Link>
        </div>
      </div>
    </div>
  </nav>
);

const App = () => (
  <BrowserRouter>
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/auth/signin" element={<SignIn />} />
        </Routes>
      </main>
    </div>
  </BrowserRouter>
);

export default App;
