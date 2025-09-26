import React, { useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';

function MinimalApp() {
  return (
    <ErrorBoundary>
      <div className="h-screen flex bg-gray-900 text-white">
        <div className="w-80 bg-gray-800 border-r border-gray-700 p-4">
          <h1 className="text-xl font-bold mb-4">NotePilot</h1>
          <p className="text-gray-300">Sidebar working</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">App is Working!</h2>
            <p className="text-gray-400">This is a minimal version to test functionality</p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default MinimalApp;