import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import ChatsPage from "./pages/ChatsPage";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import ListingDetail from "./pages/ListingDetail";
import Marketplace from "./pages/Marketplace";
import CampusRadar from "./pages/CampusRadar";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Reels from "./pages/Reels";
import RequestsBoard from "./pages/RequestsBoard";
import Saved from "./pages/Saved";
import SellPage from "./pages/SellPage";
import TrustPage from "./pages/TrustPage";
import AboutPage from "./pages/AboutPage";
import { useStore } from "./store/useStore";

const App = () => {
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.removeAttribute("data-theme");
    }
  }, [theme]);

  return (
    <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<Landing />} />
      <Route path="marketplace" element={<Marketplace />} />
      <Route path="campus-radar" element={<CampusRadar />} />
      <Route path="auth" element={<AuthPage />} />
      <Route path="trust" element={<TrustPage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="requests" element={<RequestsBoard />} />
      <Route path="product/:id" element={<ListingDetail />} />
      <Route path="listings/:id" element={<ListingDetail />} />
      <Route path="chat" element={<ProtectedRoute><ChatsPage /></ProtectedRoute>} />
      <Route path="chats" element={<ProtectedRoute><ChatsPage /></ProtectedRoute>} />
      <Route path="chats/:id" element={<ProtectedRoute><ChatsPage /></ProtectedRoute>} />
      <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="reels" element={<Reels />} />
      <Route path="saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
      <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="users/:id" element={<Profile />} />
      <Route path="add" element={<ProtectedRoute><SellPage /></ProtectedRoute>} />
      <Route path="sell" element={<ProtectedRoute><SellPage /></ProtectedRoute>} />
      <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="admin" element={<ProtectedRoute admin><AdminPage /></ProtectedRoute>} />
      <Route path="*" element={<Landing />} />
    </Route>
  </Routes>
  );
};

export default App;
