const App = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'white',
      padding: '50px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{
        fontSize: '48px',
        color: 'black',
        textAlign: 'center',
        margin: '0 0 20px 0'
      }}>
        🏢 Nexus Platform
      </h1>
      <p style={{
        fontSize: '18px',
        color: '#666',
        textAlign: 'center',
        margin: '0 0 30px 0'
      }}>
        Real Estate Investment Made Simple
      </p>
      <div style={{ textAlign: 'center' }}>
        <button style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer'
        }}>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default App;
