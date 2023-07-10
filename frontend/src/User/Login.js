import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const successfulLogin = (username, ou, token) => {
    const isAdmin = ou === "Admin" ? true : false;
    localStorage.setItem("token", token);
    localStorage.setItem("isAdmin", isAdmin);
    localStorage.setItem("username", username);
    window.location.href = isAdmin ? "/admin" : "/user";
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log(data.user_data);
      if (response.ok) {
        successfulLogin(
          data.user_data.username,
          data.user_data.ou,
          data.access_token
        );
      } else {
        if (response.status === 401) {
          toast.error("Wrong username or password", {
            autoClose: 1000,
          });
        } else {
          console.error("Login failed:", data.msg);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="container">
      <h1>Login</h1>
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
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
};

export default Login;
