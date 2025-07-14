import React, { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
}