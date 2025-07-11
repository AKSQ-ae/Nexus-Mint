import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { InvestmentSuccess } from "./pages/investment/InvestmentSuccess";
import { InvestmentCancel } from "./pages/investment/InvestmentCancel";

// Enhanced premium components
const Index = () => (
  <div className="min-h-screen">
    {/* Premium Hero Section */}
    <div className="hero-bg text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-secondary/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-glow/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-playfair font-bold mb-8 animate-fade-in-up">
            <span className="gradient-text">Nexus</span>
            <br />
            <span className="text-white">Platform</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 font-inter leading-relaxed animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Revolutionary Real Estate Investment Through Blockchain Technology
            <br />
            <span className="text-secondary font-medium">Start Building Wealth with Just $100</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <Link to="/properties">
              <button className="bg-secondary text-primary font-space font-semibold px-10 py-4 rounded-2xl text-lg hover:bg-secondary/90 transform hover:scale-105 transition-all duration-300 btn-glow shadow-premium">
                Explore Properties
              </button>
            </Link>
            <Link to="/auth/signin">
              <button className="border-2 border-white/30 text-white backdrop-blur-sm px-10 py-4 rounded-2xl text-lg font-space font-medium hover:bg-white/10 transform hover:scale-105 transition-all duration-300 glass">
                Start Investing
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>

    {/* Enhanced Features Section */}
    <div className="py-32 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-foreground mb-6">
            Why Choose <span className="gradient-text">Nexus</span>?
          </h2>
          <p className="text-xl text-muted-foreground font-inter max-w-2xl mx-auto">
            Experience the future of real estate investment with our cutting-edge platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="card-premium p-8 text-center group animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <div className="w-20 h-20 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl group-hover:animate-glow-pulse">
              📈
            </div>
            <h3 className="text-2xl font-playfair font-semibold mb-4 text-foreground">Premium Returns</h3>
            <p className="text-muted-foreground font-inter leading-relaxed">
              Earn 8-15% annual returns through carefully selected premium real estate investments and rental income
            </p>
          </div>
          
          <div className="card-premium p-8 text-center group animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="w-20 h-20 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl group-hover:animate-glow-pulse">
              🔒
            </div>
            <h3 className="text-2xl font-playfair font-semibold mb-4 text-foreground">Bank-Grade Security</h3>
            <p className="text-muted-foreground font-inter leading-relaxed">
              Military-grade encryption and blockchain technology ensure your investments are completely secure and transparent
            </p>
          </div>
          
          <div className="card-premium p-8 text-center group animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <div className="w-20 h-20 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl group-hover:animate-glow-pulse">
              💎
            </div>
            <h3 className="text-2xl font-playfair font-semibold mb-4 text-foreground">Accessible Luxury</h3>
            <p className="text-muted-foreground font-inter leading-relaxed">
              Own fractional shares in premium properties worldwide starting with just $100 minimum investment
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Properties = () => (
  <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
    <div className="container mx-auto px-4 py-24">
      <div className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-5xl md:text-6xl font-playfair font-bold text-foreground mb-6">
          Premium <span className="gradient-text">Properties</span>
        </h1>
        <p className="text-xl text-muted-foreground font-inter max-w-2xl mx-auto">
          Discover exclusive real estate investment opportunities in prime locations worldwide
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card-premium overflow-hidden animate-fade-in-up" style={{animationDelay: `${i * 0.1}s`}}>
            <div className="h-48 bg-gradient-secondary/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
              <div className="absolute top-4 left-4">
                <span className="bg-secondary text-primary px-3 py-1 rounded-full text-sm font-space font-semibold">
                  Featured
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-playfair font-semibold mb-2">Luxury Villa #{i}</h3>
              <p className="text-muted-foreground mb-4 font-inter">Prime location with premium amenities</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-space font-bold text-primary">$2.5M</span>
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-space font-medium hover:bg-primary/90 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SignIn = () => (
  <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="card-premium p-8 animate-scale-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-playfair font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground font-inter">Sign in to your Nexus account</p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-space font-medium text-foreground">Email</label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full p-4 border border-border rounded-xl bg-background text-foreground font-inter focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-space font-medium text-foreground">Password</label>
              <input 
                type="password" 
                placeholder="Enter your password" 
                className="w-full p-4 border border-border rounded-xl bg-background text-foreground font-inter focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200" 
              />
            </div>
            <button className="w-full bg-gradient-primary text-white p-4 rounded-xl font-space font-semibold hover:shadow-premium transition-all duration-300 btn-glow">
              Sign In
            </button>
            
            <div className="text-center">
              <p className="text-muted-foreground font-inter">
                Don't have an account?{' '}
                <span className="text-primary font-semibold cursor-pointer animated-underline">
                  Sign up here
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Navbar = () => (
  <nav className="bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between h-20">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-secondary rounded-xl flex items-center justify-center text-primary font-bold text-xl group-hover:scale-110 transition-transform duration-200">
            N
          </div>
          <span className="text-2xl font-playfair font-bold text-foreground group-hover:text-primary transition-colors duration-200">
            Nexus
          </span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/properties" className="font-space font-medium text-foreground hover:text-primary transition-colors duration-200 animated-underline">
            Properties
          </Link>
          <Link to="/about" className="font-space font-medium text-foreground hover:text-primary transition-colors duration-200 animated-underline">
            About
          </Link>
          <Link to="/portfolio" className="font-space font-medium text-foreground hover:text-primary transition-colors duration-200 animated-underline">
            Portfolio
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/auth/signin">
            <button className="border border-border text-foreground px-6 py-2 rounded-xl font-space font-medium hover:bg-muted transition-all duration-200">
              Sign In
            </button>
          </Link>
          <Link to="/auth/signup">
            <button className="bg-gradient-primary text-white px-6 py-2 rounded-xl font-space font-medium hover:shadow-premium transition-all duration-300 btn-glow">
              Get Started
            </button>
          </Link>
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
          <Route path="/investment/success" element={<InvestmentSuccess />} />
          <Route path="/investment/cancel" element={<InvestmentCancel />} />
        </Routes>
      </main>
    </div>
  </BrowserRouter>
);

export default App;
