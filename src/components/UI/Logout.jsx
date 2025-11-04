import React, { useState } from 'react'
import API from "../../axios";
import { useNavigate } from "react-router-dom";
import styles from './Logout.module.scss'
import { useAuth } from '../../context/AuthContext';

function Logout() {
    const navigate = useNavigate();
    const {logout} = useAuth();
    const [loading, setLoading] = useState(false);
 
    const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    try {
      setLoading(true);
      await logout(); // remove user from context
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Something went wrong while logging out.");
    } finally {
      setLoading(false);
    }
  };

 return <button onClick={handleLogout} disabled={loading}
     className={styles.addButton}
    >
      {loading ? "Logging out..." : "Logout"}</button>;
}

export default Logout
