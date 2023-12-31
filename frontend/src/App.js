import "./css/App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Admin from "./Admin/Admin.js";
import Home from "./Home.js";
import User from "./User/User.js";
import Navbar from "./Navbar.js";
import Login from "./User/Login.js";
import FormPanel from "./Admin/FormPanel.js";
import EditForm from "./Admin/EditForm.js";

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


function App() {
  return (
    <div className="app-container">
      <Router>
        <ToastContainer />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="/formpanel" element={<FormRoute />} />
          <Route path="/editform" element={<EditRoute />} />
          <Route path="/user" element={<User />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
