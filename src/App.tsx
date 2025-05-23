import React from 'react';
import { GlobalAlert } from './components/alert/GlobalAlert';
import { ToastContainer } from './components/toast/ToastContainer';
import IndexRouter from './router';
import FullScreenLoader from './components/FullScreenLoader';

export const App = () => {
  return (
    <div className="h-screen w-screen">
      <IndexRouter />
      <React.Suspense fallback={<FullScreenLoader />}>
        <GlobalAlert />
        <ToastContainer />
      </React.Suspense>
    </div>
  );
};
