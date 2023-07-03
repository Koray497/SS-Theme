import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const Answers = () => {
  const [answers, setAnswers] = useState([]);
  const [filteredAnswers, setFilteredAnswers] = useState([]);
  const [selectedForm, setSelectedForm] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [selectedUsername, setSelectedUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchForms = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/forms", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          let allAnswers = [];
          data.forEach((form) => {
            form.formQuestions.forEach((question) => {
              question.answers?.forEach((answer, idx) => {
                allAnswers.push({
                  id: `${form.id}_${question.id}_${idx}`,
                  formName: form.formName,
                  question: question.prompt,
                  username: answer.username,
                  answer: answer.answer,
                });
              });
            });
          });
          setAnswers(allAnswers);
          setFilteredAnswers(allAnswers);
          console.log("Fetched forms and answers:", data);
        } else {
          console.error(data);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchForms();
  }, []);

  const handleFormChange = (event) => {
    const selectedForm = event.target.value;
    setSelectedForm(selectedForm);

    // Filter questions based on selected form
    const filteredQuestions = answers
      .filter((answer) => answer.formName === selectedForm)
      .map((answer) => answer.question);
    setSelectedQuestion("");
    setSelectedUsername("");
    filterAnswers(selectedForm, "", "");
  };

  const handleQuestionChange = (event) => {
    const selectedQuestion = event.target.value;
    setSelectedQuestion(selectedQuestion);

    // Filter usernames based on selected form and question
    const filteredUsernames = answers
      .filter(
        (answer) =>
          answer.formName === selectedForm &&
          answer.question === selectedQuestion
      )
      .map((answer) => answer.username);
    setSelectedUsername("");
    filterAnswers(selectedForm, selectedQuestion, "");
  };

  const handleUsernameChange = (event) => {
    const selectedUsername = event.target.value;
    setSelectedUsername(selectedUsername);
    filterAnswers(selectedForm, selectedQuestion, selectedUsername);
  };

  const filterAnswers = (form, question, username) => {
    const filtered = answers.filter(
      (answer) =>
        (form === "" || answer.formName === form) &&
        (question === "" || answer.question === question) &&
        (username === "" || answer.username === username)
    );
    setFilteredAnswers(filtered);
  };

  const getUniqueValues = (array, key) => {
    return Array.from(new Set(array.map((item) => item[key])));
  };

  const uniqueForms = getUniqueValues(answers, "formName");
  const uniqueQuestions = getUniqueValues(
    answers.filter((answer) => answer.formName === selectedForm),
    "question"
  );
  const uniqueUsernames = getUniqueValues(
    answers.filter(
      (answer) =>
        answer.formName === selectedForm && answer.question === selectedQuestion
    ),
    "username"
  );

  const columns = [
    { field: "formName", headerName: "Form Name", width: 200 },
    { field: "question", headerName: "Question", width: 300 },
    { field: "username", headerName: "Username", width: 200 },
    { field: "answer", headerName: "Answer", width: 300 },
  ];

  return (
    <div style={{ marginTop: "20px" }}>
      <div>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="form-filter-label">Form:</InputLabel>
          <Select
            labelId="form-filter-label"
            id="form-filter"
            value={selectedForm}
            onChange={handleFormChange}
          >
            <MenuItem value="">All</MenuItem>
            {/* Render options for unique forms */}
            {uniqueForms.map((form) => (
              <MenuItem key={form} value={form}>
                {form}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200, marginLeft: "20px" }}>
          <InputLabel id="question-filter-label">Question:</InputLabel>
          <Select
            labelId="question-filter-label"
            id="question-filter"
            value={selectedQuestion}
            onChange={handleQuestionChange}
            disabled={!selectedForm}
          >
            <MenuItem value="">All</MenuItem>
            {/* Render options for unique questions */}
            {uniqueQuestions.map((question) => (
              <MenuItem key={question} value={question}>
                {question}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200, marginLeft: "20px" }}>
          <InputLabel id="username-filter-label">Username:</InputLabel>
          <Select
            labelId="username-filter-label"
            id="username-filter"
            value={selectedUsername}
            onChange={handleUsernameChange}
            disabled={!selectedForm || !selectedQuestion}
          >
            <MenuItem value="">All</MenuItem>
            {/* Render options for unique usernames */}
            {uniqueUsernames.map((username) => (
              <MenuItem key={username} value={username}>
                {username}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div style={{ height: "400px", width: "100%" }}>
        <DataGrid rows={filteredAnswers} columns={columns} pageSize={5} />
      </div>
    </div>
  );
};

export default Answers;
