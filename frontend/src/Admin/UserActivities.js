import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";

const UserActivities = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchLogs = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/users/logs", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        console.log(data);

        if (response.ok) {
          // Sort the logs array in descending order based on the timestamp
          const sortedLogs = data.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );

          setLogs(
            sortedLogs.map((log, idx) => ({
              id: idx,
              username: log.username,
              activity: log.activity,
              timestamp: new Date(log.timestamp).toLocaleString(),
            }))
          );
        } else {
          console.error(data);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchLogs();
  }, []);

  const columns = [
    { field: "username", headerName: "Username", width: 200 },
    { field: "activity", headerName: "Activity", width: 300 },
    { field: "timestamp", headerName: "Timestamp", width: 200 },
  ];

  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid rows={logs} columns={columns} pageSize={5} />
    </div>
  );
};

export default UserActivities;
