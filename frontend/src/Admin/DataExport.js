import React, { useState } from "react";
import Button from "@mui/material/Button";
import { Box, TextField } from "@mui/material";

const DownloadForms = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState("");
  const [isPreviewShown, setIsPreviewShown] = useState(false);

  const downloadForms = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${process.env.REACT_APP_API_URI}/api/forms/getall`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

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
    const response = await fetch(
      `${process.env.REACT_APP_API_URI}/api/forms/getall`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    const jsonData = JSON.stringify(data, null, 2);

    // Set preview data
    setPreviewData(jsonData);
    setIsPreviewShown(true);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          onClick={downloadForms}
          disabled={isLoading}
        >
          {isLoading ? "Downloading..." : "Download Form Data in JSON"}
        </Button>
        <Button variant="contained" onClick={showPreview} disabled={isLoading}>
          {isLoading ? "Fetching Preview..." : "Show Preview"}
        </Button>
      </Box>
      {isPreviewShown && (
        <TextField
          multiline
          rows={15} // adjust number of rows as needed
          variant="outlined"
          fullWidth
          value={previewData}
          InputProps={{ readOnly: true }}
          sx={{ mt: 2 }}
        />
      )}
    </Box>
  );
};

export default DownloadForms;
