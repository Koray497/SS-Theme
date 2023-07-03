import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css"; // Importing CSS

function Navbar() {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const username = localStorage.getItem("username");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("username");
    localStorage.removeItem("isToastShown");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <img src="logo.png" alt="Logo" className="logo" />
      <h1 className="app-name">SS-Forms</h1>
      <div className="nav-links">
        <Link to="/" className="home-link">
          Home
        </Link>
        {username && (
          <Link to={isAdmin ? "/admin" : "/user"} className="panel-link">
            Panel
          </Link>
        )}
        {username && isAdmin && (
          <Link to={"/formpanel"} className="panel-link">
            Form Panel
          </Link>
        )}
        {username && isAdmin && (
          <Link to={"/editform"} className="panel-link">
            Edit Forms
          </Link>
        )}
        {username && isAdmin && (
          <Link to={"/answers"} className="panel-link">
            Answers
          </Link>
        )}
      </div>
      <div className="right-content">
        {!username && (
          <>
            {" "}
            <Link to="/login" className="home-link">
              Login
            </Link>
            <Link to="/register" className="home-link">
              Register
            </Link>
          </>
        )}
        {username && (
          <>
            <div className="user-info">
              {!isAdmin && `User: ${username}`}
              {isAdmin && `Admin: ${username}`}
            </div>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
