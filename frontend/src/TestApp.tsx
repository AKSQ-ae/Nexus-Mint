import React from 'react';

export default function TestApp() {
  console.log('TestApp loading successfully');
  return (
    <div style={{ padding: '20px', fontSize: '18px' }}>
      <h1>Test App Loading</h1>
      <p>If you can see this, React is working properly.</p>
      <p>The useState error should be resolved now.</p>
    </div>
  );
}