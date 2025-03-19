import React, { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";

import CustomSnackbar from "./v1/components/HelperComponents/SnackbarCompoenent/CustomSnackbar";
import { AdminInterFace, AuthTokens } from "./v1/redux/Types/index.js";
import "./App.css";
// import Login from "./v1/pages/Authpages/Login/Login";
import ForgotPassword from "./v1/pages/Authpages/ForgotPassword/ForgotPassword";
// import SetPassword from "./v1/pages/Authpages/ResetPassword/SetPassword";
import SetPassword from "./v1/pages/Authpages/ResetPassword/SetPassword/Setpassword";

import DeleteAccount from "./v1/components/MobileViewComponents/AdminProfile/DeleteAccount";
import ChangePassword from "./v1/pages/Authpages/ChangePassword/ChangePassword";
import RequestUserForm from "./v1/components/MobileViewComponents/RequestForm/RequestUserForm";
import { ThemeProvider } from "@emotion/react";
import Theme from "./v1/components/Theme/Theme";
import Common_App from "./v1/components/CommonApp/Common_App";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  Observable,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

import { onError } from "@apollo/client/link/error";
import { getGraphQlAPIRootDomain } from "./v1/helpers/ApiSetter/GraphQlApiSetter";
import toast from "react-hot-toast";
import AddMasjidForm from "./v1/components/MobileViewComponents/Signup/AddMasjidForm/AddMasjidForm";
import SignUpMain from "./v1/components/MobileViewComponents/Signup/SignupMain/SignupMain";
import Login from "./v1/pages/Authpages/NewLogin/Login";
import { refreshToken } from "./v1/api-calls";

const Dashboard = lazy(() => import("./v1/pages/DashboardPage/Dashboard"));

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

// Function to handle token refresh
const handleRefreshToken = () => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = refreshToken()
      .then(() => {
        isRefreshing = false;
      })
      .catch((error) => {
        isRefreshing = false;
        throw error;
      });
  }
  return refreshPromise;
};

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${
            locations || ""
          }, Path: ${path}`
        )
      );
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`);

      // Check if the error is 401 Unauthorized
      if ("statusCode" in networkError && networkError.statusCode === 401) {
        console.log("401 Unauthorized detected");

        if (!refreshPromise) {
          refreshPromise = handleRefreshToken();
        }

        return new Observable((observer) => {
          refreshPromise
            ?.then(() => {
              const authTokensString = localStorage.getItem("authTokens");
              const token: AuthTokens | null = authTokensString
                ? JSON.parse(authTokensString)
                : null;

              if (token) {
                // Retry the failed operation with the new token
                const oldHeaders = operation.getContext().headers;
                const newHeaders = {
                  ...oldHeaders,
                  authorization: `Bearer ${token.accessToken}`,
                };
                operation.setContext({ headers: newHeaders });

                forward(operation).subscribe({
                  next: observer.next.bind(observer),
                  error: observer.error.bind(observer),
                  complete: observer.complete.bind(observer),
                });
              } else {
                // No token available, redirect to login or handle accordingly
                observer.error(new Error("No auth token available"));
              }
            })
            .catch((error) => {
              console.error("Token refresh failed", error);
              // Optionally, redirect to login page
              observer.error(error);
            });
        });
      }
    }
  }
);

// Auth Link to attach headers
const authLink = setContext((_, { headers }) => {
  const authTokensString = localStorage.getItem("authTokens");
  const token = authTokensString ? JSON.parse(authTokensString) : null;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token.accessToken}` : "",
      "Content-Type": "application/json",
    },
  };
});

const root_url = getGraphQlAPIRootDomain();

// Http Link
const httpLink = new HttpLink({
  uri: root_url,
});

// Combine the authLink, httpLink, and errorLink
export const client = new ApolloClient({
  link: authLink.concat(errorLink).concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  const adminString = localStorage.getItem("admin");

  const admin: AdminInterFace | null = adminString
    ? JSON.parse(adminString)
    : null;

  console.log(admin);

  const elementHandler = (component: React.ReactNode, route: string) => {
    return admin ? (
      admin.isVerified ? (
        <Navigate to={route} />
      ) : (
        component
        // <Login />
      )
    ) : (
      component
      // <Login />
    );
  };

  const routes = [
    {
      path: "/login",
      element: elementHandler(<Login />, "/feed/0"),
      protected: false,
    },
    {
      path: "/forgotpassword",
      element: elementHandler(<ForgotPassword />, "/feed/0"),
      protected: false,
    },
    {
      path: "/setpassword/:token",
      element: elementHandler(<SetPassword />, "/"),
      protected: false,
    },
    {
      path: "/account/initial",
      element: elementHandler(<SetPassword />, "/"),
      protected: false,
    },
    {
      path: "/",
      element: <Navigate to="/feed/0" />,
      protected: true,
    },

    {
      path: "/*",
      element: <Dashboard />,
      protected: true,
    },

    {
      path: "/changePassword",
      element: <ChangePassword />,
      protected: true,
    },

    {
      path: "/signup",
      element: <SignUpMain />,
      protected: false,
    },
    {
      path: "/Add-Masjid",
      element: <AddMasjidForm />,
      protected: false,
    },

    {
      path: "/DeleteAccountConfirm",
      element: <DeleteAccount />,
      protected: true,
    },
  ];

  return (
    <>
      <ApolloProvider client={client}>
        <ThemeProvider theme={Theme}>
          <CustomSnackbar />
          <Common_App routes={routes} />
        </ThemeProvider>
      </ApolloProvider>
    </>
  );
}

export default App;
