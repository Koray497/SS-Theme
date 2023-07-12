import React, { useState } from "react";
import { Tab, Tabs, Typography } from "@mui/material";
import UserActivities from "./UserActivities";
import Answers from "./Answer";
import DataExport from "./DataExport";
import "../css/Admin.css";

const Admin = () => {
  const [activeTab, setActiveTab] = useState(0);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 0:
        return <UserActivities />;
      case 1:
        return <Answers />;
      case 2:
        return <DataExport />;
      default:
        return null;
    }
  };

  return (
    <div className="container">
      <Typography variant="h4">Admin Dashboard</Typography>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        centered
      >
        <Tab label="User Activities" />
        <Tab label="Answer Management" />
        <Tab label="Data Export" />
      </Tabs>

      <div className="content">{renderActiveTab()}</div>
    </div>
  );
};

export default Admin;
