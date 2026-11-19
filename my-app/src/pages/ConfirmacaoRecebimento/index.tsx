import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHome,
} from "react-icons/fa";

import ResumoRecebimento from "../../components/ResumoRecebimento/ResumoRecebimento";
import CampoFeedback from "../../components/CampoFeedback/CampoFeedback";
import { api, NOMES_STATUS_PAGAMENTO, obterSessao } from "../../services/api";
import { API_PYTHON_DISPONIVEL } from "../../services/apiPython";
import type { Candidatura, Pedido } from "../../types/types";

// Tela de quem AJUDOU / OFERECEU (idAjudante): o pagamento é feito fora do app e quem RECEBEU confirma aqui.
// - AJUDA: o candidato aceito confirma o pagamento (ou a recompensa) depois da conclusão e avalia quem publicou
// - OFERTA: quem ofereceu escolhe o interessado aceito, confirma o pagamento dele e, com a oferta concluída, avalia
export default function ConfirmacaoRecebimento() {
  const [parametros] = useSearchParams();
  const pedidoId = parametros.get("pedidoId");
  const sessao = obterSessao();
  const [aceitas, setAceitas] = useState<Candidatura[]>([]);
  const [idCandidatura, setIdCandidatura] = useState(parametros.get("idCandidatura") || "");
  const [estrelas, setEstrelas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [confirmado, setConfirmado] = useState(false);
  const [tituloSucesso, setTituloSucesso] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function carregar() {
    if (!pedidoId) return;
    api
      .buscarPedido(pedidoId, sessao?.id)
      .then((p) => {
        setPedido(p);
        // em OFERTA o dono vê os interessados aceitos para escolher de quem confirmar/avaliar
        if (p.tipoPublicacao === "OFERTA" && sessao?.id === p.idSolicitante)
          api
            .listarCandidaturasPedido(p.id, sessao.id)
            .then((lista) => {
              const somenteAceitas = lista.filter((c) => c.status === "ACEITA");
              setAceitas(somenteAceitas);
              // começa por quem ainda aguarda confirmação de pagamento
              const primeira = somenteAceitas.find((c) => c.statusPagamento === "PENDENTE") || somenteAceitas[0];
              setIdCandidatura((atual) => atual || primeira?.id || "");
            })
            .catch(() => undefined);
      })
      .catch((e) => setErro(e instanceof Error ? e.message : "Não foi possível carregar o pedido."));
  }

  useEffect(() => {
    document.title = "Confirmar recebimento - Junttô";
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoId]);

  const ehOferta = pedido?.tipoPublicacao === "OFERTA";
  const selecionada = aceitas.find((c) => c.id === idCandidatura) || null;
  const concluido = pedido?.status === "CONCLUIDO";
  const statusPagamento = ehOferta ? selecionada?.statusPagamento : pedido?.statusPagamento;
  // pagamento PENDENTE: em AJUDA só depois de concluir; em OFERTA a qualquer momento
  const podeConfirmarPagamento = statusPagamento === "PENDENTE" && (ehOferta || concluido);
  const podeConfirmarRecompensa =
    !ehOferta && concluido && !!pedido?.naoIncluirPagamento && !!pedido?.recompensa && !pedido?.dtRecompensa;
  const aguardandoConfirmacao = podeConfirmarPagamento || podeConfirmarRecompensa;
  const nomeAjudado = pedido ? (ehOferta ? selecionada?.nomePrestador || "" : pedido.nomeSolicitante) : "";

  async function confirmarRecebimento() {
    if (!pedidoId || !sessao) {
      setErro("O pedido não foi informado. Abra esta tela com ?pedidoId=ID.");
      return;
    }
    if (ehOferta && !idCandidatura) {
      setErro("Escolha o interessado.");
      return;
    }
    if (!aguardandoConfirmacao && estrelas === 0) {
      setErro("Escolha uma nota de 1 a 5 estrelas para avaliar.");
      return;
    }
    if (estrelas > 0 && !concluido) {
      setErro("A avaliação fica disponível depois que o pedido é concluído.");
      return;
    }
    setErro("");
    setCarregando(true);
    try {
      const extra = ehOferta ? { idCandidatura } : {};
      if (aguardandoConfirmacao) await api.confirmarPagamento(pedidoId, { usuarioId: sessao.id, ...extra });
      if (estrelas > 0)
        await api.avaliar(pedidoId, { usuarioId: sessao.id, estrelas, texto: comentario.trim() || undefined, ...extra });
      setTituloSucesso(aguardandoConfirmacao ? "Recebimento confirmado!" : "Avaliação enviada!");
      setConfirmado(true);
      carregar();
    } catch (erroApi) {
      setErro(erroApi instanceof Error ? erroApi.message : "Não foi possível confirmar o recebimento.");
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
                  {aguardandoConfirmacao ? "Confirmar pagamento e avaliar" : "Avaliar quem recebeu a ajuda"}
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  {aguardandoConfirmacao
                    ? "Confirme o pagamento recebido e avalie quem recebeu a ajuda"
                    : "Conte como foi ajudar nesta tarefa"}
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
              {ehOferta && (
                <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--azul)]">
                  Interessado aceito
                  <select
                    value={idCandidatura}
                    onChange={(e) => setIdCandidatura(e.target.value)}
                    className="rounded-xl border border-gray-300 bg-white p-3 font-normal"
                  >
                    {aceitas.length === 0 && <option value="">Nenhum interessado aceito</option>}
                    {aceitas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nomePrestador} · {NOMES_STATUS_PAGAMENTO[c.statusPagamento] || c.statusPagamento}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {pedido && (
                <ResumoRecebimento
                  nomeSolicitante={nomeAjudado || "Não informado"}
                  idSolicitante={ehOferta ? selecionada?.idPrestador : pedido.idAjudado}
                  nomePrestador={sessao ? `${sessao.nome} ${sessao.sobrenome}` : ""}
                  idPrestador={pedido.idAjudante}
                  valorRecebido={pedido.naoIncluirPagamento ? null : ehOferta ? pedido.valor : (pedido.total ?? pedido.valor)}
                />
              )}

              <CampoFeedback
                estrelas={estrelas}
                aoAlterarEstrelas={setEstrelas}
                comentario={comentario}
                aoAlterar={setComentario}
                pessoaAvaliada={nomeAjudado || "quem recebeu a ajuda"}
              />

              {erro && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {erro}
                </p>
              )}

              <button
                type="button"
                onClick={confirmarRecebimento}
                disabled={carregando || !pedido}
                className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-[var(--verde)] px-6 py-4 text-lg font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-95 hover:shadow-lg active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--azul)]"
              >
                <FaCheckCircle className="text-xl" />
                {carregando
                  ? "Registrando..."
                  : aguardandoConfirmacao
                    ? podeConfirmarRecompensa
                      ? "Confirmar recompensa recebida"
                      : "Confirmar pagamento recebido"
                    : "Enviar avaliação"}
              </button>
            </div>
          </>
        ) : (
          <section className="py-8 text-center sm:py-12">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[var(--verde)]/10">
              <FaCheckCircle className="text-5xl text-[var(--verde)]" />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-[var(--azul)] sm:text-3xl">
              {tituloSucesso}
            </h1>

            <p className="mx-auto mt-4 max-w-md leading-relaxed text-gray-600">
              Tudo registrado. Obrigado por fazer parte do Junttô!
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {ehOferta && aceitas.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmado(false);
                    setEstrelas(0);
                    setComentario("");
                    setIdCandidatura("");
                    carregar();
                  }}
                  className="flex min-h-14 flex-1 items-center justify-center gap-3 rounded-xl border border-[var(--verde)] px-5 py-4 font-bold text-[var(--verde)] transition hover:bg-[var(--verde)]/10"
                >
                  Outros interessados
                </button>
              )}
              <Link
                to="/home-prototipo"
                className="flex min-h-14 flex-1 items-center justify-center gap-3 rounded-xl bg-[var(--verde)] px-5 py-4 font-bold text-white transition hover:brightness-95"
              >
                <FaHome className="text-lg" />
                Voltar para o início
              </Link>

              {API_PYTHON_DISPONIVEL && (
              <Link
                to="/denuncia"
                className="flex min-h-14 flex-1 items-center justify-center gap-3 rounded-xl border border-[var(--coral)] bg-[var(--coral)]/10 px-5 py-4 font-bold text-[var(--coral)] transition hover:bg-[var(--coral)]/20"
              >
                <FaExclamationTriangle className="text-lg" />
                Denunciar
              </Link>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
