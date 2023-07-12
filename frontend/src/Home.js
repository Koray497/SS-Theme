import React from "react";
import "./css/Home.css";

const Home = () => {
  return (
    <div className="container">
      <h1 className="welcome-text">Welcome to SS-Theme</h1>
      <div className="content">
        <div className="section section-dark">
          <h2>About SS-Theme</h2>
          <p>
            Simplify form management and enhance user experiences with our
            intuitive platform, empowering admins to create and update forms
            effortlessly while offering users a seamless, stylish, and
            time-saving form-filling experience.
          </p>
        </div>
        <div className="section section-light">
          <h2>About Us</h2>
          <p>
            SS-Theme was designed by two talented computer engineers, Serhat and
            Koray. Together, they combined their expertise to create an
            innovative platform that simplifies form management and enhances
            user experiences.
          </p>
          <p>
            <a
              href="https://github.com/Se-Gu"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/Se-Gu
            </a>
          </p>
          <p>
            <a
              href="https://github.com/Koray497"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/Koray497
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
