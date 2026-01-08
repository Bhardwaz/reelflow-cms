import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';

// 1. Layouts
import AppLayout from "./components/layout/AppLayout";

// 2. Feature: Library (Home)
import Reels from "./components/features/library/Reels";
// import Edit from "./components/features/library/EditReel"; // (If you use it)

// 3. Feature: Creation Wizard
import WidgetSelection from "./components/features/widget/WidgetSelection";
import VideoSelection from "./components/features/widget/VideoSelection";
import WidgetsManager from "./components/features/widget/WidgetsManager";
import Dashboard from "./components/features/dashboard/Dashboard"

// 4. Feature: Dashboard
import VideoPagesDashboard from "./components/features/dashboard/VideoPagesDashboard";
import WidgetPreview from "./components/features/widget/WidgetPreview";
import UploadVideoPage from "./components/features/library/UploadVideoPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          
          {/* Home / Library */}
          <Route path="/" element={<Reels />} />

          {/* Creation Flow (Wizard) */}
          <Route path="create">
             <Route path="widget" element={<WidgetSelection />} />
             <Route path="library" element={<VideoSelection />} />
             <Route path="preview" element={< WidgetPreview />} />
          </Route>

          <Route path="video/pages" element={<VideoPagesDashboard />} />

          <Route path="upload/media" element={<UploadVideoPage />} />

          <Route path="widget/manager" element={<WidgetsManager />} />

          {/* Analytics / Table View */}
          <Route path="/dashboard" element={<Dashboard />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}