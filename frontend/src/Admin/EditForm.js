import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import QuestionInput from "../QuestionInput";
import { v4 as uuidv4 } from "uuid";

const EditForm = () => {
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState("");
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchForms();
  }, []);

  const prepareQuestions = () => {
    return questions.map((question) => ({
      ...question,
      id: uuidv4(),
    }));
  };

  const fetchForms = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch("http://127.0.0.1:5000/api/forms/getall", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      toast.error("Failed to fetch forms");
    } else {
      setForms(data);
    }
  };

  const deleteForm = async (formId) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `http://127.0.0.1:5000/api/forms/delete/${formId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      toast.success(data.msg);
      fetchForms();
    } else {
      toast.error(data.msg);
    }
  };

  const updateForm = async () => {
    const token = localStorage.getItem("token");
    const preparedQuestions = prepareQuestions();

    const updatedForm = {
      ...selectedForm,
      formQuestions: preparedQuestions,
    };

    delete updatedForm._id;

    const response = await fetch(
      `http://127.0.0.1:5000/api/forms/${selectedForm.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedForm),
      }
    );

    const data = await response.json();

    if (response.ok) {
      toast.success(data.msg);
      fetchForms();
    } else {
      toast.error(data.msg);
      console.error(data);
    }
  };

  const handleFormChange = (event) => {
    const selectedFormId = event.target.value;
    const selectedForm = forms.find((form) => form.id === selectedFormId);
    setSelectedForm(selectedForm);
    setQuestions(selectedForm?.formQuestions || []);
  };

  const addQuestion = (question) => {
    setQuestions((prevQuestions) => [...prevQuestions, question]);
  };

  const updateQuestion = (index, updatedQuestion) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question, i) =>
        i === index ? updatedQuestion : question
      )
    );
  };

  const deleteQuestion = (index) => {
    setQuestions((prevQuestions) =>
      prevQuestions.filter((_, i) => i !== index)
    );
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
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          backgroundColor: "#aab382",
          width: "100%",
          maxWidth: "1025px",
          margin: "0 auto",
          height: "70vh",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Edit Forms
        </Typography>
        <Box
          component="ul"
          sx={{
            paddingLeft: 0,
            marginTop: 0,
            marginBottom: "1rem",
            listStyleType: "none",
          }}
        >
          <Box
            component="li"
            sx={{
              display: "flex",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <Select
              value={selectedForm?.id || ""}
              onChange={handleFormChange}
              displayEmpty
              inputProps={{ "aria-label": "Select a form" }}
              sx={{ marginRight: 2 }}
            >
              <MenuItem value="" disabled>
                Select a Form
              </MenuItem>
              {forms.map((form) => (
                <MenuItem key={form.id} value={form.id}>
                  {form.formName}
                </MenuItem>
              ))}
            </Select>
            <Button
              variant="outlined"
              onClick={() => deleteForm(selectedForm.id)}
              size="small"
              disabled={!selectedForm}
            >
              Delete
            </Button>
          </Box>
        </Box>
        <Box sx={{ marginTop: 2 }}>
          <QuestionInput
            questions={questions}
            handleAddQuestion={addQuestion}
            handleUpdateQuestion={updateQuestion}
            handleDeleteQuestion={deleteQuestion}
          />
          <Button
            disabled={questions.length < 1}
            className="add-form"
            variant="contained"
            type="submit"
            sx={{ marginTop: "1rem" }}
            onClick={updateForm}
          >
            Update Form
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditForm;
