import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./base.css";
import { instalarFeedbackBotoes } from "./services/feedbackBotoes";

import { createBrowserRouter, RouterProvider, Navigate } from "react-router";

import App from "./App";

import Home from "./pages/Home/index";
import Integrantes from "./pages/Integrantes/index";
import Sobre from "./pages/Sobre/index";
import Contato from "./pages/Contato/index";
import Perfil from "./pages/Perfil/index";
import Login from "./pages/Login/index";
import Cadastro from "./pages/Cadastro/index";
import FAQ from "./pages/FAQ";
import PublicarPedido from "./pages/PublicarPedido";
import Finalizacao from "./pages/Finalizacao";
import Denuncia from "./pages/Denuncia";
import ConfirmacaoRecebimento from "./pages/ConfirmacaoRecebimento";
import Historico from "./pages/Historico";
import HomePrototipo from "./pages/HomePrototipo";
import Admin from "./pages/Admin";
import DetalhesPedido from "./pages/DetalhesPedido";
import NaoEncontrada from "./pages/NaoEncontrada";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NaoEncontrada />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: "home", element: <Home /> },
      { path: "home-prototipo", element: <HomePrototipo /> },
      { path: "historico", element: <Historico /> },
      { path: "integrantes", element: <Integrantes /> },
      { path: "sobre", element: <Sobre /> },
      { path: "faq", element: <FAQ /> },
      { path: "contato", element: <Contato /> },
      { path: "perfil", element: <Perfil ehDono={true} /> },
      { path: "perfil/:id", element: <Perfil ehDono={false} /> },
      { path: "publicar-pedido", element: <PublicarPedido /> },
      { path: "finalizacao", element: <Finalizacao /> },
      { path: "denuncia", element: <Denuncia /> },
      { path: "confirmacao-recebimento", element: <ConfirmacaoRecebimento /> },
      { path: "admin", element: <Admin /> },
      { path: "pedido/:id", element: <DetalhesPedido /> },
      { path: "*", element: <NaoEncontrada /> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/cadastro", element: <Cadastro /> },
]);

instalarFeedbackBotoes();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
