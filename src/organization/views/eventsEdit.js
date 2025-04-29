import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import EventAddLayout from './layout/events/eventsAddLayout'

const OrgEventsAdd = () => {


  return (
    <div className="bg-gray-50">
      <Navbar />
      <EventAddLayout />
    </div>
  );
};

export default OrgEventsAdd;
