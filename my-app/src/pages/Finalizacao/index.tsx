import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  FaArrowLeft,
  FaMinus,
  FaPlus,
  FaCheckCircle,
  FaMoneyBillWave,
} from "react-icons/fa";
import { api, obterSessao } from "../../services/api";
import type { Pedido, SolicitacaoAjuda } from "../../types/types";

type FinalizacaoProps = {
  temValor?: boolean;
};

// mostra a finalização da ajuda e do pagamento
export default function Finalizacao({ temValor = true }: FinalizacaoProps) {
  const navigate = useNavigate();
  const [parametros] = useSearchParams();
  const pedidoId = parametros.get("pedidoId");
  const [valorPagamento, setValorPagamento] = useState(0);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [caixinha, setCaixinha] = useState(0);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [nota, setNota] = useState(5);
  const [textoFeedback, setTextoFeedback] = useState("");
  const [candidaturas, setCandidaturas] = useState<SolicitacaoAjuda[]>([]);
  const [candidaturaId, setCandidaturaId] = useState("");

  useEffect(() => {
    document.title = "Finalização - Junttô";
    if (pedidoId) {
      void api
        .buscarPedido(pedidoId)
        .then(async (pedidoRecebido) => {
          setPedido(pedidoRecebido);
          setValorPagamento(Number(pedidoRecebido.valor || 0));
          if (pedidoRecebido.idCandidaturaAceita !== undefined)
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
            if (aceitas[0]) setCandidaturaId(String(aceitas[0].id));
          }
        })
        .catch(() => undefined);
    }
  }, [pedidoId]);

  // registra o pagamento do pedido
  async function finalizar() {
    if (!pedidoId) {
      setErro("O pedido não foi informado. Abra esta tela com ?pedidoId=ID.");
      return;
    }
    setErro("");
    setCarregando(true);
    try {
      if (pedido?.tipoPublicacao === "OFERTA") {
        if (
          candidaturas.some(
            (item) =>
              String(item.statusPagamento).toUpperCase() !== "CONFIRMADO",
          )
        ) {
          setErro(
            "Confirme o pagamento de todas as pessoas aceitas antes de concluir a oferta.",
          );
          setCarregando(false);
          return;
        }
        await api.atualizarStatusPedido(pedidoId, {
          usuarioId: obterSessao()?.id,
          status: "CONCLUIDO",
        });
        for (const candidatura of candidaturas) {
          const idAtual = String(candidatura.id);
          const mesmaSelecionada = idAtual === candidaturaId;
          const textoAtual = mesmaSelecionada
            ? textoFeedback.trim()
            : window.prompt(
                `Comentário para ${candidatura.prestador?.nome || `candidatura #${idAtual}`}:`,
              ) || "";
          const notaAtual = mesmaSelecionada
            ? nota
            : Number(window.prompt("Nota de 1 a 5:", "5") || 5);
          if (textoAtual || notaAtual) {
            await api.criarComentario(pedidoId, {
              usuarioId: obterSessao()?.id,
              estrelas: Math.min(5, Math.max(1, notaAtual || 5)),
              texto: textoAtual,
              idCandidatura: candidatura.id,
            });
          }
        }
      } else if (temValor && !pedido?.naoIncluirPagamento)
        await api.registrarPagamento(pedidoId, {
          formaPagamento: "A_COMBINAR",
          valor: valorPagamento,
          caixinha,
          usuarioId: obterSessao()?.id,
          idCandidatura: pedido?.idCandidaturaAceita,
        });
      else
        await api.atualizarStatusPedido(pedidoId, {
          usuarioId: obterSessao()?.id,
          status: "CONCLUIDO",
        });
      if (
        pedido?.tipoPublicacao !== "OFERTA" &&
        textoFeedback.trim() &&
        candidaturaId
      )
        await api.criarComentario(pedidoId, {
          usuarioId: obterSessao()?.id,
          estrelas: nota,
          texto: textoFeedback.trim(),
          idCandidatura: candidaturaId,
        });
      navigate("/home-prototipo");
    } catch (erroApi) {
      setErro(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível finalizar o pedido.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--creme)] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-5 shadow-lg sm:p-8">
        <header className="mb-8 flex items-center gap-4">
          <Link
            to="/home-prototipo"
            aria-label="Voltar"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--cinza)] text-xl text-[var(--azul)] transition hover:bg-gray-200"
          >
            <FaArrowLeft />
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-[var(--azul)] sm:text-3xl">
              Finalização
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Registre o pagamento enviado ao prestador e avalie a ajuda
            </p>
          </div>
        </header>

        <section className="mb-8 rounded-2xl border border-[var(--laranja)]/20 bg-[var(--creme)] p-5 sm:p-6">
          <h2 className="text-lg font-bold text-[var(--azul)]">
            Dados da transferência
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Confira quem está enviando e quem vai receber o pagamento.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Quem envia
              </p>
              <p className="mt-2 font-bold text-[var(--azul)]">
                {obterSessao()?.nome || "Usuário atual"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                ID: {obterSessao()?.id ?? "não informado"} ·{" "}
                {obterSessao()?.bairro || "Bairro não informado"}
              </p>
            </div>
            <div className="rounded-xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Quem recebe
              </p>
              <p className="mt-2 font-bold text-[var(--azul)]">
                {pedido?.prestador?.nome || "Prestador ainda não informado"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                ID: {pedido?.prestador?.id ?? "não informado"} ·{" "}
                {pedido?.prestador?.bairro || "Bairro não informado"}
              </p>
            </div>
          </div>
        </section>

        {temValor && (
          <section className="rounded-2xl bg-[var(--creme)] p-5 sm:p-6">
            <h2 className="flex items-center gap-3 text-lg font-bold text-[var(--azul)] sm:text-xl">
              <FaMoneyBillWave className="text-2xl text-[var(--verde)]" />
              Resumo do pagamento
            </h2>

            <div className="mt-6 flex items-center justify-between gap-3">
              <span className="text-base text-[var(--azul)]">
                Valor enviado ao prestador
              </span>

              <label className="flex items-center gap-1 text-lg font-bold text-[var(--azul)]">
                <span>R$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={valorPagamento}
                  onChange={(event) =>
                    setValorPagamento(Math.max(0, Number(event.target.value)))
                  }
                  aria-label="Valor enviado ao prestador"
                  className="w-28 rounded-lg border border-gray-300 bg-white px-2 py-1 text-right outline-none focus:border-[var(--verde)]"
                />
              </label>
            </div>

            <div className="mt-7">
              <p className="mb-4 font-semibold text-[var(--azul)]">
                Caixinha (opcional)
              </p>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCaixinha(Math.max(0, caixinha - 1))}
                  disabled={caixinha === 0}
                  aria-label="Diminuir caixinha"
                  className="flex size-12 min-w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--azul)] bg-white text-[var(--azul)] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FaMinus />
                </button>

                <div className="flex flex-1 flex-col items-center">
                  <span className="text-2xl font-bold text-[var(--azul)]">
                    R$ {caixinha.toFixed(2).replace(".", ",")}
                  </span>

                  <span className="mt-1 text-xs text-gray-500">
                    Valor adicional
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setCaixinha(caixinha + 1)}
                  aria-label="Aumentar caixinha"
                  className="flex size-12 min-w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--azul)] bg-white text-[var(--azul)] transition hover:bg-gray-100"
                >
                  <FaPlus />
                </button>
              </div>
            </div>

            <div className="mt-7 flex items-center justify-between gap-3 border-t border-gray-300 pt-5">
              <span className="text-lg font-bold text-[var(--azul)]">
                Total
              </span>

              <span className="text-2xl font-bold text-[var(--verde)]">
                R$ {(valorPagamento + caixinha).toFixed(2).replace(".", ",")}
              </span>
            </div>
          </section>
        )}

        {pedido?.tipoPublicacao === "OFERTA" && candidaturas.length > 0 && (
          <section className="mt-6 rounded-2xl bg-[var(--creme)] p-5">
            <label className="flex flex-col gap-2 text-sm font-bold text-[var(--azul)]">
              Pessoa do feedback
              <select
                value={candidaturaId}
                onChange={(event) => setCandidaturaId(event.target.value)}
                className="h-11 rounded-xl border border-gray-300 bg-white px-3 font-normal"
              >
                {candidaturas.map((candidatura) => (
                  <option key={candidatura.id} value={String(candidatura.id)}>
                    {candidatura.prestador?.nome ||
                      `Candidatura #${candidatura.id}`}
                  </option>
                ))}
              </select>
            </label>
          </section>
        )}
        <section className="mt-6 rounded-2xl bg-[var(--creme)] p-5">
          <h2 className="font-bold text-[var(--azul)]">Seu feedback</h2>
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
                placeholder="Conte como foi a ajuda"
              />
            </label>
          </div>
        </section>
        {erro && (
          <p
            role="alert"
            className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {erro}
          </p>
        )}

        {temValor && (
          <button
            type="button"
            onClick={finalizar}
            className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-[var(--laranja)] px-6 py-4 text-lg font-bold text-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:brightness-95 hover:shadow-lg active:translate-y-0 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--azul)]"
          >
            <FaCheckCircle className="text-xl" />
            {carregando ? "Registrando..." : "Registrar pagamento"}
          </button>
        )}
      </div>
    </main>
  );
}
