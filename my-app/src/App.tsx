import { Outlet, useLocation } from "react-router";
import Menu from "./components/Menu/Menu";
import Rodape from "./components/Rodape/Rodape";
import Chat from "./components/Chat/Chat";

const paginasPrototipo = [
  "/home-prototipo",
  "/publicar-pedido",
  "/historico",
  "/perfil",
  "/denuncia",
  "/finalizacao",
  "/confirmacao-recebimento",
  "/admin",
];

export default function App() {
  const localizacao = useLocation();
  const mostrarChat = paginasPrototipo.some((pagina) =>
    localizacao.pathname.startsWith(pagina),
  );

  return (
    <div className="App">
      <Menu />
      <Outlet />
      <Rodape />
      {mostrarChat && <Chat />}
    </div>
  );
}
