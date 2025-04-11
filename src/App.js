import EventLandingPage from "./views/Welcome";
import LoginPage from "./views/Login";
import OrganizationSignUp from "./views/Register";


import OrganizationDashboard from "./organization/views/dashboard";
import OrgEvents from './organization/views/events'
import OrgEventsAdd from './organization/views/eventsAdd'
import OrgEventsView from './organization/views/eventView'

import NotFound from "./views/NotFound";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<EventLandingPage />} />
        <Route path="/sign-in" element={<LoginPage />} />
        <Route path="/sign-up" element={<OrganizationSignUp />} />
        
        {/* Protected Organization Routes */}
        <Route path="/organization" element={<ProtectedRoute />}>


          <Route path="dashboard" element={<OrganizationDashboard />} />
          <Route path="org-events" element={<OrgEvents />} />
          <Route path="org-events-add" element={<OrgEventsAdd />} />
          <Route path="org-events-view/:eventId" element={<OrgEventsView />} />


          {/* Add more protected organization routes here */}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer position="top-center" autoClose={5000} />
    </Router>
  );
}

export default App;
