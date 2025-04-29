import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrganizationUserDetails } from "../../../../services/organizationService.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import BasicInfoStep from "./components/BasicInfoStep.js";
import EventDetailsStep from "./components/EventDetailsStep.js";
import GuestManagementStep from "./components/GuestManagementStep.js";

const EventEditLayout = () => {
  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    basicInfo: {
      organizations: [],
      eventName: "",
      eventType: "",
      startDate: "",
      endDate: "",
      venueName: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      description: "",
      eventImage: null,
    }
  });

return(

)
}

export default EventEditLayout;