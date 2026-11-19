import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaUsers,
  FaLightbulb,
  FaQuestionCircle,
  FaEnvelope,
  FaPlus,
  FaHistory,
  FaUser,
  FaExclamationTriangle,
  FaHandsHelping,
  FaLock,
  FaSignOutAlt,
} from "react-icons/fa";
import logoPrincipal from "../../img/logo-principal.png";
import type { ItemMenu } from "../../types/types";

const principais: ItemMenu[] = [
  { nome: "Home", caminho: "/home", icone: <FaHome /> },
  { nome: "Integrantes", caminho: "/integrantes", icone: <FaUsers /> },
  { nome: "Sobre", caminho: "/sobre", icone: <FaLightbulb /> },
  { nome: "FAQ", caminho: "/faq", icone: <FaQuestionCircle /> },
  { nome: "Contato", caminho: "/contato", icone: <FaEnvelope /> },
];

const prototipos: ItemMenu[] = [
  {
    nome: "HomePrototipo · Painel de ajuda",
    caminho: "/home-prototipo",
    icone: <FaHandsHelping />,
  },
  {
    nome: "Publicar pedido de ajuda",
    caminho: "/publicar-pedido",
    icone: <FaPlus />,
  },
  { nome: "Histórico", caminho: "/historico", icone: <FaHistory /> },
  { nome: "Perfil", caminho: "/perfil", icone: <FaUser /> },
  { nome: "Denúncias", caminho: "/denuncia", icone: <FaExclamationTriangle /> },
  { nome: "Painel administrador", caminho: "/admin", icone: <FaLock /> },
];

function Grupo({
  titulo,
  texto,
  itens,
  fechar,
}: {
  titulo: string;
  texto?: string;
  itens: ItemMenu[];
  fechar: () => void;
}) {
  return (
    <div className="border-b border-[var(--cinza)] pb-2 last:border-b-0 last:pb-0">
      <div className="px-3 pb-2 pt-1">
        <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--laranja)]">
          {titulo}
        </p>
        {texto && (
          <p className="mt-0.5 text-[11px] leading-tight text-gray-500">
            {texto}
          </p>
        )}
      </div>
      {itens.map((item) => (
        <Link
          key={item.nome}
          to={item.caminho}
          onClick={fechar}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--azul)] transition hover:bg-[var(--creme)] hover:text-[var(--verde)]"
        >
          <span className="text-base text-[var(--verde)]">{item.icone}</span>
          <span>{item.nome}</span>
        </Link>
      ))}
    </div>
  );
}

export default function Menu() {
  const [aberto, setAberto] = useState(false);
  const navegar = useNavigate();
  const fechar = () => setAberto(false);

  // encerra a sessão e volta p tela de login
  function sair() {
    sessionStorage.removeItem("junttô_usuario");
    sessionStorage.removeItem("junttô_token");
    fechar();
    navegar("/login", { replace: true });
  }

  return (
    <header className="relative z-50 w-full bg-[var(--branco)] shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/home" onClick={fechar} className="flex items-center">
          <img
            src={logoPrincipal}
            alt="Logo Junttô"
            className="h-12 w-auto object-contain"
          />
        </Link>

        <button
          type="button"
          onClick={() => setAberto(!aberto)}
          className="flex items-center justify-center rounded-lg p-3 text-2xl text-[var(--azul)] transition hover:bg-[var(--cinza)] hover:text-[var(--verde)]"
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={aberto}
        >
          {aberto ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {aberto && (
        <nav className="absolute right-6 top-full flex max-h-[calc(100vh-6rem)] w-80 flex-col gap-3 overflow-y-auto rounded-xl border border-[var(--cinza)] bg-[var(--branco)] p-3 shadow-xl">
          <Grupo
            titulo="Páginas principais"
            itens={principais}
            fechar={fechar}
          />
          <Grupo
            titulo="Protótipos"
            itens={prototipos}
            fechar={fechar}
          />
          <button
            type="button"
            onClick={sair}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--coral)] transition hover:bg-red-50"
          >
            <span className="text-base">
              <FaSignOutAlt />
            </span>
            <span>Sair</span>
          </button>
        </nav>
      )}
    </header>
  );
}
