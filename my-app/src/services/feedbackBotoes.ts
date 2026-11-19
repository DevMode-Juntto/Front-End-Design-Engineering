// Feedback visual nos botões: mostra no próprio botão que a ação foi executada.
// - Ao tocar: o botão "afunda" e escurece um pouco (todos os botões).
// - Se o clique dispara uma chamada à API: o botão pulsa enquanto espera,
//   depois fica verde com ✓ (deu certo) ou vermelho com ✕ (deu erro) por alguns instantes.
// Funciona sozinho: basta chamar instalarFeedbackBotoes() uma vez (main.tsx).

type Estado = "clicado" | "carregando" | "ok" | "erro";

const pendentes = new WeakMap<HTMLButtonElement, { total: number; falhou: boolean }>();
const timers = new WeakMap<HTMLButtonElement, number>();
let botaoDoClique: HTMLButtonElement | null = null;

function marcar(botao: HTMLButtonElement, estado: Estado | null, duracao?: number) {
  window.clearTimeout(timers.get(botao));
  if (estado) botao.dataset.acao = estado;
  else delete botao.dataset.acao;
  if (estado === "carregando") botao.setAttribute("aria-busy", "true");
  else botao.removeAttribute("aria-busy");
  if (duracao) timers.set(botao, window.setTimeout(() => marcar(botao, null), duracao));
}

export function instalarFeedbackBotoes() {
  document.addEventListener(
    "click",
    (evento) => {
      const botao = (evento.target as HTMLElement | null)?.closest("button");
      if (!botao || botao.disabled) return;
      if (botao.dataset.acao !== "carregando") marcar(botao, "clicado", 300);
      // as requisições disparadas por este clique (no mesmo ciclo) ficam ligadas a este botão
      botaoDoClique = botao;
      window.setTimeout(() => {
        if (botaoDoClique === botao) botaoDoClique = null;
      }, 0);
    },
    true,
  );
}

// Chamado pelo cliente HTTP no início de cada requisição. Devolve a função de término.
export function iniciarAcao(): (sucesso: boolean) => void {
  const botao = botaoDoClique;
  if (!botao) return () => undefined;
  const info = pendentes.get(botao) || { total: 0, falhou: false };
  info.total += 1;
  pendentes.set(botao, info);
  marcar(botao, "carregando");
  return (sucesso) => {
    info.total -= 1;
    if (!sucesso) info.falhou = true;
    if (info.total > 0) return;
    pendentes.delete(botao);
    if (botao.isConnected) marcar(botao, info.falhou ? "erro" : "ok", 1600);
  };
}
