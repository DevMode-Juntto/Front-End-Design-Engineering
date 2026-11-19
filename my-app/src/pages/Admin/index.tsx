import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  FaArrowLeft,
  FaBoxOpen,
  FaPlus,
  FaTags,
  FaTrash,
  FaUsers,
} from "react-icons/fa";
import { api, obterSessao } from "../../services/api";
import type { Categoria, Pedido, Usuario } from "../../types/types";

type Aba = "usuarios" | "categorias" | "pedidos";

const abas: { id: Aba; titulo: string; descricao: string }[] = [
  {
    id: "usuarios",
    titulo: "Usuários",
    descricao: "Consulte as contas cadastradas.",
  },
  {
    id: "categorias",
    titulo: "Categorias",
    descricao: "Cadastre e organize categorias.",
  },
  {
    id: "pedidos",
    titulo: "Pedidos",
    descricao: "Consulte os pedidos publicados.",
  },
];

// controla as áreas compatíveis com a API hospedada
export default function Admin() {
  const [aba, setAba] = useState<Aba>("usuarios");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const sessao = obterSessao();
  const usuarioAdministrador = sessao?.id || 1;

  // busca só os dados que existem no backend
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
    } catch (erroApi) {
      setMensagem(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível carregar os dados.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void carregar(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  // cria uma categoria usando o CRUD real
  async function criarCategoria() {
    const nome = window.prompt("Nome da nova categoria:");
    if (!nome?.trim()) return;
    const descricao = window.prompt("Descrição da categoria:") || "";
    try {
      await api.criarCategoria({
        nome: nome.trim(),
        descricao: descricao.trim(),
      });
      setMensagem("Categoria criada com sucesso.");
      await carregar();
    } catch (erroApi) {
      setMensagem(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível criar a categoria.",
      );
    }
  }

  // edita uma categoria existente
  async function editarCategoria(categoria: Categoria) {
    const nome = window.prompt("Nome da categoria:", categoria.nome);
    if (!nome?.trim()) return;
    const descricao =
      window.prompt("Descrição da categoria:", categoria.descricao || "") || "";
    try {
      await api.atualizarCategoria(categoria.id, {
        nome: nome.trim(),
        descricao: descricao.trim(),
      });
      setMensagem("Categoria atualizada com sucesso.");
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
      await api.excluirCategoria(categoria.id, usuarioAdministrador);
      setMensagem("Categoria excluída com sucesso.");
      await carregar();
    } catch (erroApi) {
      setMensagem(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível excluir a categoria.",
      );
    }
  }

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
                Consulte e gerencie os dados disponíveis na API.
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

        <nav className="mb-6 grid gap-3 sm:grid-cols-3">
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
                      A API não possui ações administrativas de status ou
                      desativação.
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {usuarios.map((usuario) => (
                    <article
                      key={usuario.id}
                      className="rounded-2xl border border-gray-200 p-4"
                    >
                      <h3 className="font-bold text-[var(--azul)]">
                        {usuario.nome}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        ID {usuario.id} ·{" "}
                        {usuario.email || "E-mail não informado"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {usuario.bairro || "Bairro não informado"}
                      </p>
                    </article>
                  ))}
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
                        <p className="mt-1 text-sm text-gray-500">
                          {categoria.descricao || "Sem descrição"}
                        </p>
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
                      Pedidos publicados
                    </h2>
                    <p className="text-sm text-gray-500">
                      A API não possui remoção administrativa de pedidos, então
                      esta área é somente consulta.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {pedidos.length ? (
                    pedidos.map((pedido) => (
                      <article
                        key={pedido.id}
                        className="rounded-2xl border border-gray-200 p-4"
                      >
                        <h3 className="font-bold text-[var(--azul)]">
                          {pedido.titulo}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {pedido.descricao}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          ID {pedido.id} ·{" "}
                          {pedido.bairro || "Bairro não informado"} ·{" "}
                          {pedido.status || "Sem status"}
                        </p>
                      </article>
                    ))
                  ) : (
                    <p className="rounded-xl bg-[var(--creme)] p-4 text-sm text-gray-500">
                      Nenhum pedido encontrado.
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
