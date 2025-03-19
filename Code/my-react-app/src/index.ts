// import { App } from "./App";
import { Toaster } from "react-hot-toast";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline"; // Import Material UI CSS Baseline

export { default as App } from "./App";
export { default as MyProvider } from "./MyProvider";
export { default as MyRouter } from "./MyRouter";
export { default as MyRoute } from "./MyRoute";
export { default as MasjidAdmin } from "./v1/components/MobileViewComponents/BottomNavigation/BottomNavigation";
export { default as EventDetailsNew } from "./v1/components/MobileViewComponents/EventComponent/EventDetails/EventDetails";

export { default as ServiceUserDetails } from "./v1/components/MobileViewComponents/Services/ServiceUserDetails/ServiceUserDetails";
export { default as ContactForm } from "./v1/components/MobileViewComponents/ContactForm/ContactForm";
export { default as WebWidgets } from "./v1/components/MobileViewComponents/WebWidgets/WidgetsPage/WebWidgets";
export { default as MasjidProfile } from "./v1/components/MobileViewComponents/MasjidProfile/MasjidProfile";
export { default as BottomNavigation } from "./v1/components/MobileViewComponents/BottomNavigation/BottomNavigation";
export { default as MobileViewCalender } from "./v1/components/MobileViewComponents/MobileViewCalender/MobileViewCalender";
export { default as SalahTimings } from "./v1/components/MobileViewComponents/MobileViewCalender/SalahTimings/SalahTimings";
export { default as OtherSalahComponent } from "./v1/components/MobileViewComponents/OtherSalahComponents/OtherSalahComponent";
export { default as EventsMain } from "./v1/components/MobileViewComponents/EventComponent/EventMain/EventMain";
export { default as Announcement } from "./v1/components/MobileViewComponents/Announcement/Announcement";
export { default as AdminProfile } from "./v1/components/MobileViewComponents/AdminProfile/AdminProfile";
export { default as ConnectTvMain } from "./v1/components/MobileViewComponents/ConnectTv/ConnectTvMain/ConnectTvMain";
export { default as AddTvForm } from "./v1/components/MobileViewComponents/ConnectTv/AddTv/AddTvForm/AddTvForm";

export { default as Donations } from "./v1/components/MobileViewComponents/Donation/Donations";
export { default as Services } from "./v1/components/MobileViewComponents/Services/Main/Services";
export { default as Payments } from "./v1/components/MobileViewComponents/Payments/Payments";
export { default as ServiceDetails } from "./v1/components/MobileViewComponents/Services/Details/ServiceDetails";
export { default as ProgramDetails } from "./v1/components/MobileViewComponents/Programs/ProgramDetails/ProgramDetails";
export { default as ProgramDetailsNew } from "./v1/components/MobileViewComponents/ProgramsComponent/ProgramDetails/ProgramDetails";
export { default as ProgramsMain } from "./v1/components/MobileViewComponents/ProgramsComponent/ProgramMain/ProgramMain";
export { default as BoardMemberDetails } from "./v1/components/MobileViewComponents/BoardMember/BoardMemberDetails/BoardMemberDetails";
export { default as Programs } from "./v1/components/MobileViewComponents/Programs/Main/Programs";
export { default as BoardMember } from "./v1/components/MobileViewComponents/BoardMember/Main/BoardMember";
export { default as SetPassword } from "./v1/pages/Authpages/ResetPassword/SetPassword/Setpassword";
export { default as ForgotPassword } from "./v1/pages/Authpages/ForgotPassword/ForgotPassword";
// export { default as Login } from "./v1/pages/Authpages/Login/Login";
export { default as ChangePassword } from "./v1/pages/Authpages/ChangePassword/ChangePassword";
export { default as RequestUserForm } from "./v1/components/MobileViewComponents/RequestForm/RequestUserForm";
export { default as DeleteAccount } from "./v1/components/MobileViewComponents/AdminProfile/DeleteAccount";
export { default as Login } from "./v1/pages/Authpages/NewLogin/Login";

export { default as ShareModal } from "./v1/components/MobileViewComponents/Services/Helpers/ShareButtons/ShareButtons";

export { masjidIdSetter } from "./v1/redux/actions/AuthActions/MasjidIdSetterAction";
export { masjidIdRemover } from "./v1/redux/actions/AuthActions/MasjidIdRemoverAction";
export { masjidStateUnmount } from "./v1/redux/actions/AuthActions/MasjidStateUnmount";
export { default as SignUpMain } from "./v1/components/MobileViewComponents/Signup/SignupMain/SignupMain";
export { default as AddMasjidForm } from "./v1/components/MobileViewComponents/Signup/AddMasjidForm/AddMasjidForm";

export {
  Toaster,
  ThemeProvider as CAPThemeProvider,
  createTheme as CAPcreateTheme,
  CssBaseline as CAPCssBaseline,
};
