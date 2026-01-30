import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import "./Sidebar.css";
import JoonWebLogo from "./sharable/JoonWebLogo";

function Sidebar() {
  const navigate = useNavigate();
  const [route, setRoute] = useState('home')

  const handleBack = () => {
    navigate('/video/pages');
  };

  const buttonResetStyle = {
    background: 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    color: 'inherit',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  return (
    <div className="sidebar">
      <JoonWebLogo />

      <div className="sidebar-nav">
        
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setRoute('Home')}
        >
          Home
        </NavLink>

        <NavLink
          to="/video/pages"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setRoute('Widgets')}
        >
          Widgets
        </NavLink>

        <NavLink
          to="/library"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          onClick={() => setRoute('library')}
        >
          Library
        </NavLink>

      </div>
    </div>
  );
}

export default Sidebar;