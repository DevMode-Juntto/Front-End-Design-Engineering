import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { FaComments, FaTimes, FaUserCircle } from "react-icons/fa";
import { PiChatCircleDots } from "react-icons/pi";
import { api, obterSessao } from "../../services/api";
import type { Notificacao, Pedido } from "../../types/types";

type NotificacaoComPedido = Notificacao & { pedido?: Pedido };

const TAMANHO_BOTAO = 55;
const MARGEM = 20;
const ALTURA_PAINEL = 520;

type Mensagem = {
  id: number;
  autor: "usuario" | "outro";
  texto: string;
};

// a conversa abre quando o candidato é escolhido (ou chega um lembrete da outra pessoa)
function ehSolicitacaoChat(notificacao: Notificacao) {
  return notificacao.tipo === "CANDIDATURA_ACEITA" || notificacao.tipo === "LEMBRETE";
}

function textoDaNovaConversa(notificacao: NotificacaoComPedido) {
  if (notificacao.tipo === "LEMBRETE") return notificacao.mensagem;
  const nome = notificacao.pedido?.nomeSolicitante || "Quem publicou";
  const nomePedido = notificacao.pedido?.titulo || `Pedido #${notificacao.idPedido}`;
  return `${nome} escolheu você para a ajuda “${nomePedido}”. Uma nova conversa foi aberta para combinarem os detalhes.`;
}

export default function Chat() {
  const [aberto, setAberto] = useState(false);
  const [lado, setLado] = useState<"esquerda" | "direita">("direita");
  const [solicitacoesPendentes, setSolicitacoesPendentes] = useState(0);
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: 1,
      autor: "outro",
      texto:
        "Oiie! Que bom que você se interessou pela minha oportunidade. Como posso te ajudar?",
    },
  ]);

  useEffect(() => {
    async function carregarSolicitacoes() {
      const sessao = obterSessao();
      if (!sessao?.id) return;
      try {
        const notificacoes = await api.listarNotificacoes(sessao.id);
        setSolicitacoesPendentes(
          notificacoes.filter(
            (notificacao) =>
              !notificacao.lida && ehSolicitacaoChat(notificacao),
          ).length,
        );
      } catch {
        setSolicitacoesPendentes(0);
      }
    }
    void carregarSolicitacoes();
  }, []);

  const [posicao, setPosicao] = useState(() => ({
    x: Math.max(MARGEM, window.innerWidth - TAMANHO_BOTAO - MARGEM),
    y: Math.max(MARGEM, window.innerHeight - 100),
  }));

  const arrastando = useRef(false);
  const moveu = useRef(false);
  const inicio = useRef({ x: 0, y: 0 });

  const perguntas = [
    {
      pergunta: "Ainda está disponível?",
      resposta: "Sim! Ainda estou precisando de ajuda.",
    },
    {
      pergunta: "Qual é o endereço?",
      resposta:
        "Será na FIAP Paulista, Av. Paulista, 1106 – 7º andar, Bela Vista, São Paulo – SP.",
    },
    {
      pergunta: "Qual horário seria melhor?",
      resposta: "Podemos combinar um horário pela manhã. O que acha?",
    },
    {
      pergunta: "Preciso levar alguma coisa?",
      resposta: "Não precisa levar nada. Apenas venha no horário combinado!",
    },
  ];

  function adicionarMensagem(autor: "usuario" | "outro", texto: string) {
    setMensagens((atuais) => [
      ...atuais,
      {
        id: Date.now() + Math.random(),
        autor,
        texto,
      },
    ]);
  }

  function usarPergunta(pergunta: string, resposta: string) {
    adicionarMensagem("usuario", pergunta);
    adicionarMensagem("outro", resposta);
  }

  // inicia o movimento do botão
  function iniciarMovimento(evento: PointerEvent<HTMLButtonElement>) {
    arrastando.current = true;
    moveu.current = false;

    inicio.current = {
      x: evento.clientX,
      y: evento.clientY,
    };

    evento.currentTarget.setPointerCapture(evento.pointerId);
  }

  // acompanha o movimento do botão
  function mover(evento: PointerEvent<HTMLButtonElement>) {
    if (!arrastando.current) return;

    if (
      Math.abs(evento.clientX - inicio.current.x) > 4 ||
      Math.abs(evento.clientY - inicio.current.y) > 4
    ) {
      moveu.current = true;
    }

    setPosicao({
      x: Math.min(
        Math.max(0, evento.clientX - TAMANHO_BOTAO / 2),
        window.innerWidth - TAMANHO_BOTAO,
      ),
      y: Math.min(
        Math.max(0, evento.clientY - TAMANHO_BOTAO / 2),
        window.innerHeight - TAMANHO_BOTAO,
      ),
    });
  }

  // posiciona o botão no canto mais próximo
  function finalizarMovimento(evento: PointerEvent<HTMLButtonElement>) {
    if (!arrastando.current) return;

    arrastando.current = false;

    evento.currentTarget.releasePointerCapture(evento.pointerId);

    const vaiParaEsquerda = evento.clientX < window.innerWidth / 2;

    setLado(vaiParaEsquerda ? "esquerda" : "direita");

    setPosicao((atual) => ({
      ...atual,
      x: vaiParaEsquerda ? MARGEM : window.innerWidth - TAMANHO_BOTAO - MARGEM,
    }));
  }

  async function abrirOuFechar() {
    if (!moveu.current) {
      if (!aberto) {
        const sessao = obterSessao();
        if (sessao?.id) {
          try {
            const notificacoes = await api.listarNotificacoes(sessao.id);
            const novasConversas = notificacoes.filter(
              (notificacao) =>
                !notificacao.lida && ehSolicitacaoChat(notificacao),
            );
            if (novasConversas.length) {
              const conversasComPedido = await Promise.all(
                novasConversas.map(async (notificacao): Promise<NotificacaoComPedido> => {
                  const pedidoId = notificacao.idPedido;
                  if (!pedidoId) return notificacao;
                  try {
                    return {
                      ...notificacao,
                      pedido: await api.buscarPedido(pedidoId),
                    };
                  } catch {
                    return notificacao;
                  }
                }),
              );
              setMensagens((atuais) => [
                ...atuais,
                ...conversasComPedido.map((notificacao) => ({
                  id: Date.now() + Math.random(),
                  autor: "outro" as const,
                  texto: textoDaNovaConversa(notificacao),
                })),
              ]);
            }
            await Promise.all(
              novasConversas.map((notificacao) =>
                api.marcarNotificacaoLida(notificacao.id, notificacao.idUsuario),
              ),
            );
            window.dispatchEvent(
              new CustomEvent("junttô:notificacoes-atualizadas"),
            );
          } catch {
            // O chat continua funcionando mesmo se a atualização da notificação falhar.
          }
        }
        setSolicitacoesPendentes(0);
      }
      setAberto((atual) => !atual);
    }

    moveu.current = false;
  }

  const painelNaEsquerda = lado === "esquerda";

  const topoPainel = aberto
    ? Math.max(
        MARGEM,
        Math.min(posicao.y, window.innerHeight - ALTURA_PAINEL - MARGEM),
      )
    : posicao.y;

  return (
    <aside
      className={`fixed z-50 ${
        aberto && !painelNaEsquerda ? "-translate-x-[265px]" : ""
      }`}
      style={{
        left: `${posicao.x}px`,
        top: `${topoPainel}px`,
        transition: arrastando.current
          ? "none"
          : "left 320ms ease-out, top 320ms ease-out",
      }}
    >
      {!aberto && (
        <button
          type="button"
          onPointerDown={iniciarMovimento}
          onPointerMove={mover}
          onPointerUp={finalizarMovimento}
          onPointerCancel={finalizarMovimento}
          onClick={() => void abrirOuFechar()}
          aria-label="Abrir ou mover chat"
          className="relative flex h-[55px] w-[55px] cursor-grab touch-none items-center justify-center rounded-full bg-[var(--verde)] text-2xl text-white shadow-lg transition hover:scale-105 active:cursor-grabbing"
        >
          <FaComments />
          {solicitacoesPendentes > 0 && (
            <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-[var(--coral)] text-xs font-bold text-white">
              +{solicitacoesPendentes}
            </span>
          )}
        </button>
      )}

      {aberto && (
        <div className="flex h-[min(520px,calc(100vh-40px))] w-[min(340px,calc(100vw-40px))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <header className="flex shrink-0 items-center justify-between bg-[var(--azul)] p-4 text-white">
            <div className="flex items-center gap-3">
              <FaUserCircle className="text-3xl" />

              <div>
                <h2 className="flex items-center gap-2 font-bold">
                  <PiChatCircleDots />
                  Conversa
                </h2>

                <p className="text-xs text-white/80">
                  Oportunidade de ajuda
                  {solicitacoesPendentes > 0
                    ? ` · +${solicitacoesPendentes} nova`
                    : ""}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAberto(false)}
              aria-label="Fechar chat"
              className="rounded-lg p-2 text-xl transition hover:bg-white/10"
            >
              <FaTimes />
            </button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto bg-[var(--creme)] p-4">
            {mensagens.map((mensagem) => (
              <div
                key={mensagem.id}
                className={`flex ${
                  mensagem.autor === "usuario" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    mensagem.autor === "usuario"
                      ? "rounded-br-sm bg-[var(--azul)] text-white"
                      : "rounded-bl-sm bg-white text-[var(--azul)] shadow-sm"
                  }`}
                >
                  {mensagem.texto}
                </div>
              </div>
            ))}
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-white p-4">
            <p className="mb-3 text-sm font-bold text-[var(--azul)]">
              Perguntas rápidas
            </p>

            <div className="flex flex-wrap gap-2">
              {perguntas.map((item) => (
                <button
                  key={item.pergunta}
                  type="button"
                  onClick={() => usarPergunta(item.pergunta, item.resposta)}
                  className="rounded-full border border-[var(--verde)] px-3 py-2 text-left text-xs font-medium text-[var(--azul)] transition hover:bg-[var(--verde)] hover:text-white"
                >
                  {item.pergunta}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
