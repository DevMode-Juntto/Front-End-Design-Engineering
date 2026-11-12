import { Link } from "react-router";
import { FaGithub } from "react-icons/fa";
import logoPrincipal from "../../img/logo-principal.png";

export default function Rodape() {
    return (
        <footer className="border-t border-[var(--cinza)] bg-white px-6 py-10 text-[var(--azul)]">
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-3">
                <div className="flex flex-col items-start gap-3">
                    <img
                        src={logoPrincipal}
                        alt="Logo Junttô"
                        className="h-16 w-auto object-contain"
                    />

                    <p className="max-w-xs text-sm leading-relaxed">
                        Conectando pessoas, fortalecendo comunidades e incentivando a
                        colaboração
                    </p>
                </div>

                <div>
                    <h2 className="mb-4 text-lg font-bold">Navegação</h2>

                    <nav className="flex flex-col items-start gap-3 text-sm">
                        <Link to="/home" className="transition hover:text-[var(--verde)]">
                            Home
                        </Link>
                        <Link to="/sobre" className="transition hover:text-[var(--verde)]">
                            Sobre
                        </Link>
                        <Link
                            to="/integrantes"
                            className="transition hover:text-[var(--verde)]"
                        >
                            Integrantes
                        </Link>
                        <Link to="/faq" className="transition hover:text-[var(--verde)]">
                            FAQ
                        </Link>
                        <Link
                            to="/contato"
                            className="transition hover:text-[var(--verde)]"
                        >
                            Contato
                        </Link>
                    </nav>
                </div>

                <div>
                    <h2 className="mb-4 text-lg font-bold">Conheça o projeto</h2>

                    <p className="text-sm leading-relaxed">
                        Faça parte de uma comunidade que acredita na força da ajuda e da
                        colaboração entre pessoas.
                    </p>

                    <a
                        href="https://github.com/DevMode-Juntto/Front-End-Design-Engineering"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Acessar repositório do Junttô no GitHub"
                        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[var(--verde)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--verde)] hover:text-white"
                    >
                        <FaGithub size={20} />
                        Repositório no GitHub
                    </a>
                </div>
            </div>

            <div className="mx-auto mt-10 max-w-6xl border-t border-[var(--cinza)] pt-6 text-center">
                <p className="text-xs text-[var(--texto)]/70">
                    © 2026 Junttô – 1TDSPY. All rights reserved.
                </p>
            </div>

            <p className="mt-3 text-xs text-[var(--texto)]/70">
                Made with <span className="text-[var(--coral)]">♥</span> by the DevMode
                team
            </p>
        </footer>
    );
}
