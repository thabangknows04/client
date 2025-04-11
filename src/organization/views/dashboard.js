import { useState, useEffect } from "react";

import HomeLayout from "./layout/homeLayout";
import Navbar from "../components/navbar";

const Dashboard = () => {
  return (
    <div className="bg-gray-50">
      <Navbar />

      <HomeLayout />
    </div>
  );
};

export default Dashboard;
