import React, { useState } from "react";
import Button from "@mui/material/Button";
import { Box, Typography } from "@mui/material";

const DownloadForms = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState("");
  const [isPreviewShown, setIsPreviewShown] = useState(false);

  const downloadForms = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const response = await fetch("http://127.0.0.1:5000/api/forms/getall", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    const jsonData = JSON.stringify(data, null, 2);

    if (response.ok) {
      // Create a blob from the JSON data
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      // Create a link and programmatically click it to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.download = "forms.json";
      link.click();

      // Revoke the URL to free up memory
      URL.revokeObjectURL(url);
    } else {
      console.error(data);
    }
    setIsLoading(false);
  };

  const showPreview = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch("http://127.0.0.1:5000/api/forms/getall", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    const jsonData = JSON.stringify(data, null, 2);

    // Set preview data
    const lines = jsonData.split("\n").slice(0, 25).join("\n");
    setPreviewData(lines);
    setIsPreviewShown(true);
  };

  return (
    <Box>
      <Button variant="contained" onClick={downloadForms} disabled={isLoading}>
        {isLoading ? "Downloading..." : "Download Form Data in JSON"}
      </Button>
      <Button
        variant="contained"
        onClick={showPreview}
        disabled={isLoading}
        style={{ marginLeft: "10px" }}
      >
        {isLoading ? "Fetching Preview..." : "Show Preview"}
      </Button>
      {isPreviewShown && (
        <Typography
          variant="body1"
          style={{ whiteSpace: "pre-wrap", marginTop: "10px" }}
        >
          {previewData}
        </Typography>
      )}
    </Box>
  );
};

export default DownloadForms;
