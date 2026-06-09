import { RouterProvider } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './router';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <SpeedInsights />
    </AuthProvider>
  );
}

export default App;
