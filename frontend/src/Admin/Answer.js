import "../css/Answer.css";
import React, { useEffect, useState } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

const Answers = () => {
  const [answers, setAnswers] = useState([]);
  const [filteredAnswers, setFilteredAnswers] = useState([]);
  const [selectedForm, setSelectedForm] = useState("");
  const [selectedUsername, setSelectedUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchForms = async () => {
      try {
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

        if (response.ok) {
          let allAnswers = [];
          data.forEach((form) => {
            form.formQuestions.forEach((question) => {
              question.answers?.forEach((answer, idx) => {
                let modifiedAnswer = answer.answer;
                if (question.type === "checkbox")
                  modifiedAnswer = answer.answer === 1 ? "True" : "False";

                allAnswers.push({
                  id: `${form.id}_${question.id}_${idx}`,
                  formName: form.formName,
                  question: question.prompt,
                  username: answer.username,
                  answer: modifiedAnswer,
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
    setSelectedUsername("");
    filterAnswers(selectedForm, "");
  };

  const handleUsernameChange = (event) => {
    const selectedUsername = event.target.value;
    setSelectedUsername(selectedUsername);
    filterAnswers(selectedForm, selectedUsername);
  };

  const filterAnswers = (form, username) => {
    const filtered = answers.filter(
      (answer) =>
        (form === "" || answer.formName === form) &&
        (username === "" || answer.username === username)
    );
    setFilteredAnswers(filtered);
  };

  const getUniqueValues = (array, key) => {
    return Array.from(new Set(array.map((item) => item[key])));
  };

  const uniqueForms = getUniqueValues(answers, "formName");
  const uniqueUsernames = getUniqueValues(
    answers.filter((answer) => answer.formName === selectedForm),
    "username"
  );

  const renderFilteredAnswers = () => {
    if (selectedForm === "") {
      return (
        <Typography variant="h3" component="div">
          Please select a form
        </Typography>
      );
    } else if (selectedUsername === "") {
      return (
        <Typography variant="h3" component="div">
          Please select a user
        </Typography>
      );
    } else {
      return filteredAnswers.map((answer, idx) => (
        <Card
          key={idx}
          className="answer-card"
          sx={{
            marginBottom: "20px",
            padding: "15px",
            backgroundColor: "#87CEEB", // Light gray background
            boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.15)", // More noticeable shadow
            borderRadius: "5px", // Rounded corners
          }}
        >
          <CardContent>
            <Typography variant="h6" component="div">
              {answer.question}
            </Typography>
            <Typography variant="body2">{answer.answer}</Typography>
          </CardContent>
        </Card>
      ));
    }
  };

  return (
    <div className="answers">
      <div className="answers__filters">
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="form-filter-label">Form</InputLabel>
          <Select
            labelId="form-filter-label"
            id="form-filter"
            value={selectedForm}
            onChange={handleFormChange}
          >
            <MenuItem value="">Select a form</MenuItem>
            {uniqueForms.map((form) => (
              <MenuItem key={form} value={form}>
                {form}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200, marginLeft: "20px" }}>
          <InputLabel id="username-filter-label">Username</InputLabel>
          <Select
            labelId="username-filter-label"
            id="username-filter"
            value={selectedUsername}
            onChange={handleUsernameChange}
            disabled={!selectedForm}
          >
            <MenuItem value="">Select a user</MenuItem>
            {uniqueUsernames.map((username) => (
              <MenuItem key={username} value={username}>
                {username}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div className="answers__content">{renderFilteredAnswers()}</div>
    </div>
  );
};

export default Answers;
