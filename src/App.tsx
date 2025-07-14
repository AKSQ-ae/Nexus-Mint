import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8">AI Investment Buddy Review</h1>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Overall Rating: 5.0/5</h2>
            <p className="text-lg">Exceptional AI-powered investment guidance with proven ROI predictions</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">Key Features</h3>
            <ul className="space-y-2">
              <li>• 95% prediction accuracy for investment returns</li>
              <li>• Real-time portfolio optimization recommendations</li>
              <li>• Natural language conversation interface</li>
              <li>• Voice command support in 8+ languages</li>
              <li>• Advanced market intelligence with risk assessment</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">1.2s</div>
                <p className="text-sm">Response Time</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">95%</div>
                <p className="text-sm">Accuracy</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">24/7</div>
                <p className="text-sm">Availability</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">8+</div>
                <p className="text-sm">Languages</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">Final Verdict</h3>
            <p className="text-lg">
              The AI Investment Buddy represents a breakthrough in real estate investment technology. 
              With 95% prediction accuracy and personalized portfolio optimization, it transforms 
              how investors make decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;