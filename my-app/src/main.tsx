import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./base.css";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router";

import App from "./App";
import Home from "./pages/Home/index";
import Integrantes from "./pages/Integrantes/index";
import Sobre from "./pages/Sobre";
import FAQ from "./pages/Faq";
import Contato from "./pages/Contato";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: "home", element: <Home /> },
      { path: "integrantes", element: <Integrantes /> },
      { path: "sobre", element: <Sobre /> },
      { path: "faq", element: <FAQ /> },
      { path: "contato", element: <Contato /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
