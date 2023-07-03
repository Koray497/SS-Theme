import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const Admin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState([]);
  const [delusername, setdelUsername] = useState("");
  const adminUsername = localStorage.getItem("username");

  useEffect(() => {
    if (!localStorage.isToastShown) {
      toast.success("Login successful, welcome " + adminUsername + "!", {
        autoClose: 1000,
      });
      localStorage.setItem("isToastShown", true);
    }
  }, [adminUsername]);

  const getUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Users retrieved successfully
        console.log(data);
        setUsers(data);
      } else {
        // Error retrieving users
        console.error(data.msg);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteUser = async (username) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${username}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        // User deleted successfully
        console.log(data.msg);
      } else {
        // User not found or other error
        console.error(data.msg);
      }
    } catch (error) {
      // Error occurred
      console.error("Error:", error);
    }
  };
  const handleAdminRegister = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, isAdmin: true }),
      });

      const data = await response.json();

      if (response.ok) {
        // Admin user created successfully
        console.log(data.msg);
      } else {
        // Username already exists or other error
        console.error(data.msg);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="container">
      <div className="container">
        <h1>Admin Panel</h1>
        <div className="user-list-container">
          <h1>User List</h1>
          <button onClick={getUsers}>Get Users</button>
          <ul>
            {users.map((user) => (
              <li key={user._id}>
                <span>{user.isAdmin ? "Admin" : "User"}</span>
                <br></br>
                <span>{user.username}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="delete-user-container">
          <input
            type="text"
            placeholder="Username"
            value={delusername}
            onChange={(e) => setdelUsername(e.target.value)}
          />
          <button onClick={() => handleDeleteUser(delusername)}>
            Delete User
          </button>
        </div>
        <div className="make-admin-container">
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
          <button onClick={() => handleAdminRegister()}>
            Make this User a Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
