import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./css/App.css";
import "./css/Navbar.css";

const AdminLink = ({ to, className, children }) => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  return isAdmin ? (
    <Link to={to} className={className}>
      {children}
    </Link>
  ) : null;
};

const Navbar = () => {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const username = localStorage.getItem("username");

  const logout = () => {
    ["token", "isAdmin", "username", "isToastShown"].forEach((item) =>
      localStorage.removeItem(item)
    );
    navigate("/");
  };

  return (
    <nav className="navbar">
      <img src="logo.png" alt="Logo" className="logo" />
      <h1 className="app-name">SS-Theme</h1>
      <div className="nav-links">
        <Link to="/" className="home-link">
          Home
        </Link>
        {username && (
          <Link to={isAdmin ? "/admin" : "/user"} className="panel-link">
            Panel
          </Link>
        )}
        <AdminLink to={"/formpanel"} className="panel-link">
          Form Panel
        </AdminLink>
        <AdminLink to={"/editform"} className="panel-link">
          Edit Forms
        </AdminLink>
      </div>
      <div className="right-content">
        {!username && (
          <>
            {" "}
            <Link to="/login" className="home-link">
              Login
            </Link>
          </>
        )}
        {username && (
          <>
            <div className="user-info">
              {(isAdmin ? "Admin: " : "User: ") + username}
            </div>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
