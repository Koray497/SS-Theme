import React, { useState } from "react";
import { Button, FormControl, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import QuestionInput from "./QuestionInput";
import { v4 as uuidv4 } from "uuid";
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

  const prepareQuestions = () => {
    return questions.map((question) => ({
      ...question,
      id: uuidv4(),
      answers: [],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const preparedQuestions = prepareQuestions();

    try {
      const response = await fetch("http://localhost:5000/api/forms/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          formName,
          formQuestions: preparedQuestions,
        }),
      });

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
    <Box sx={{ maxWidth: 600, margin: "0 auto", marginTop: "5rem" }}>
      <Typography variant="h4" sx={{ marginBottom: "1rem" }}>
        Create Theme
      </Typography>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ marginBottom: "1rem" }}>
          <TextField
            id="form-name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
            label="Theme Name"
            fullWidth
            margin="normal"
          />
        </FormControl>

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
          Save Theme
        </Button>
      </form>
    </Box>
  );
};

export default FormPanel;
