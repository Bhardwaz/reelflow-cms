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
import Dashboard from "./components/features/dashboard/Dashboard"

// 4. Feature: Dashboard
import WidgetPreview from "./components/features/widget/WidgetPreview";
import UploadVideoPage from "./components/features/library/UploadVideoPage";
import WidgetsDashboard from "./components/features/widgets-manager/WidgetsDashboard";
import WidgetManager from "./components/features/widgets-manager/WidgetManager";
import AttachVideosToWidget from "./components/features/widgets-manager/AttachVideosToWidget";
import NotFound from "./components/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          
          {/* Home / Library */}
          <Route path="/" element={<Dashboard />} />

          {/* Creation Flow (Wizard) */}
          <Route path="create">
             <Route path="widget" element={<WidgetSelection />} />
             <Route path="library" element={<VideoSelection />} />
             <Route path="preview" element={< WidgetPreview />} />
          </Route>

          <Route path="video/pages" element={<WidgetsDashboard />} />

          <Route path="upload/media" element={<UploadVideoPage />} />

          <Route path="widget/manager" element={<WidgetManager />} />

          <Route path="/attach/media" element={<AttachVideosToWidget/>} />

          {/* Analytics / Table View */}
          <Route path="/library" element={<Reels />} />

          <Route path="*" element={<NotFound />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}