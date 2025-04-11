import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import EventLayout from './layout/events/eventsLayout'

const OrgEvents = () => {


  return (
    <div className="bg-gray-50">
      <Navbar />
      <EventLayout />
    </div>
  );
};

export default OrgEvents;
