import React, { useState } from "react";
import { Button, FormControl, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import QuestionInput from "./QuestionInput";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";

const FormPanel = () => {
  // State variables for form data
  const [formName, setFormName] = useState("");
  const [questions, setQuestions] = useState([]);

  // Function to handle adding a question
  const addQuestion = (question) => {
    setQuestions([...questions, question]);
  };

  // Function to handle updating a question
  const updateQuestion = (index, question) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = question;
    setQuestions(updatedQuestions);
  };

  // Function to handle deleting a question
  const deleteQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    questions.forEach((question) => {
      question.id = uuidv4();
      question.answers = [];
    });
    try {
      const response = await fetch("http://localhost:5000/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          formName,
          formQuestions: questions,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Admin user created successfully
        toast.success(data.msg);
        console.log(data);
        setTimeout(() => {
          window.location.href = "/FormPanel";
        }, 1000);
      } else {
        // Username already exists or other error
        toast.error(data.msg);
        console.error(data);
      }
    } catch (error) {
      toast.error("There was an error creating the form");
      console.error("Error:", error);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "0 auto", marginTop: "5rem" }}>
      {/* Form creation page */}
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
            fullWidth
            margin="normal"
          />
        </FormControl>

        {/* Question input component */}
        <QuestionInput
          questions={questions}
          handleAddQuestion={addQuestion}
          handleUpdateQuestion={updateQuestion}
          handleDeleteQuestion={deleteQuestion}
        />

        <Button
          disabled={questions.length < 1}
          variant="contained"
          type="submit"
          sx={{ marginTop: "1rem" }}
        >
          Save Form
        </Button>
      </form>
    </Box>
  );
};

export default FormPanel;
