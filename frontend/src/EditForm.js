import React, { useEffect, useState } from "react";
import { Button, MenuItem, Typography, Select } from "@mui/material";
import { styled } from "@mui/system";
import { toast } from "react-toastify";
import QuestionInput from "./QuestionInput";
import { v4 as uuidv4 } from "uuid";

const CenteredContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
});

const FormList = styled("ul")({
  paddingLeft: 0,
  marginTop: 0,
  marginBottom: "1rem",
  listStyleType: "none",
});

const FormListItem = styled("li")({
  display: "flex",
  alignItems: "center",
  marginBottom: "0.5rem",
});

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
    const response = await fetch("http://localhost:5000/api/forms", {
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
      `http://localhost:5000/api/forms/${formId}`,
      {
        method: "DELETE",
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
      `http://localhost:5000/api/forms/${selectedForm.id}`,
      {
        method: "PUT",
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
    <CenteredContainer>
      <Typography variant="h5" gutterBottom>
        Edit Themes
      </Typography>
      <FormList>
        <FormListItem>
          <Select
            value={selectedForm?.id || ""}
            onChange={handleFormChange}
            displayEmpty
            inputProps={{ "aria-label": "Select a form" }}
          >
            <MenuItem value="" disabled>
              Select a Theme
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
        </FormListItem>
      </FormList>
      <QuestionInput
        questions={questions}
        handleAddQuestion={addQuestion}
        handleUpdateQuestion={updateQuestion}
        handleDeleteQuestion={deleteQuestion}
      />
      <Button
        variant="contained"
        sx={{ marginTop: "1rem" }}
        fullWidth
        onClick={updateForm}
      >
        Save Theme
      </Button>
    </CenteredContainer>
  );
};

export default EditForm;
