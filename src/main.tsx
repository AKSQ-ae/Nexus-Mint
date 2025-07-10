import { createRoot } from 'react-dom/client'

const App = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'red',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px',
      fontFamily: 'Arial'
    }}>
      <h1>NEXUS PLATFORM TEST - IF YOU SEE THIS, REACT IS WORKING</h1>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
