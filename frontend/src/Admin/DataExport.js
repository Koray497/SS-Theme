import React, { useState } from 'react';
import Button from '@mui/material/Button';

const DataExport = () => {
  const [isLoading, setIsLoading] = useState(false);

  const downloadForms = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/forms/getall', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      // Create a blob from the JSON data
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a link and programmatically click it to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'forms.json';
      link.click();

      // Revoke the URL to free up memory
      URL.revokeObjectURL(url);
    } else {
      console.error(data);
    }
    setIsLoading(false);
  };

  return (
    <Button 
      variant="contained" 
      onClick={downloadForms} 
      disabled={isLoading}
    >
      {isLoading ? 'Downloading...' : 'Download Form Data in JSON'}
    </Button>
  );
};

export default DataExport;
