import React, { useState } from "react";
import { toast } from "react-toastify";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const handleRegister = async () => {
    if (username === "" || password === "")
      toast.error("Username or Password cannot be empty!", {
        autoClose: 1000,
      });
    else {
      try {
        const response = await fetch("http://localhost:5000/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
          // User created successfully
          try {
            const response = await fetch("http://localhost:5000/api/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ username, password }),
            });

            const loginData = await response.json();

            if (response.ok) {
              // Successful login
              const logusername = loginData.username;
              const isAdmin = loginData.isAdmin;
              const token = loginData.access_token;
              localStorage.setItem("token", token);
              localStorage.setItem("isAdmin", isAdmin);
              localStorage.setItem("username", logusername);

              window.location.href = "/user";
            } else {
              // Login failed
              if (response.status === 401) {
                // Incorrect username or password
                toast.error("Wrong username or password", {
                  autoClose: 1000,
                });
              } else {
                // Other error
                console.error("Login failed:", data.msg);
              }
            }
          } catch (error) {
            // Error occurred
            console.error("Error:", error);
          }
        } else {
          // Username already exists or other error
          toast.error("Username already exists", {
            autoClose: 1000,
          });
          console.error(data.msg);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };
  return (
    <div className="container">
      <h1>Register</h1>
      <div className="form-container">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleRegister}>Register</button>
      </div>
    </div>
  );
};

export default Register;
