import { lazy, Suspense } from 'react';
import App from './App';
import { isAppPath, useLocationKey } from './lib/router';

const HopApp = lazy(() => import('./app/HopApp'));

export function Root() {
  const key = useLocationKey();
  if (isAppPath(key)) {
    return (
      <Suspense fallback={<div className="min-h-svh bg-paper" />}>
        <HopApp />
      </Suspense>
    );
  }
  return <App />;
}
