"use client";
import { createContext, useState, useEffect, useContext } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      fetchProfile(savedToken);
    }
  }, []);

  const fetchProfile = async (token) => {
    try {
      const res = await fetch("http://localhost:3000/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
        localStorage.removeItem("token");
      }
    } catch (err) {
      console.error(err);
    }
  };
  const login = async (email, password, onLoginError, onLoginSuccess) => {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    let errorMessage = null;

    if (res.ok) {
      setToken(data.token);
      localStorage.setItem("token", data.token);
      await fetchProfile(data.token);
      if (onLoginSuccess) {
        onLoginSuccess("Login successful");
      }
    } else {
      errorMessage = data.message || "Login failed";
    }
    if (errorMessage && onLoginError) {
      onLoginError(errorMessage);
    }
  };

  const register = async (username, email, password, registererror,onRegisterSuccess) => {
    const res = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    let errorMessage = null;
    if (res.ok) {
      setToken(data.token);
      localStorage.setItem("token", data.token);
      await fetchProfile(data.token);
      if (onRegisterSuccess) {
        onRegisterSuccess("Registration successful");
      }
    } else {
      errorMessage = data.message || "Registration failed";
    }
    if (errorMessage && registererror) {
      registererror(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <UserContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
