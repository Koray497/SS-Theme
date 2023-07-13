import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  TextField,
  Paper,
  Typography,
} from "@mui/material";
import QuestionInput from "../QuestionInput";
import { toast } from "react-toastify";

const FormPanel = () => {
  const [formName, setFormName] = useState("");
  const [questions, setQuestions] = useState([]);

  const addQuestion = (question) => {
    setQuestions([...questions, question]);
  };

  const updateQuestion = (index, question) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = question;
    setQuestions(updatedQuestions);
  };

  const deleteQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URI}/api/forms/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            formName,
            formQuestions: questions,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(data.msg);
        console.log(data);
        setTimeout(() => {
          window.location.href = "/FormPanel";
        }, 1000);
      } else {
        toast.error(data.msg);
        console.error(data);
      }
    } catch (error) {
      toast.error("There was an error creating the form");
      console.error("Error:", error);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        maxWidth: "1025px",
        margin: "0 auto",
        height: "70vh",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 3,
          backgroundColor: "#aab382",
          width: "100%",
          maxWidth: "1025px",
          margin: "0 auto",
          height: "70vh",
          overflowY: "auto",
        }}
      >
        <Typography variant="h4" sx={{ marginBottom: "1rem" }}>
          Create Form
        </Typography>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ marginBottom: "1rem" }}>
            <TextField
              id="form-name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              label="Form Name"
              inputProps={{ style: { border: "none" } }}
              InputProps={{
                sx: {
                  fontSize: "1.2rem",
                  paddingTop: "0.6rem",
                  paddingBottom: "0.6rem",
                },
              }}
            />
          </FormControl>

          <QuestionInput
            questions={questions}
            handleAddQuestion={addQuestion}
            handleUpdateQuestion={updateQuestion}
            handleDeleteQuestion={deleteQuestion}
          />

          <Button
            className="add-form"
            disabled={questions.length < 1}
            variant="contained"
            type="submit"
            sx={{ marginTop: "1rem" }}
          >
            Save Form
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default FormPanel;
