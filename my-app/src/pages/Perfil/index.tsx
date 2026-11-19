import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  FaArrowLeft,
  FaCommentDots,
  FaEdit,
  FaIdCard,
  FaMapMarkerAlt,
  FaSave,
  FaTrash,
  FaUserCircle,
} from "react-icons/fa";
import CampoPerfil from "../../components/Perfil/Perfil";
import { api, obterSessao } from "../../services/api";
import type { Categoria, Comentario, Usuario } from "../../types/types";

type PerfilProps = { ehDono?: boolean; idUsuario?: string };

// mostra o perfil e as opções do dono da conta
export default function Perfil({ ehDono = true, idUsuario }: PerfilProps) {
  const parametros = useParams();
  const navegar = useNavigate();
  const sessao = obterSessao();
  const id = idUsuario || parametros.id || String(sessao?.id || "");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [minhasCategorias, setMinhasCategorias] = useState<string[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState("");
  const [bairro, setBairro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.buscarUsuario(id, ehDono),
      api.listarTags(id),
      api.listarCategorias(),
    ])
      .then(([dados, tags, listaCategorias]) => {
        setUsuario(dados);
        setNome(dados.nome);
        setBairro(dados.bairro || "");
        setMinhasCategorias(tags);
        setCategorias(listaCategorias);
        // a API hospedada ainda não possui endpoint de comentários
        setComentarios([]);
      })
      .catch(() => setMensagem("Não foi possível carregar este perfil."))
      .finally(() => setCarregando(false));
  }, [id, ehDono]);

  // salva as mudanças feitas no perfil
  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSalvando(true);
    setMensagem("");
    try {
      const atualizado = await api.atualizarUsuario(id, {
        nome: nome.trim(),
        bairro: bairro.trim(),
      });
      const categoriasAtualizadas = await api.salvarTags(id, minhasCategorias);
      setUsuario(atualizado);
      setNome(atualizado.nome);
      setBairro(atualizado.bairro || "");
      setMinhasCategorias(categoriasAtualizadas);
      setEditando(false);
      setMensagem("Perfil atualizado com sucesso.");
    } catch (erroApi) {
      setMensagem(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível atualizar o perfil.",
      );
    } finally {
      setSalvando(false);
    }
  }

  // adiciona uma categoria escolhida pelo usuário
  function adicionarCategoria() {
    const categoria = categorias.find(
      (item) => String(item.id) === categoriaSelecionada,
    );
    if (!categoria || minhasCategorias.includes(categoria.nome)) return;
    setMinhasCategorias((anteriores) => [...anteriores, categoria.nome]);
    setCategoriaSelecionada("");
  }

  // cancela a edição e volta aos dados antigos
  function cancelarEdicao() {
    setNome(usuario?.nome || "");
    setBairro(usuario?.bairro || "");
    setCategoriaSelecionada("");
    setEditando(false);
    void api
      .listarTags(id)
      .then(setMinhasCategorias)
      .catch(() => undefined);
  }

  // exclui a conta depois da confirmação
  async function excluirConta() {
    const confirmou = window.confirm(
      "Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.",
    );
    if (!confirmou) return;
    try {
      await api.excluirUsuario(id);
      sessionStorage.clear();
      navegar("/login", { replace: true });
    } catch (erroApi) {
      setMensagem(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível excluir a conta.",
      );
    }
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-[var(--creme)] px-5 py-10">
        <div className="mx-auto max-w-3xl animate-pulse rounded-3xl bg-white p-8 shadow-md">
          <div className="h-6 w-32 rounded bg-gray-200" />
          <div className="mt-10 flex items-center gap-5">
            <div className="size-24 rounded-full bg-gray-200" />
            <div className="space-y-3">
              <div className="h-6 w-48 rounded bg-gray-200" />
              <div className="h-4 w-32 rounded bg-gray-200" />
            </div>
          </div>
          <div className="mt-10 h-28 rounded-2xl bg-gray-200" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--creme)] px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-5 sm:px-8">
          <Link
            to="/home-prototipo"
            aria-label="Voltar para a HomePrototipo"
            className="flex size-11 items-center justify-center rounded-full bg-[var(--cinza)] text-lg text-[var(--azul)] transition hover:bg-[var(--verde)]/15 hover:text-[var(--verde)]"
          >
            <FaArrowLeft />
          </Link>
          <h1 className="text-xl font-bold text-[var(--azul)] sm:text-2xl">
            Perfil
          </h1>
          {ehDono && !editando ? (
            <button
              type="button"
              onClick={() => {
                setMensagem("");
                setEditando(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-[var(--azul)] px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
            >
              <FaEdit /> Editar
            </button>
          ) : (
            <span className="w-20" />
          )}
        </header>

        <section className="bg-gradient-to-br from-[var(--azul)] to-[#264b70] px-5 py-9 text-white sm:px-10">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            <FaUserCircle className="text-8xl text-white/90" />
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium text-white/70">
                Perfil do usuário
              </p>
              <h2 className="mt-1 text-3xl font-bold">
                {usuario?.nome || "Usuário"}
              </h2>
              <div className="mt-3 flex flex-wrap justify-center gap-2 text-sm text-white/85 sm:justify-start">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                  <FaIdCard /> ID: {usuario?.id || id}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                  <FaMapMarkerAlt /> {usuario?.bairro || "Bairro não informado"}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6 p-5 sm:p-8">
          {mensagem && (
            <div
              role="status"
              className="rounded-xl border border-[var(--verde)]/20 bg-[var(--verde)]/10 px-4 py-3 text-sm font-medium text-[var(--azul)]"
            >
              {mensagem}
            </div>
          )}

          {editando && ehDono && (
            <form
              onSubmit={salvar}
              className="rounded-2xl border border-[var(--verde)]/30 bg-[var(--verde)]/5 p-5 sm:p-6"
            >
              <div className="mb-5">
                <h2 className="text-xl font-bold text-[var(--azul)]">
                  Editar informações
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Atualize seus dados e suas categorias de interesse.
                </p>
              </div>
              <div className="space-y-4">
                <CampoPerfil
                  titulo="Nome completo"
                  placeholder="Digite seu nome"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2 text-sm font-semibold text-[var(--azul)]">
                    <span>ID</span>
                    <div className="flex h-12 items-center rounded-xl border border-gray-200 bg-gray-100 px-4 font-normal text-gray-600">
                      {usuario?.id || id}
                    </div>
                    <span className="text-xs font-normal text-gray-500">
                      O ID é permanente.
                    </span>
                  </div>
                  <CampoPerfil
                    titulo="Bairro"
                    placeholder="Digite seu bairro"
                    value={bairro}
                    onChange={(event) => setBairro(event.target.value)}
                  />
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-[var(--azul)]">
                        Categorias de interesse
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Escolha categorias para receber recomendações.
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--creme)] px-3 py-1 text-xs font-semibold text-[var(--azul)]">
                      {minhasCategorias.length} selecionada
                      {minhasCategorias.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <select
                      value={categoriaSelecionada}
                      onChange={(event) =>
                        setCategoriaSelecionada(event.target.value)
                      }
                      className="h-11 flex-1 rounded-xl border border-gray-300 bg-white px-3 text-sm text-[var(--azul)] outline-none focus:border-[var(--verde)]"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categorias
                        .filter(
                          (categoria) =>
                            !minhasCategorias.includes(categoria.nome),
                        )
                        .map((categoria) => (
                          <option key={categoria.id} value={categoria.id}>
                            {categoria.nome}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={adicionarCategoria}
                      disabled={!categoriaSelecionada}
                      className="rounded-xl bg-[var(--azul)] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Adicionar
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {minhasCategorias.map((categoria) => (
                      <button
                        type="button"
                        key={categoria}
                        onClick={() =>
                          setMinhasCategorias((anteriores) =>
                            anteriores.filter((item) => item !== categoria),
                          )
                        }
                        className="rounded-full bg-[var(--creme)] px-3.5 py-2 text-sm font-semibold text-[var(--azul)] transition hover:bg-red-50 hover:text-[var(--coral)]"
                      >
                        {categoria} <span aria-hidden="true">×</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cancelarEdicao}
                  className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-bold text-[var(--azul)] transition hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando || !nome.trim()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[var(--verde)] px-5 py-3 text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaSave /> {salvando ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </form>
          )}

          {!editando && (
            <section className="rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <h2 className="font-bold text-[var(--azul)]">Categorias</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Interesses visíveis para a comunidade
                  </p>
                </div>
                {ehDono && (
                  <button
                    type="button"
                    onClick={() => setEditando(true)}
                    className="text-sm font-bold text-[var(--verde)] hover:underline"
                  >
                    Alterar
                  </button>
                )}
              </div>
              <div className="p-5">
                {minhasCategorias.length ? (
                  <div className="flex flex-wrap gap-2">
                    {minhasCategorias.map((categoria) => (
                      <span
                        key={categoria}
                        className="rounded-full bg-[var(--creme)] px-4 py-2 text-sm font-semibold text-[var(--azul)]"
                      >
                        {categoria}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Nenhuma categoria selecionada.
                  </p>
                )}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
              <span className="flex size-9 items-center justify-center rounded-full bg-[var(--azul)]/10 text-[var(--azul)]">
                <FaCommentDots />
              </span>
              <div>
                <h2 className="font-bold text-[var(--azul)]">
                  Comentários recebidos
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Experiências compartilhadas por outras pessoas
                </p>
              </div>
            </div>
            <div className="space-y-3 p-5">
              {comentarios.length ? (
                comentarios.map((comentario) => (
                  <article
                    key={comentario.id}
                    className="rounded-xl bg-[var(--cinza)] p-4"
                  >
                    <p className="text-sm leading-relaxed text-[var(--azul)]">
                      “
                      {comentario.texto ||
                        comentario.comentario ||
                        "Comentário sem texto."}
                      ”
                    </p>
                    <p className="mt-2 text-xs font-semibold text-gray-500">
                      {comentario.autor?.nome || "Membro da comunidade"}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  Os comentários serão exibidos quando esse recurso estiver
                  disponível na API hospedada.
                </p>
              )}
            </div>
          </section>

          {ehDono && (
            <div className="border-t border-gray-100 pt-5">
              <button
                type="button"
                onClick={() => void excluirConta()}
                className="flex items-center gap-2 text-sm font-semibold text-[var(--coral)] transition hover:underline"
              >
                <FaTrash /> Excluir minha conta
              </button>
              <p className="mt-1 pl-5 text-xs text-gray-400">
                Essa ação é permanente e não pode ser desfeita.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
