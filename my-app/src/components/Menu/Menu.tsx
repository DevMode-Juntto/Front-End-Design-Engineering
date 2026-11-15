import { useState } from "react";
import { Link } from "react-router";
import {
    FaBars,
    FaTimes,
    FaHome,
    FaUsers,
    FaLightbulb,
    FaQuestionCircle,
    FaEnvelope,
} from "react-icons/fa";
import logoPrincipal from "../../img/logo-principal.png";

const links = [
    { nome: "Home", caminho: "/home", icone: <FaHome /> },
    { nome: "Integrantes", caminho: "/integrantes", icone: <FaUsers /> },
    { nome: "Sobre", caminho: "/sobre", icone: <FaLightbulb /> },
    { nome: "FAQ", caminho: "/faq", icone: <FaQuestionCircle /> },
    { nome: "Contato", caminho: "/contato", icone: <FaEnvelope /> },
];

export default function Menu() {
    const [menuAberto, setMenuAberto] = useState(false);

    return (
        <header className="relative z-50 w-full bg-[var(--branco)] shadow-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <Link
                    to="/home"
                    onClick={() => setMenuAberto(false)}
                    className="flex items-center"
                >
                    <img
                        src={logoPrincipal}
                        alt="Logo Junttô"
                        className="h-12 w-auto object-contain"
                    />
                </Link>

                <button
                    type="button"
                    onClick={() => setMenuAberto(!menuAberto)}
                    className="flex items-center justify-center rounded-lg p-3 text-2xl text-[var(--azul)] transition hover:bg-[var(--cinza)] hover:text-[var(--verde)]"
                    aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
                    aria-expanded={menuAberto}
                >
                    {menuAberto ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {menuAberto && (
                <nav className="absolute right-6 top-full flex w-56 flex-col rounded-xl border border-[var(--cinza)] bg-[var(--branco)] p-3 shadow-xl">
                    {links.map((link) => (
                        <Link
                            key={link.nome}
                            to={link.caminho}
                            onClick={() => setMenuAberto(false)}
                            className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-[var(--azul)] transition hover:bg-[var(--creme)] hover:text-[var(--verde)]"
                        >
                            <span className="text-lg text-[var(--verde)]">{link.icone}</span>

                            {link.nome}
                        </Link>
                    ))}
                </nav>
            )}
        </header>
    );
}
