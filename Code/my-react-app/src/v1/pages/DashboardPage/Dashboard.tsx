import React, { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "../Authpages/ProtectedRoute/ProtectedRoute";

import { fetchAdminDetails } from "../../redux/actions/AuthActions/fetchAdminDetails";
import { useAppThunkDispatch } from "../../redux/hooks";
import { AdminInterFace } from "../../redux/Types";
import Menu from "../../components/MobileViewComponents/MenuPage/Menu";
// import DonationDetails from "../../components/MobileViewComponents/Donation/Details/DonationDetails";
import ServiceView from "../../components/MobileViewComponents/Services/View/ServiceView";
import ServiceDetails from "../../components/MobileViewComponents/Services/Details/ServiceDetails";
import BoardMemberDetails from "../../components/MobileViewComponents/BoardMember/BoardMemberDetails/BoardMemberDetails";
import ProgramView from "../../components/MobileViewComponents/Programs/Main/ProgramForm/ProgramView";
import EventDetails from "../../components/MobileViewComponents/EventComponent/EventDetails/EventDetails";
import ProgramDetails from "../../components/MobileViewComponents/ProgramsComponent/ProgramDetails/ProgramDetails";
import AddTvForm from "../../components/MobileViewComponents/ConnectTv/AddTv/AddTvForm/AddTvForm";

const Dashboard = () => {
  const dispatch = useAppThunkDispatch();
  const adminString = localStorage.getItem("admin");
  const admin: AdminInterFace | null = adminString
    ? JSON.parse(adminString)
    : null;
  useEffect(() => {
    if (admin) {
      const AdminResponse = dispatch(fetchAdminDetails());
      AdminResponse.then((result) => {
        console.log(result.message);
        if (!(result.message === "Success")) {
          localStorage.removeItem("authTokens");
          localStorage.removeItem("admin");
          window.location.reload();
        }
      });
    }
  }, []);

  //Mobile View Check
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024); // Adjust the breakpoint as needed
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Routes>
      <Route
        path="/feed/:tab"
        element={<ProtectedRoute component={<Menu />} />}
      />
      <Route
        path="/event-details/:id"
        element={<ProtectedRoute component={<EventDetails />} />}
      />
      <Route
        path="/service-details/:id"
        element={<ProtectedRoute component={<ServiceDetails />} />}
      />
      <Route
        path="/program-details/:id"
        element={<ProtectedRoute component={<ProgramDetails />} />}
      />
      <Route
        path="/board-member-details/:id"
        element={<ProtectedRoute component={<BoardMemberDetails />} />}
      />
      <Route
        path="add-tv/:id"
        element={<ProtectedRoute component={<AddTvForm />} />}
      />
    </Routes>
  );
};

export default Dashboard;
