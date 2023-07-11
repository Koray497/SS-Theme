import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./css/Navbar.css";

const AdminLink = ({ to, children }) => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  return isAdmin ? (
    <Link to={to} className="nav-link">
      {children}
    </Link>
  ) : null;
};

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const username = localStorage.getItem("username");

  const logout = () => {
    ["token", "isAdmin", "username", "isToastShown"].forEach((item) =>
      localStorage.removeItem(item)
    );
    navigate("/");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src="logo.png" alt="Logo" className="logo" />
        <h1 className="app-name">SS-Theme</h1>
      </div>
      <div className="nav-links">
        <Link to="/" className="nav-link">
          Home
        </Link>
        {username && (
          <Link to={isAdmin ? "/admin" : "/user"} className="nav-link">
            Panel
          </Link>
        )}
        <AdminLink to={"/formpanel"}>Form Panel</AdminLink>
        <AdminLink to={"/editform"}>Edit Forms</AdminLink>
      </div>
      {username && (
        <div className="nav-right" onClick={toggleDropdown}>
          <span className="user-info">
            {(isAdmin ? "Admin: " : "User: ") + username}
          </span>
          {dropdownOpen && (
            <div className="dropdown">
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </div>
          )}
        </div>
      )}
      {!username && (
        <div className="nav-right">
          <Link to="/login" className="nav-link login-link">
            Login
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
