import React from 'react';
import Movies from './Movies';
import './componentCSS/TopBar.css'

function Dashboard() {
  return (
    <div>
      <div className="dashboard-content">
        <Movies/>
      </div>
    </div>
  );
};

export default Dashboard;