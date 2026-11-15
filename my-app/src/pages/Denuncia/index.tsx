import { useEffect, useState } from "react";
import { Link } from "react-router";
import { FaArrowLeft, FaCheckCircle, FaPaperPlane } from "react-icons/fa";

import CampoDenuncia from "../../components/CampoDenuncia/CampoDenuncia";
import AvisoDenuncia from "../../components/AvisoDenuncia/AvisoDenuncia";

export default function Denuncia() {
  const [idUsuario, setIdUsuario] = useState("");
  const [motivo, setMotivo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviada, setEnviada] = useState(false);

  useEffect(() => {
    document.title = "Denúncia - Junttô";
  }, []);

  function enviarDenuncia(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEnviada(true);
  }

  if (enviada) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--creme)] px-4 py-10">
        <section className="w-full max-w-xl rounded-3xl bg-white p-8 text-center shadow-lg sm:p-10">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[var(--verde)]/10">
            <FaCheckCircle className="text-5xl text-[var(--verde)]" />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[var(--azul)] sm:text-3xl">
            Denúncia enviada!
          </h1>

          <p className="mt-4 leading-relaxed text-gray-600">
            Recebemos sua denúncia. Obrigado por ajudar a manter nossa
            comunidade segura!
          </p>

          <Link
            to="/home"
            className="mt-8 flex min-h-14 w-full items-center justify-center rounded-xl bg-[var(--verde)] px-6 py-4 font-bold text-white transition hover:brightness-95"
          >
            Voltar para o início
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--creme)] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-5 shadow-lg sm:p-8">
        <header className="mb-8 flex items-center gap-4">
          <Link
            to="/home"
            aria-label="Voltar para o início"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--cinza)] text-xl text-[var(--azul)] transition hover:bg-gray-200"
          >
            <FaArrowLeft />
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-[var(--azul)] sm:text-3xl">
              Fazer uma denúncia
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Ajude a manter o Junttô um espaço seguro para todos
            </p>
          </div>
        </header>

        <AvisoDenuncia />

        <form onSubmit={enviarDenuncia} className="flex flex-col gap-6">
          <CampoDenuncia titulo="ID do usuário denunciado">
            <input
              type="text"
              value={idUsuario}
              onChange={(event) => setIdUsuario(event.target.value)}
              placeholder="Digite o ID do usuário"
              required
              className="h-14 w-full rounded-xl border border-gray-300 bg-white px-4 text-base text-[var(--azul)] outline-none transition placeholder:text-gray-400 focus:border-[var(--verde)] focus:ring-2 focus:ring-[var(--verde)]/20"
            />
          </CampoDenuncia>

          <CampoDenuncia titulo="Motivo da denúncia">
            <select
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              required
              className="h-14 w-full rounded-xl border border-gray-300 bg-white px-4 text-base text-[var(--azul)] outline-none transition focus:border-[var(--verde)] focus:ring-2 focus:ring-[var(--verde)]/20"
            >
              <option value="" disabled>
                Selecione um motivo
              </option>
              <option value="Comportamento inadequado">
                Comportamento inadequado
              </option>
              <option value="Assédio ou ameaça">Assédio ou ameaça</option>
              <option value="Golpe ou fraude">Golpe ou fraude</option>
              <option value="Informações falsas">Informações falsas</option>
              <option value="Discriminação">Discriminação</option>
              <option value="Outro">Outro</option>
            </select>
          </CampoDenuncia>

          <CampoDenuncia titulo="Mensagem">
            <textarea
              value={mensagem}
              onChange={(event) => setMensagem(event.target.value)}
              placeholder="Conte o que aconteceu..."
              rows={5}
              required
              className="w-full resize-y rounded-xl border border-gray-300 bg-white p-4 text-base leading-relaxed text-[var(--azul)] outline-none transition placeholder:text-gray-400 focus:border-[var(--verde)] focus:ring-2 focus:ring-[var(--verde)]/20"
            />
          </CampoDenuncia>

          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row">
            <Link
              to="/home"
              className="flex min-h-14 flex-1 items-center justify-center rounded-xl border-2 border-[var(--azul)] px-5 py-3 text-center font-bold text-[var(--azul)] transition hover:bg-[var(--cinza)]"
            >
              Cancelar denúncia
            </Link>

            <button
              type="submit"
              className="flex min-h-14 flex-1 items-center justify-center gap-3 rounded-xl bg-[var(--laranja)] px-5 py-3 font-bold text-white shadow-md transition hover:brightness-95"
            >
              <FaPaperPlane />
              Enviar denúncia
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}