import "./App.css";
import Admin from "./Admin.js";
import Home from "./Home.js";
import User from "./User.js";
import Navbar from "./Navbar.js";
import Login from "./Login.js";
import Register from "./Register.js";
import FormPanel from "./FormPanel.js";
import EditForm from "./EditForm.js";
import Answers from "./Answer";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

function AdminRoute() {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  return isAdmin ? <Admin /> : <Navigate to="/" />;
}

function FormRoute() {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  return isAdmin ? <FormPanel /> : <Navigate to="/" />;
}

function EditRoute() {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  return isAdmin ? <EditForm /> : <Navigate to="/" />;
}

function AnswerRoute() {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  return isAdmin ? <Answers /> : <Navigate to="/" />;
}

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="/formpanel" element={<FormRoute />} />
        <Route path="/editform" element={<EditRoute />} />
        <Route path="/answers" element={<AnswerRoute />} />
        <Route path="/user" element={<User />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
