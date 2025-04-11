import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import EventViewLayout from './layout/events/eventViewLayout'

const OrgEventsView = () => {


  return (
    <div className="bg-gray-50">
      <Navbar />
      <EventViewLayout />
    </div>
  );
};

export default OrgEventsView;
