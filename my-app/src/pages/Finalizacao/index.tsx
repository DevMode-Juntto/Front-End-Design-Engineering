import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { FaArrowLeft, FaMinus, FaPlus, FaCheckCircle, FaMoneyBillWave } from "react-icons/fa";
import CampoFeedback from "../../components/CampoFeedback/CampoFeedback";
import { api, formatarValor, NOMES_STATUS, obterSessao } from "../../services/api";
import type { Candidatura, Pedido } from "../../types/types";

// Tela de quem RECEBEU a ajuda:
// - AJUDA (quem publicou): confirma que o serviço foi feito (CONCLUIDO), com caixinha opcional, e avalia quem ajudou
// - OFERTA (interessado aceito): depois que a oferta é concluída, avalia quem ofereceu
// O pagamento é feito fora do app: quem recebeu o dinheiro confirma na tela de confirmação de recebimento.
export default function Finalizacao() {
  const navigate = useNavigate();
  const [parametros] = useSearchParams();
  const pedidoId = parametros.get("pedidoId");
  const sessao = obterSessao();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [minhaCandidatura, setMinhaCandidatura] = useState<Candidatura | null>(null);
  const [caixinha, setCaixinha] = useState(0);
  const [estrelas, setEstrelas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    document.title = "Finalização - Junttô";
    if (pedidoId)
      api
        .buscarPedido(pedidoId, sessao?.id)
        .then(setPedido)
        .catch((e) => setErro(e instanceof Error ? e.message : "Não foi possível carregar o pedido."));
    // em OFERTA, quem recebe a ajuda é o interessado aceito: busca a candidatura dele
    if (pedidoId && sessao?.id)
      api
        .listarMinhasCandidaturas(sessao.id)
        .then((lista) => setMinhaCandidatura(lista.find((c) => c.idPedido === pedidoId && c.status === "ACEITA") || null))
        .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoId]);

  const ehOferta = pedido?.tipoPublicacao === "OFERTA";
  const temPagamento = pedido ? !pedido.naoIncluirPagamento && pedido.valor != null : false;
  // AJUDA: quem publicou conclui enquanto está EM_ANDAMENTO (pode dar caixinha)
  const precisaConfirmar = !ehOferta && pedido?.status === "EM_ANDAMENTO";
  const podeDarCaixinha = precisaConfirmar && temPagamento;
  const statusPagamento = ehOferta ? minhaCandidatura?.statusPagamento : pedido?.statusPagamento;
  const ehQuemRecebe = pedido && sessao ? (ehOferta ? minhaCandidatura != null : pedido.idAjudado === sessao.id) : false;
  const nomeAjudante = pedido
    ? pedido.tipoPublicacao === "OFERTA"
      ? pedido.nomeSolicitante
      : pedido.nomePrestador
    : "";

  async function finalizar() {
    if (!pedidoId || !pedido || !sessao) {
      setErro("O pedido não foi informado. Abra esta tela com ?pedidoId=ID.");
      return;
    }
    setErro("");
    setCarregando(true);
    try {
      if (precisaConfirmar)
        await api.atualizarStatusPedido(pedidoId, {
          usuarioId: sessao.id,
          status: "CONCLUIDO",
          caixinha: podeDarCaixinha && caixinha > 0 ? caixinha : undefined,
        });
      if (estrelas > 0)
        await api.avaliar(pedidoId, { usuarioId: sessao.id, estrelas, texto: comentario.trim() || undefined });
      navigate("/home-prototipo");
    } catch (erroApi) {
      setErro(erroApi instanceof Error ? erroApi.message : "Não foi possível finalizar o pedido.");
      // recarrega para mostrar o que já foi salvo
      api.buscarPedido(pedidoId, sessao.id).then(setPedido).catch(() => undefined);
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
            <h1 className="text-2xl font-bold text-[var(--azul)] sm:text-3xl">Finalização</h1>
            <p className="mt-1 text-sm text-gray-500">Confirme o serviço, dê uma caixinha (opcional) e avalie quem ajudou</p>
          </div>
        </header>

        {pedido && (
          <section className="mb-8 rounded-2xl border border-[var(--laranja)]/20 bg-[var(--creme)] p-5 sm:p-6">
            <h2 className="text-lg font-bold text-[var(--azul)]">{pedido.titulo}</h2>
            <p className="mt-1 text-sm text-gray-600">
              Situação: <strong>{NOMES_STATUS[pedido.status] || pedido.status}</strong> · Quem ajudou:{" "}
              <strong>{nomeAjudante || "não definido"}</strong>
            </p>
            {!ehQuemRecebe && (
              <p className="mt-3 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                Esta tela é de quem recebeu a ajuda. Use a tela de confirmação de recebimento se você ajudou.
              </p>
            )}
            {precisaConfirmar && (
              <p className="mt-3 text-sm text-[var(--azul)]">
                Ao finalizar, você confirma que o serviço foi realizado.
              </p>
            )}
            {ehOferta && pedido.status !== "CONCLUIDO" && (
              <p className="mt-3 text-sm text-[var(--azul)]">
                A avaliação fica disponível quando {pedido.nomeSolicitante} concluir a oferta.
              </p>
            )}
          </section>
        )}

        {pedido && temPagamento && (
          <section className="rounded-2xl bg-[var(--creme)] p-5 sm:p-6">
            <h2 className="flex items-center gap-3 text-lg font-bold text-[var(--azul)] sm:text-xl">
              <FaMoneyBillWave className="text-2xl text-[var(--verde)]" />
              Pagamento
            </h2>
            {podeDarCaixinha ? (
              <>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <span className="text-base text-[var(--azul)]">Valor combinado</span>
                  <span className="text-lg font-bold text-[var(--azul)]">{formatarValor(pedido)}</span>
                </div>
                <div className="mt-7">
                  <p className="mb-4 font-semibold text-[var(--azul)]">Caixinha (opcional)</p>
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
                    <span className="text-2xl font-bold text-[var(--azul)]">
                      R$ {caixinha.toFixed(2).replace(".", ",")}
                    </span>
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
                  <span className="text-lg font-bold text-[var(--azul)]">Total</span>
                  <span className="text-2xl font-bold text-[var(--verde)]">
                    R$ {((pedido.valor || 0) + caixinha).toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  O pagamento é feito diretamente entre as pessoas, fora do Junttô. Quem recebeu confirma o recebimento.
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm text-[var(--azul)]">
                Valor: R$ {(pedido.total ?? pedido.valor ?? 0).toFixed(2).replace(".", ",")} ·{" "}
                {statusPagamento === "CONFIRMADO"
                  ? "recebimento confirmado por quem ajudou"
                  : "pague diretamente a quem ajudou; ele confirma o recebimento no app"}
              </p>
            )}
          </section>
        )}

        <div className="mt-8">
          <CampoFeedback
            estrelas={estrelas}
            aoAlterarEstrelas={setEstrelas}
            comentario={comentario}
            aoAlterar={setComentario}
            pessoaAvaliada={nomeAjudante || "quem ajudou"}
          />
        </div>

        {erro && (
          <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {erro}
          </p>
        )}

        <button
          type="button"
          onClick={finalizar}
          disabled={carregando || !pedido || (ehOferta && pedido.status !== "CONCLUIDO")}
          className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-[var(--laranja)] px-6 py-4 text-lg font-bold text-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:brightness-95 disabled:opacity-50"
        >
          <FaCheckCircle className="text-xl" />
          {carregando ? "Registrando..." : precisaConfirmar ? "Confirmar conclusão e avaliar" : "Enviar avaliação"}
        </button>
      </div>
    </main>
  );
}
