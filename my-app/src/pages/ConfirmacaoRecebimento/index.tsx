import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHome,
} from "react-icons/fa";

import ResumoRecebimento from "../../components/ResumoRecebimento/ResumoRecebimento";

type ConfirmacaoRecebimentoProps = {
  nomeSolicitante?: string;
  valorRecebido?: number;
};

export default function ConfirmacaoRecebimento({
  nomeSolicitante,
  valorRecebido,
}: ConfirmacaoRecebimentoProps) {
  const [confirmado, setConfirmado] = useState(false);

  useEffect(() => {
    document.title = "Confirmar recebimento - Junttô";
  }, []);

  function confirmarRecebimento() {
    setConfirmado(true);
  }

  return (
    <main className="min-h-screen bg-[var(--creme)] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-5 shadow-lg sm:p-8">
        {!confirmado ? (
          <>
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
                  Confirmar recebimento
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Confirme se você recebeu o pagamento pelo serviço
                </p>
              </div>
            </header>

            <div className="mb-7 rounded-2xl border border-[var(--verde)]/20 bg-[var(--verde)]/10 p-4">
              <p className="text-sm leading-relaxed text-[var(--azul)]">
                O pagamento é realizado diretamente entre as pessoas, fora do
                Junttô. Confirme somente se você recebeu o valor combinado.
              </p>
            </div>

            <div className="flex flex-col gap-7">
              <ResumoRecebimento
                nomeSolicitante={nomeSolicitante}
                valorRecebido={valorRecebido}
              />

              <button
                type="button"
                onClick={confirmarRecebimento}
                className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-[var(--verde)] px-6 py-4 text-lg font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-95 hover:shadow-lg active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--azul)]"
              >
                <FaCheckCircle className="text-xl" />
                Confirmar recebimento
              </button>
            </div>
          </>
        ) : (
          <section className="py-8 text-center sm:py-12">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[var(--verde)]/10">
              <FaCheckCircle className="text-5xl text-[var(--verde)]" />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-[var(--azul)] sm:text-3xl">
              Recebimento confirmado!
            </h1>

            <p className="mx-auto mt-4 max-w-md leading-relaxed text-gray-600">
              Você confirmou o recebimento do pagamento e a ajuda foi
              finalizada. Obrigado por fazer parte do Junttô!
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/home"
                className="flex min-h-14 flex-1 items-center justify-center gap-3 rounded-xl bg-[var(--verde)] px-5 py-4 font-bold text-white transition hover:brightness-95"
              >
                <FaHome className="text-lg" />
                Voltar para o início
              </Link>

              <Link
                to="/denuncia"
                className="flex min-h-14 flex-1 items-center justify-center gap-3 rounded-xl border border-[var(--coral)] bg-[var(--coral)]/10 px-5 py-4 font-bold text-[var(--coral)] transition hover:bg-[var(--coral)]/20"
              >
                <FaExclamationTriangle className="text-lg" />
                Denunciar
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}