import React, { useState } from 'react';
import UserActivities from './UserActivities.js';
import Answers from './Answer.js';
import DataExport from './DataExport.js';
import '../css/Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState("UserActivities");

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'UserActivities':
        return <UserActivities />;
      case 'Answers':
        return <Answers />;
      case 'DataExport':
        return <DataExport />;
      default:
        return null;
    }
  };

  return (
    <div className="container">
      <div className="sidebar">
        <ul>
        <li><span role="button" onClick={() => setActiveTab("UserActivities")} >User Activities</span></li>
        <li><span role="button" onClick={() => setActiveTab("Answers")} >Answer Management</span></li>
        <li><span role="button" onClick={() => setActiveTab("DataExport")} >Data Export</span></li>
        </ul>
      </div>
      <div className="active-tab">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default Admin;
