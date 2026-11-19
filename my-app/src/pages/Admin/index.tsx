import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  FaArrowLeft,
  FaBell,
  FaBoxOpen,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlus,
  FaTags,
  FaTrash,
  FaTimes,
  FaUsers,
} from "react-icons/fa";
import { api, nomeCompleto, NOMES_STATUS, obterSessao } from "../../services/api";
import { API_PYTHON_DISPONIVEL, AVISO_API_PYTHON, apiPython } from "../../services/apiPython";
import type { Categoria, Denuncia, Pedido, Usuario } from "../../types/types";

// Painel de administração: usuários, categorias e pedidos vêm da API Java;
// status de usuário, remoção de pedidos, avisos e denúncias ficam na API Python.
type UsuarioAdmin = Usuario & { status?: string };

type Aba = "usuarios" | "categorias" | "pedidos" | "denuncias" | "avisos";

// Enquanto a API Python não está publicada, ativar/desativar usuário é uma simulação:
// o status fica salvo só neste navegador (localStorage) e nada é enviado para a API Java.
const CHAVE_INATIVOS_DEMO = "junttô_admin_inativos_demo";

function lerInativosDemo(): string[] {
  try {
    const salvo = localStorage.getItem(CHAVE_INATIVOS_DEMO);
    return salvo ? (JSON.parse(salvo) as string[]) : [];
  } catch {
    return [];
  }
}

function salvarInativosDemo(ids: string[]) {
  try {
    localStorage.setItem(CHAVE_INATIVOS_DEMO, JSON.stringify(ids));
  } catch {
    // sem localStorage (aba anônima restrita): a simulação vale só até recarregar a página
  }
}

type Confirmacao = { usuario: UsuarioAdmin; acao: "desativar" | "reativar" };
type Aviso = { texto: string; usuario: UsuarioAdmin; desativado: boolean };

const todasAbas: { id: Aba; titulo: string; descricao: string; python?: boolean }[] = [
  {
    id: "usuarios",
    titulo: "Usuários",
    descricao: "Gerencie contas e status de acesso.",
  },
  {
    id: "categorias",
    titulo: "Categorias",
    descricao: "Cadastre categorias de ajuda.",
  },
  { id: "pedidos", titulo: "Pedidos", descricao: "Acompanhe pedidos abertos." },
  {
    id: "denuncias",
    titulo: "Denúncias",
    descricao: "Analise e atualize denúncias.",
    python: true,
  },
  {
    id: "avisos",
    titulo: "Avisos",
    descricao: "Envie uma notificação para um usuário.",
    python: true,
  },
];

// abas que dependem da API Python só aparecem quando ela está configurada
const abas = todasAbas.filter((item) => !item.python || API_PYTHON_DISPONIVEL);

// traduz o status da denúncia p ficar mais claro
function nomeStatusDenuncia(status?: string) {
  const nomes: Record<string, string> = {
    PENDENTE: "Pendente",
    ABERTA: "Pendente",
    EM_ANALISE: "Em análise",
    RESOLVIDA: "Resolvida",
  };
  return nomes[String(status || "PENDENTE").toUpperCase()] || "Pendente";
}

// controla as áreas e ações do painel admin
export default function Admin() {
  const [aba, setAba] = useState<Aba>("usuarios");
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [denunciaSelecionada, setDenunciaSelecionada] =
    useState<Denuncia | null>(null);
  const [filtroDenuncia, setFiltroDenuncia] = useState("TODAS");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const sessao = obterSessao();
  const usuarioAdministrador = sessao?.id || "1";
  const [destinatarioAviso, setDestinatarioAviso] = useState("");
  const [mensagemAviso, setMensagemAviso] = useState("");
  const [inativosDemo, setInativosDemo] = useState<string[]>(lerInativosDemo);
  const [confirmacao, setConfirmacao] = useState<Confirmacao | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const timerAviso = useRef<number | undefined>(undefined);

  // status exibido: o da API Python quando ela existe; senão, o da simulação local
  function usuarioAtivo(usuario: UsuarioAdmin) {
    if (inativosDemo.includes(usuario.id)) return false;
    return String(usuario.status || "ATIVO").toUpperCase() === "ATIVO";
  }

  function mostrarAviso(novo: Aviso) {
    window.clearTimeout(timerAviso.current);
    setAviso(novo);
    timerAviso.current = window.setTimeout(() => setAviso(null), 6000);
  }

  useEffect(() => () => window.clearTimeout(timerAviso.current), []);

  // fecha a confirmação com Esc
  useEffect(() => {
    if (!confirmacao) return;
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setConfirmacao(null);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [confirmacao]);

  // busca os dados usados no painel
  async function carregar() {
    setCarregando(true);
    setMensagem("");
    try {
      const [listaUsuarios, listaCategorias, listaPedidos] = await Promise.all([
        api.listarUsuarios(),
        api.listarCategorias(),
        api.listarPedidos(),
      ]);
      setUsuarios(listaUsuarios);
      setCategorias(listaCategorias);
      setPedidos(listaPedidos);
      // denúncias vêm da API Python: se ela estiver fora do ar, o resto do painel continua funcionando
      if (API_PYTHON_DISPONIVEL) try {
        setDenuncias(await apiPython.listarDenuncias(usuarioAdministrador));
      } catch {
        setDenuncias([]);
        setMensagem("Denúncias indisponíveis: a API Python não respondeu.");
      }
    } catch (erroApi) {
      setMensagem(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível carregar os dados administrativos.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  // abre a pergunta "deseja realmente...?" antes de mudar o status
  function pedirConfirmacao(usuario: UsuarioAdmin) {
    setConfirmacao({ usuario, acao: usuarioAtivo(usuario) ? "desativar" : "reativar" });
  }

  // ativa ou desativa um usuário (API Python quando publicada; simulação local até lá)
  async function alterarStatusUsuario(usuario: UsuarioAdmin, desativar: boolean) {
    setConfirmacao(null);
    const nome = nomeCompleto(usuario);
    try {
      let simular = !API_PYTHON_DISPONIVEL;
      if (!simular) {
        try {
          if (desativar) await apiPython.desativarUsuario(usuario.id);
          else await apiPython.alterarStatusUsuario(usuario.id, { status: "ATIVO" });
          await carregar();
        } catch (erroPython) {
          // API Python configurada mas fora do ar: segue com a simulação para a demonstração não travar
          if (!(erroPython instanceof Error) || !erroPython.message.startsWith("Não foi possível conectar")) throw erroPython;
          simular = true;
        }
      }
      if (simular) {
        const ids = desativar
          ? [...new Set([...inativosDemo, usuario.id])]
          : inativosDemo.filter((id) => id !== usuario.id);
        setInativosDemo(ids);
        salvarInativosDemo(ids);
      }
      mostrarAviso({
        texto: desativar ? `${nome} foi desativado(a).` : `${nome} foi reativado(a).`,
        usuario,
        desativado: desativar,
      });
    } catch (erroApi) {
      setMensagem(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível alterar o status do usuário.",
      );
    }
  }

  // envia um aviso para os usuários
  async function enviarAviso() {
    if (!destinatarioAviso || !mensagemAviso.trim()) {
      setMensagem("Selecione um destinatário e escreva a mensagem do aviso.");
      return;
    }
    try {
      await apiPython.enviarAviso({
        usuarioId: usuarioAdministrador,
        idDestinatario: destinatarioAviso,
        mensagem: mensagemAviso.trim(),
      });
      setMensagemAviso("");
      setDestinatarioAviso("");
      setMensagem("Aviso enviado com sucesso.");
    } catch (erroApi) {
      setMensagem(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível enviar o aviso.",
      );
    }
  }

  // cria uma nova categoria
  async function criarCategoria() {
    const nome = window.prompt("Nome da nova categoria:");
    if (!nome?.trim()) return;
    try {
      await api.criarCategoria({ nome: nome.trim() });
      await carregar();
    } catch (erroApi) {
      setMensagem(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível criar a categoria.",
      );
    }
  }

  // edita o nome de uma categoria
  async function editarCategoria(categoria: Categoria) {
    const nome = window.prompt("Nome da categoria:", categoria.nome);
    if (!nome?.trim()) return;
    try {
      await api.atualizarCategoria(categoria.id, { nome: nome.trim() });
      await carregar();
    } catch (erroApi) {
      setMensagem(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível editar a categoria.",
      );
    }
  }

  // exclui uma categoria depois da confirmação
  async function excluirCategoria(categoria: Categoria) {
    if (!window.confirm(`Excluir a categoria “${categoria.nome}”?`)) return;
    try {
      await api.excluirCategoria(categoria.id);
      await carregar();
    } catch (erroApi) {
      setMensagem(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível excluir a categoria.",
      );
    }
  }

  // remove um pedido pelo painel admin
  async function removerPedido(pedido: Pedido) {
    if (!window.confirm(`Remover o pedido “${pedido.titulo}”?`)) return;
    try {
      await apiPython.removerPedido(pedido.id);
      await carregar();
    } catch (erroApi) {
      setMensagem(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível remover o pedido.",
      );
    }
  }

  // abre os detalhes de uma denúncia
  async function verDenuncia(id: string) {
    try {
      setDenunciaSelecionada(await apiPython.buscarDenuncia(id, usuarioAdministrador));
    } catch (erroApi) {
      setMensagem(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível abrir a denúncia.",
      );
    }
  }

  // muda o status de uma denúncia
  async function atualizarDenuncia(denuncia: Denuncia, status: string) {
    if (
      !window.confirm(
        `Alterar a denúncia #${denuncia.id} para “${nomeStatusDenuncia(status)}”?`,
      )
    )
      return;
    try {
      await apiPython.atualizarStatusDenuncia(denuncia.id, {
        status: status.toUpperCase(),
      });
      await carregar();
    } catch (erroApi) {
      setMensagem(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível atualizar a denúncia.",
      );
    }
  }

  const denunciasFiltradas = denuncias.filter((denuncia) => {
    if (filtroDenuncia === "TODAS") return true;
    const status = String(denuncia.status || "PENDENTE").toUpperCase();
    return (
      status === filtroDenuncia ||
      (filtroDenuncia === "PENDENTE" && status === "ABERTA")
    );
  });

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/home"
              aria-label="Voltar para a página inicial"
              className="flex size-11 items-center justify-center rounded-full bg-white text-xl text-[var(--azul)] shadow-sm"
            >
              <FaArrowLeft />
            </Link>
            <div>
              <p className="text-sm font-semibold text-[var(--coral)]">
                Área restrita
              </p>
              <h1 className="text-3xl font-bold text-[var(--azul)] sm:text-4xl">
                Painel administrador
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Controle usuários, categorias, pedidos e denúncias em um só
                lugar.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void carregar()}
            className="rounded-xl bg-[var(--azul)] px-4 py-2 text-sm font-bold text-white"
          >
            Atualizar dados
          </button>
        </header>

        {mensagem && (
          <p
            role="status"
            className="mb-5 rounded-xl border border-[var(--coral)]/20 bg-red-50 p-4 text-sm text-[var(--coral)]"
          >
            {mensagem}
          </p>
        )}

        {!API_PYTHON_DISPONIVEL && (
          <p className="mb-5 rounded-xl bg-[var(--creme)] p-4 text-sm text-[var(--azul)]">
            {AVISO_API_PYTHON} Por enquanto, o painel mostra os dados da API Java, e ativar ou
            desativar usuários é uma demonstração que fica salva só neste navegador.
          </p>
        )}

        <nav className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {abas.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setAba(item.id)}
              className={`rounded-2xl p-4 text-left shadow-sm transition ${aba === item.id ? "bg-[var(--azul)] text-white" : "bg-white text-[var(--azul)] hover:bg-[var(--cinza)]"}`}
            >
              <span className="font-bold">{item.titulo}</span>
              <span
                className={`mt-1 block text-xs ${aba === item.id ? "text-white/75" : "text-gray-500"}`}
              >
                {item.descricao}
              </span>
            </button>
          ))}
        </nav>

        {carregando ? (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500">
            Carregando dados do painel...
          </div>
        ) : (
          <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-8">
            {aba === "usuarios" && (
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <FaUsers className="text-2xl text-[var(--verde)]" />
                  <div>
                    <h2 className="text-xl font-bold text-[var(--azul)]">
                      Usuários
                    </h2>
                    <p className="text-sm text-gray-500">
                      Ative ou desative o acesso de cada conta.
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {usuarios.map((usuario) => {
                    const ativo = usuarioAtivo(usuario);
                    return (
                      <article
                        key={usuario.id}
                        className={`rounded-2xl border p-4 transition ${ativo ? "border-gray-200" : "border-red-200 bg-red-50/60"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-[var(--azul)]">
                              {nomeCompleto(usuario)}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              ID {usuario.id} ·{" "}
                              {usuario.mediaEstrelas != null
                                ? `${usuario.mediaEstrelas.toFixed(1)} estrelas`
                                : "Sem avaliações"}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${ativo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                          >
                            {ativo ? "ATIVO" : "INATIVO"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => pedirConfirmacao(usuario)}
                          className={`mt-4 rounded-lg border px-3 py-2 text-sm font-bold ${ativo ? "border-[var(--coral)] text-[var(--coral)]" : "border-[var(--verde)] text-[var(--verde)]"}`}
                        >
                          {ativo ? "Desativar usuário" : "Reativar usuário"}
                        </button>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}

            {aba === "categorias" && (
              <div>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <FaTags className="text-2xl text-[var(--laranja)]" />
                    <div>
                      <h2 className="text-xl font-bold text-[var(--azul)]">
                        Categorias
                      </h2>
                      <p className="text-sm text-gray-500">
                        Aparecem no cadastro de pedidos e nos interesses.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void criarCategoria()}
                    className="flex items-center gap-2 rounded-xl bg-[var(--verde)] px-4 py-2 text-sm font-bold text-white"
                  >
                    <FaPlus /> Nova categoria
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {categorias.map((categoria) => (
                    <article
                      key={categoria.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 p-4"
                    >
                      <div>
                        <h3 className="font-bold text-[var(--azul)]">
                          {categoria.nome}
                        </h3>
                        <span className="text-xs text-gray-400">
                          ID {categoria.id}
                        </span>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => void editarCategoria(categoria)}
                          className="rounded-lg border border-[var(--azul)] px-3 py-2 text-xs font-bold text-[var(--azul)]"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void excluirCategoria(categoria)}
                          className="rounded-lg border border-[var(--coral)] p-2 text-[var(--coral)]"
                          aria-label={`Excluir ${categoria.nome}`}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {aba === "pedidos" && (
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <FaBoxOpen className="text-2xl text-[var(--azul)]" />
                  <div>
                    <h2 className="text-xl font-bold text-[var(--azul)]">
                      Pedidos abertos
                    </h2>
                    <p className="text-sm text-gray-500">
                      Remova apenas pedidos que violam as regras.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {pedidos.length ? (
                    pedidos.map((pedido) => (
                      <article
                        key={pedido.id}
                        className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-gray-200 p-4"
                      >
                        <div>
                          <h3 className="font-bold text-[var(--azul)]">
                            {pedido.titulo}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600">
                            {pedido.descricao}
                          </p>
                          <p className="mt-2 text-xs text-gray-500">
                            ID {pedido.id} ·{" "}
                            {pedido.nomeCategoria} ·{" "}
                            {NOMES_STATUS[pedido.status] || pedido.status || "Sem status"}
                          </p>
                        </div>
                        {API_PYTHON_DISPONIVEL && (
                          <button
                            type="button"
                            onClick={() => void removerPedido(pedido)}
                            className="flex items-center gap-2 rounded-lg border border-[var(--coral)] px-3 py-2 text-sm font-bold text-[var(--coral)]"
                          >
                            <FaTrash /> Remover
                          </button>
                        )}
                      </article>
                    ))
                  ) : (
                    <p className="rounded-xl bg-[var(--creme)] p-4 text-sm text-gray-500">
                      Nenhum pedido aberto encontrado.
                    </p>
                  )}
                </div>
              </div>
            )}

            {aba === "denuncias" && (
              <div>
                <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FaExclamationTriangle className="text-2xl text-[var(--coral)]" />
                    <div>
                      <h2 className="text-xl font-bold text-[var(--azul)]">
                        Central de denúncias
                      </h2>
                      <p className="text-sm text-gray-500">
                        Veja o relato, analise o caso e atualize o andamento.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-bold text-[var(--azul)]">
                    Mostrar:
                    <select
                      value={filtroDenuncia}
                      onChange={(event) =>
                        setFiltroDenuncia(event.target.value)
                      }
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 font-normal"
                    >
                      <option value="TODAS">Todas</option>
                      <option value="PENDENTE">Pendentes</option>
                      <option value="EM_ANALISE">Em análise</option>
                      <option value="RESOLVIDA">Resolvidas</option>
                    </select>
                  </label>
                </div>
                <div className="mb-5 grid gap-3 sm:grid-cols-4">
                  {[
                    ["Total", denuncias.length, "TODAS"],
                    [
                      "Pendentes",
                      denuncias.filter((item) =>
                        ["PENDENTE", "ABERTA", undefined].includes(item.status),
                      ).length,
                      "PENDENTE",
                    ],
                    [
                      "Em análise",
                      denuncias.filter((item) => item.status === "EM_ANALISE")
                        .length,
                      "EM_ANALISE",
                    ],
                    [
                      "Resolvidas",
                      denuncias.filter((item) => item.status === "RESOLVIDA")
                        .length,
                      "RESOLVIDA",
                    ],
                  ].map(([titulo, total, filtro]) => (
                    <button
                      key={titulo}
                      type="button"
                      onClick={() => setFiltroDenuncia(String(filtro))}
                      className="rounded-xl border border-gray-200 bg-[var(--creme)] p-3 text-left transition hover:border-[var(--azul)]"
                    >
                      <span className="block text-xs font-semibold text-gray-500">
                        {titulo}
                      </span>
                      <span className="mt-1 block text-2xl font-bold text-[var(--azul)]">
                        {total}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  {denunciasFiltradas.length ? (
                    denunciasFiltradas.map((denuncia) => (
                      <article
                        key={denuncia.id}
                        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-[var(--azul)]">
                              Denúncia #{denuncia.id}
                            </h3>
                            <p className="mt-1 text-sm text-gray-600">
                              Motivo: {denuncia.motivo || "Não informado"}
                            </p>
                            <p className="mt-2 text-xs text-gray-500">
                              Denunciante:{" "}
                              {denuncia.usuarioId || "Não informado"}
                              {denuncia.pedidoId
                                ? ` · Pedido #${denuncia.pedidoId}`
                                : ""}
                            </p>
                          </div>
                          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">
                            {nomeStatusDenuncia(denuncia.status)}
                          </span>
                        </div>
                        <p className="mt-3 rounded-xl bg-[var(--creme)] p-3 text-sm text-gray-600">
                          {denuncia.mensagem ||
                            "O denunciante não adicionou uma descrição."}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void verDenuncia(denuncia.id)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-bold text-[var(--azul)]"
                          >
                            Ver detalhes
                          </button>
                          {String(
                            denuncia.status || "PENDENTE",
                          ).toUpperCase() !== "EM_ANALISE" &&
                            String(
                              denuncia.status || "PENDENTE",
                            ).toUpperCase() !== "RESOLVIDA" && (
                              <button
                                type="button"
                                onClick={() =>
                                  void atualizarDenuncia(denuncia, "EM_ANALISE")
                                }
                                className="rounded-lg bg-[var(--azul)] px-3 py-2 text-sm font-bold text-white"
                              >
                                Iniciar análise
                              </button>
                            )}
                          {String(
                            denuncia.status || "PENDENTE",
                          ).toUpperCase() === "EM_ANALISE" && (
                            <button
                              type="button"
                              onClick={() =>
                                void atualizarDenuncia(denuncia, "RESOLVIDA")
                              }
                              className="rounded-lg bg-[var(--verde)] px-3 py-2 text-sm font-bold text-white"
                            >
                              Marcar como resolvida
                            </button>
                          )}
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="rounded-xl bg-[var(--creme)] p-4 text-sm text-gray-500">
                      Nenhuma denúncia encontrada com este filtro.
                    </p>
                  )}
                </div>
                {denunciaSelecionada && (
                  <div className="mt-5 rounded-2xl bg-[var(--creme)] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold text-[var(--azul)]">
                        Detalhes da denúncia #{denunciaSelecionada.id}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setDenunciaSelecionada(null)}
                        className="text-sm font-bold text-[var(--coral)]"
                      >
                        Fechar
                      </button>
                    </div>
                    <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-xs text-gray-600">
                      {JSON.stringify(denunciaSelecionada, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
            {aba === "avisos" && (
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <FaBell className="text-2xl text-[var(--laranja)]" />
                  <div>
                    <h2 className="text-xl font-bold text-[var(--azul)]">
                      Enviar aviso
                    </h2>
                    <p className="text-sm text-gray-500">
                      Envie uma notificação manual para um usuário.
                    </p>
                  </div>
                </div>
                <div className="max-w-xl space-y-4">
                  <label className="flex flex-col gap-2 text-sm font-bold text-[var(--azul)]">
                    Destinatário
                    <select
                      value={destinatarioAviso}
                      onChange={(event) =>
                        setDestinatarioAviso(event.target.value)
                      }
                      className="h-11 rounded-xl border border-gray-300 bg-white px-3 font-normal"
                    >
                      <option value="">Selecione um usuário</option>
                      {usuarios.map((usuario) => (
                        <option key={usuario.id} value={String(usuario.id)}>
                          {usuario.nome} — ID {usuario.id}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-bold text-[var(--azul)]">
                    Mensagem
                    <textarea
                      value={mensagemAviso}
                      onChange={(event) => setMensagemAviso(event.target.value)}
                      rows={5}
                      placeholder="Escreva o aviso para o usuário"
                      className="rounded-xl border border-gray-300 p-3 font-normal"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => void enviarAviso()}
                    className="rounded-xl bg-[var(--verde)] px-5 py-3 font-bold text-white"
                  >
                    Enviar aviso
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
      {confirmacao && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setConfirmacao(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-confirmacao"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(evento) => evento.stopPropagation()}
          >
            <h2 id="titulo-confirmacao" className="text-xl font-bold text-[var(--azul)]">
              {confirmacao.acao === "desativar" ? "Desativar usuário?" : "Reativar usuário?"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {confirmacao.acao === "desativar"
                ? `Deseja realmente desativar ${nomeCompleto(confirmacao.usuario)}? A conta fica sem acesso até ser reativada.`
                : `Deseja reativar ${nomeCompleto(confirmacao.usuario)}? A conta volta a ter acesso normalmente.`}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                autoFocus
                onClick={() => setConfirmacao(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700"
              >
                Não
              </button>
              <button
                type="button"
                onClick={() => void alterarStatusUsuario(confirmacao.usuario, confirmacao.acao === "desativar")}
                className={`rounded-lg px-4 py-2 text-sm font-bold text-white ${confirmacao.acao === "desativar" ? "bg-[var(--coral)]" : "bg-[var(--verde)]"}`}
              >
                {confirmacao.acao === "desativar" ? "Sim, desativar" : "Sim, reativar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {aviso && (
        <div
          role="status"
          className="fixed bottom-5 left-5 z-50 flex max-w-sm items-start gap-3 rounded-2xl bg-[var(--azul)] p-4 text-white shadow-xl"
        >
          <FaCheckCircle className="mt-0.5 shrink-0 text-xl text-[var(--verde)]" />
          <div className="text-sm">
            <p className="font-bold">{aviso.desativado ? "Usuário desativado" : "Usuário reativado"}</p>
            <p className="mt-0.5 text-white/85">{aviso.texto}</p>
            {aviso.desativado && (
              <button
                type="button"
                onClick={() => void alterarStatusUsuario(aviso.usuario, false)}
                className="mt-2 rounded-lg bg-white px-3 py-1 text-xs font-bold text-[var(--azul)]"
              >
                Reativar
              </button>
            )}
          </div>
          <button
            type="button"
            aria-label="Fechar notificação"
            onClick={() => setAviso(null)}
            className="text-white/70 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>
      )}
    </main>
  );
}
