import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHome,
} from "react-icons/fa";

import ResumoRecebimento from "../../components/ResumoRecebimento/ResumoRecebimento";
import { api, obterSessao } from "../../services/api";
import type { Pedido, SolicitacaoAjuda } from "../../types/types";

type ConfirmacaoRecebimentoProps = {
  nomeSolicitante?: string;
  valorRecebido?: number;
};

// mostra a confirmação do pagamento recebido
export default function ConfirmacaoRecebimento({
  nomeSolicitante,
  valorRecebido,
}: ConfirmacaoRecebimentoProps) {
  const [parametros] = useSearchParams();
  const pedidoId = parametros.get("pedidoId");
  const candidaturaInformada = parametros.get("idCandidatura");
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [candidaturas, setCandidaturas] = useState<SolicitacaoAjuda[]>([]);
  const [candidaturaId, setCandidaturaId] = useState(
    candidaturaInformada || "",
  );
  const [nota, setNota] = useState(5);
  const [textoFeedback, setTextoFeedback] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    document.title = "Confirmar recebimento - Junttô";
    if (pedidoId) {
      void api
        .buscarPedido(pedidoId)
        .then(async (pedidoRecebido) => {
          setPedido(pedidoRecebido);
          if (
            pedidoRecebido.idCandidaturaAceita !== undefined &&
            !candidaturaInformada
          )
            setCandidaturaId(String(pedidoRecebido.idCandidaturaAceita));
          if (pedidoRecebido.tipoPublicacao === "OFERTA" && obterSessao()?.id) {
            const lista = await api.listarSolicitacoesPedido(
              pedidoId,
              obterSessao()?.id,
            );
            const aceitas = lista.filter(
              (item) => String(item.status).toUpperCase() === "ACEITA",
            );
            setCandidaturas(aceitas);
            if (!candidaturaInformada && aceitas[0])
              setCandidaturaId(String(aceitas[0].id));
          }
        })
        .catch(() => undefined);
    }
  }, [candidaturaInformada, pedidoId]);

  // confirma o recebimento do pagamento
  async function confirmarRecebimento() {
    if (!pedidoId) {
      setErro("O pedido não foi informado. Abra esta tela com ?pedidoId=ID.");
      return;
    }
    setErro("");
    setCarregando(true);
    try {
      await api.confirmarPagamento(pedidoId, candidaturaId || undefined);
      if (textoFeedback.trim() && candidaturaId) {
        await api.criarComentario(pedidoId, {
          usuarioId: obterSessao()?.id,
          estrelas: nota,
          texto: textoFeedback.trim(),
          idCandidatura: candidaturaId,
        });
      }
      setConfirmado(true);
    } catch (erroApi) {
      setErro(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível confirmar o recebimento.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--creme)] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-5 shadow-lg sm:p-8">
        {!confirmado ? (
          <>
            <header className="mb-8 flex items-center gap-4">
              <Link
                to="/home-prototipo"
                aria-label="Voltar para o início"
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--cinza)] text-xl text-[var(--azul)] transition hover:bg-gray-200"
              >
                <FaArrowLeft />
              </Link>

              <div>
                <h1 className="text-2xl font-bold text-[var(--azul)] sm:text-3xl">
                  Confirmar pagamento recebido
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Confirme o pagamento recebido por você
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
              {candidaturas.length > 1 && (
                <section className="rounded-2xl bg-[var(--creme)] p-4">
                  <p className="font-bold text-[var(--azul)]">
                    Escolha quem recebeu este pagamento
                  </p>
                  <div className="mt-3 grid gap-2">
                    {candidaturas.map((candidatura) => (
                      <button
                        key={candidatura.id}
                        type="button"
                        onClick={() => setCandidaturaId(String(candidatura.id))}
                        className={`rounded-xl border p-3 text-left text-sm ${String(candidatura.id) === candidaturaId ? "border-[var(--verde)] bg-[var(--verde)]/10" : "border-gray-200 bg-white"}`}
                      >
                        <strong>
                          {candidatura.prestador?.nome ||
                            `Candidatura #${candidatura.id}`}
                        </strong>
                      </button>
                    ))}
                  </div>
                </section>
              )}
              <ResumoRecebimento
                nomeSolicitante={pedido?.solicitante?.nome || nomeSolicitante}
                idSolicitante={pedido?.solicitante?.id}
                bairroSolicitante={pedido?.solicitante?.bairro}
                nomePrestador={pedido?.prestador?.nome || obterSessao()?.nome}
                idPrestador={pedido?.prestador?.id || obterSessao()?.id}
                bairroPrestador={
                  pedido?.prestador?.bairro || obterSessao()?.bairro
                }
                valorRecebido={
                  valorRecebido ??
                  (
                    pedido?.pagamento as
                      | { total?: number; valor?: number }
                      | undefined
                  )?.total ??
                  (pedido?.pagamento as { valor?: number } | undefined)
                    ?.valor ??
                  pedido?.valor
                }
              />

              {erro && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {erro}
                </p>
              )}

              <section className="rounded-2xl bg-[var(--creme)] p-5">
                <h2 className="font-bold text-[var(--azul)]">
                  Avalie a outra pessoa
                </h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-[150px_1fr]">
                  <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--azul)]">
                    Estrelas
                    <select
                      value={nota}
                      onChange={(event) => setNota(Number(event.target.value))}
                      className="h-11 rounded-xl border border-gray-300 bg-white px-3"
                    >
                      {[1, 2, 3, 4, 5].map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--azul)]">
                    Comentário
                    <textarea
                      value={textoFeedback}
                      onChange={(event) => setTextoFeedback(event.target.value)}
                      rows={3}
                      className="rounded-xl border border-gray-300 bg-white p-3 font-normal"
                      placeholder="Conte como foi a experiência"
                    />
                  </label>
                </div>
              </section>
              <button
                type="button"
                onClick={confirmarRecebimento}
                className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-[var(--verde)] px-6 py-4 text-lg font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-95 hover:shadow-lg active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--azul)]"
              >
                <FaCheckCircle className="text-xl" />
                {carregando ? "Registrando..." : "Confirmar pagamento recebido"}
              </button>
            </div>
          </>
        ) : (
          <section className="py-8 text-center sm:py-12">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[var(--verde)]/10">
              <FaCheckCircle className="text-5xl text-[var(--verde)]" />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-[var(--azul)] sm:text-3xl">
              Pagamento registrado!
            </h1>

            <p className="mx-auto mt-4 max-w-md leading-relaxed text-gray-600">
              Você confirmou o recebimento do pagamento e o serviço foi
              registrado como concluído. Obrigado por fazer parte do Junttô!
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/home-prototipo"
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
