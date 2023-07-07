import React, { useEffect, useState } from "react";
import { Button, Checkbox, FormControl, FormControlLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { toast } from "react-toastify";

const User = () => {
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState("");
  const [answers, setAnswers] = useState([]);
  const [updating, setUpdating] = useState(false);
  const username = localStorage.getItem("username");

  useEffect(() => {
    const fetchForms = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch("http://localhost:5000/api/forms/getall", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          return [];
        } else {
          return data;
        }
      } catch (error) {
        return [];
      }
    };

    fetchForms().then((forms) => {
      setForms(forms);
    });

  }, []);

  const handleFormChange = (event) => {
    setUpdating(false);
    const selectedFormName = event.target.value;
    const selectedForm = forms.find((form) => form.formName === selectedFormName);
    setSelectedForm(selectedForm);
    
    const questionArr = selectedForm.formQuestions;
    setAnswers(
      questionArr.map((question) => ({
        question: question.prompt,
        answer: handleExistingAnswer(question) || getInitialAnswer(question),
        questionId: question.id,
      }))
    );    
  };

  const getInitialAnswer = (question) => {
    switch (question.type) {
      case 'dropdown':
      case 'checkbox':
        return question.options?.[0];
      default:
        return '';
    }
  };
  
  const handleExistingAnswer = (question) => {
    if (!question?.answers) {
      switch (question.type) {
        case "dropdown":
          return question.options[0];
        case "checkbox":
          return [...question.options];
        case "text":
        case "longtext":
        case "numeric":
        default:
          return "";
      }
    } else {
      for (const theAnswer of question.answers) {
        if (theAnswer.username === username) {
          setUpdating(true);
          return theAnswer.answer;
        }
      }
    }
  };
  
  const handleAnswerChange = (event, index) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index].answer = event.target.value;
    setAnswers(updatedAnswers);
  };

  const handleCheckboxChange = (event, index, option) => {
    const updatedAnswers = [...answers];
    
    if (event.target.checked) {
      updatedAnswers[index].answer?.push(option);
    } else {
      const optionIndex = updatedAnswers[index].answer?.indexOf(option);
      if (optionIndex !== -1) {
        updatedAnswers[index].answer?.splice(optionIndex, 1);
      }
    }
    setAnswers(updatedAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:5000/api/forms/${selectedForm.id}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(answers),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.msg);
        setTimeout(() => {
          window.location.href = "/User";
        }, 1000);
      } else {
        toast.error(data.msg);
      }
    } catch (error) {
      toast.error("There was an error filling the form");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "0 auto", marginTop: "5rem" }}>
      <Typography variant="h4" sx={{ marginBottom: "1rem" }}>User Page</Typography>

      <form onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ marginBottom: "1rem" }}>
          <Select value={selectedForm.formName || ""} onChange={handleFormChange} displayEmpty inputProps={{ "aria-label": "Select a form" }}>
            <MenuItem value="" disabled>Select a Form</MenuItem>
            {forms?.map((form) => (
              <MenuItem key={form.formName} value={form.formName}>{form.formName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedForm && (
          <div>
            {selectedForm?.formQuestions.map((question, index) => (
              <FormControl key={index} fullWidth sx={{ marginBottom: "1rem" }}>
                <Typography variant="subtitle1">{question.prompt}</Typography>

                {question?.type === "text" && (
                  <TextField value={answers[index]?.answer} onChange={(e) => handleAnswerChange(e, index)} required label="Answer" fullWidth margin="normal" />
                )}
                
                {question?.type === "longtext" && (
                  <TextField multiline rows={4} value={answers[index]?.answer} onChange={(e) => handleAnswerChange(e, index)} required label="Answer" fullWidth margin="normal" />
                )}
                
                {question?.type === "numeric" && (
                  <TextField type="number" value={answers[index]?.answer} onChange={(e) => handleAnswerChange(e, index)} required label="Answer" fullWidth margin="normal" />
                )}
                
                {question?.type === "dropdown" && (
                  <FormControl fullWidth>
                    <Select value={answers[index]?.answer} onChange={(e) => handleAnswerChange(e, index)} displayEmpty inputProps={{ "aria-label": "Select an option" }}>
                      <MenuItem value="" disabled>Select an option</MenuItem>
                      {question.options?.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                
                {question?.type === "checkbox" && (
                  <FormControl fullWidth>
                    {question.options?.map((option) => (
                      <FormControlLabel key={option} control={<Checkbox checked={answers[index]?.answer?.includes(option)} onChange={(e) => handleCheckboxChange(e, index, option)} />} label={option} />
                    ))}
                  </FormControl>
                )}
              </FormControl>
            ))}

            <Button variant="contained" type="submit" sx={{ marginTop: "1rem" }}>{updating ? "Update" : "Submit"}</Button>
          </div>
        )}
      </form>
    </Box>
  );
};

export default User;
