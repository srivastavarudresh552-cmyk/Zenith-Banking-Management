import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-gray-400 py-8 px-4 mt-12">
        <div className="container-max text-center">
          <p>&copy; 2026 Zenith Banking System. All rights reserved. Secure banking made simple.</p>
        </div>
      </footer>
    </div>
  );
};
