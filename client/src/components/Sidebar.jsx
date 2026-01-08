import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  // We use this to manually check if we are inside the "Creation Flow"
  const location = useLocation();
  const isWidgetSection = location.pathname.startsWith("/create");

  return (
    <div className="sidebar">
      <h1 className="sidebar-title">JoonWeb</h1>

      <div className="sidebar-nav">
        {/* 1. HOME (Now loads your Library/Reels) */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          Home
        </NavLink>

        {/* 2. WIDGET (The Creation Wizard) 
            - Points to the start of the flow: /create/widget
            - Stays ACTIVE if you are on /create/library or /create/manager
        */}
        <NavLink
          to="/create/widget"
          className={() =>
            `nav-item ${isWidgetSection ? "active" : ""}`
          }
        >
          Widget
        </NavLink>

        <NavLink
          to="/video/pages"
          className={({isActive}) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          Pages
        </NavLink>

        {/* 3. DASHBOARD (The Table View) */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          Dashboard
        </NavLink>
      </div>
    </div>
  );
}

export default Sidebar;