import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
// import { Auth0Provider } from '@auth0/auth0-react';
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import NewLog from "./components/NewLog.jsx";
import Hospital from "./components/Hospital.jsx";
import Route from "./components/Route.jsx";
import FrontPage from "./components/Frontpage.jsx"
import Patient from "./components/Patient.jsx";
import Dash from "./components/Dash.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/newlog",
    element: <NewLog />,
  },
    {
    path: "/near",
    element: <Hospital />,
  },
  {
    path: "/route",
    element: <Route />,
  },
    {
    path: "/main",
    element: <FrontPage />,
  },
    {
    path: "/patient",
    element: <Patient />,
  },
  {
    path: "/dash",
    element: <Dash />,
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
  <RouterProvider router={router} />
  </StrictMode>
);
