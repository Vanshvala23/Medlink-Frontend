import React, { useEffect, useState, createContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "₹";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [doctors, setDoctors] = useState([]);
  const [userData, setUserData] = useState(false);

  const [token, setTokenState] = useState(
    () => localStorage.getItem("token") || null
  );

  const setToken = (newToken) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
      setTokenState(newToken);
    } else {
      localStorage.removeItem("token");
      setTokenState(null);
      setUserData(false);
    }
  };

  /* -------------------- USER PROFILE -------------------- */
  const loadUserProfileData = async () => {
    if (!token) return; // ✅ CRITICAL

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/user/getprofile`,
        {
          headers: { token },
        }
      );

      if (data.success) {
        setUserData(data.userData);
      } else {
        setUserData(false);
      }
    } catch (err) {
      console.error(err);
      setUserData(false);
    }
  };

  /* -------------------- DOCTORS (PROTECTED) -------------------- */
  const getDoctorsdata = async (doctorToken) => {
    if (!doctorToken) return; // ✅ prevent 401 spam

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/doctor/list`,
        {
          headers: { dtoken: doctorToken },
        }
      );

      if (data.success) {
        setDoctors(data.doctors);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* -------------------- THEME -------------------- */
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  /* -------------------- EFFECTS -------------------- */

  // Load user profile ONLY when token exists
  useEffect(() => {
    loadUserProfileData();
  }, [token]);

  const value = {
    doctors,
    getDoctorsdata,
    currencySymbol,
    token,
    setToken,
    backendUrl,
    userData,
    theme,
    toggleTheme,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
