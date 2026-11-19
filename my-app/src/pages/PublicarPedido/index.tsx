import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { ChangeEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  FaArrowLeft,
  FaCamera,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTrash,
} from "react-icons/fa";
import Botao from "../../components/Botao/Botao";
import { api, obterSessao } from "../../services/api";
import type { Categoria, Pedido } from "../../types/types";

// transforma a imagem p poder salvar no pedido
function lerImagem(arquivo: File) {
  return new Promise<string>((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () =>
      typeof leitor.result === "string"
        ? resolve(leitor.result)
        : reject(new Error("Não foi possível ler a imagem."));
    leitor.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    leitor.readAsDataURL(arquivo);
  });
}

// controla a publicação e a edição de pedidos
export default function PublicarPedido() {
  const navigate = useNavigate();
  const [parametros] = useSearchParams();
  const pedidoId = parametros.get("pedidoId");
  const origemHistorico = parametros.get("origem") === "historico";
  const editando = Boolean(pedidoId);
  const [semPagamento, setSemPagamento] = useState(false);
  const [tipoPublicacao, setTipoPublicacao] = useState<"AJUDA" | "OFERTA">(
    "AJUDA",
  );
  const [valor, setValor] = useState("");
  const [titulo, setTitulo] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [bairro, setBairro] = useState("");
  const [data, setData] = useState("");
  const [imagemPreview, setImagemPreview] = useState("");
  const [imagem, setImagem] = useState("");
  const [arquivoImagem, setArquivoImagem] = useState<File | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [descricaoCategoria, setDescricaoCategoria] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    document.title = editando
      ? "Editar pedido - Junttô"
      : "Publicar pedido - Junttô";
    api
      .listarCategorias()
      .then(setCategorias)
      .catch(() => setCategorias([]));
    if (pedidoId) {
      void api
        .buscarPedido(pedidoId)
        .then((pedido) => {
          setTitulo(pedido.titulo);
          setTipoPublicacao(
            pedido.tipoPublicacao === "OFERTA" ? "OFERTA" : "AJUDA",
          );
          setCategoriaId(
            String(
              pedido.categoriaId ||
                (typeof pedido.categoria === "object"
                  ? pedido.categoria.id
                  : ""),
            ),
          );
          setDescricao(pedido.descricao || "");
          setBairro(pedido.bairro || "");
          setData(pedido.data || "");
          setValor(String(pedido.valor || 0));
          setSemPagamento(
            Boolean(
              (pedido as Pedido & { naoIncluirPagamento?: boolean })
                .naoIncluirPagamento,
            ),
          );
          const fotos = pedido.fotos;
          const fotoExistente = Array.isArray(fotos) ? fotos[0] : fotos;
          if (typeof fotoExistente === "string") {
            setImagem(fotoExistente);
            setImagemPreview(fotoExistente);
          }
        })
        .catch(() =>
          setErro("Não foi possível carregar o pedido para edição."),
        );
    }
  }, [editando, pedidoId]);

  useEffect(
    () => () => {
      if (imagemPreview) URL.revokeObjectURL(imagemPreview);
    },
    [imagemPreview],
  );

  // seleciona e mostra a imagem do pedido
  function selecionarImagem(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;
    setArquivoImagem(arquivo);
    setImagemPreview(URL.createObjectURL(arquivo));
    const leitor = new FileReader();
    leitor.onload = () => {
      if (typeof leitor.result === "string") setImagem(leitor.result);
    };
    leitor.readAsDataURL(arquivo);
  }

  // cria ou atualiza o pedido preenchido
  async function publicar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      const imagemAtual =
        imagem || (arquivoImagem ? await lerImagem(arquivoImagem) : "");
      if (pedidoId)
        await api.atualizarPedido(pedidoId, {
          tipoPublicacao,
          titulo,
          categoriaId,
          descricao,
          bairro,
          data,
          valor: Number(valor || 0),
          naoIncluirPagamento: semPagamento,
          ...(imagemAtual
            ? { fotos: [imagemAtual], imagem: imagemAtual, foto: imagemAtual }
            : {}),
        });
      else
        await api.criarPedido({
          tipoPublicacao,
          titulo,
          categoriaId,
          descricao,
          bairro,
          data,
          valor: Number(valor || 0),
          naoIncluirPagamento: semPagamento,
          ...(imagemAtual
            ? { fotos: [imagemAtual], imagem: imagemAtual, foto: imagemAtual }
            : {}),
        });
      navigate("/home-prototipo");
    } catch (erroApi) {
      setErro(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível publicar o pedido.",
      );
    } finally {
      setCarregando(false);
    }
  }

  // exclui o pedido depois de confirmar
  async function excluirPedido() {
    if (
      !pedidoId ||
      !window.confirm("Tem certeza que deseja excluir este pedido?")
    )
      return;
    setErro("");
    setCarregando(true);
    try {
      await api.excluirPedido(pedidoId, obterSessao()?.id || "");
      navigate("/historico");
    } catch (erroApi) {
      setErro(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível excluir o pedido.",
      );
    } finally {
      setCarregando(false);
    }
  }

  // salva a categoria escolhida p esse pedido
  async function selecionarCategoria(id: string) {
    setCategoriaId(id);
    if (!id) {
      setDescricaoCategoria("");
      return;
    }
    try {
      const categoria = await api.buscarCategoria(id);
      setDescricaoCategoria(categoria.descricao || "");
    } catch {
      setDescricaoCategoria("");
    }
  }

  return (
    <main className="min-h-screen bg-[var(--creme)] px-5 py-10">
      <form
        onSubmit={publicar}
        className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white p-6 shadow-md md:p-10"
      >
        <div className="mb-8 flex items-center gap-4">
          <Link
            to={origemHistorico ? "/historico" : "/home-prototipo"}
            aria-label={
              origemHistorico
                ? "Voltar para o Histórico"
                : "Voltar para a HomePrototipo"
            }
            className="text-2xl text-[var(--azul)] transition hover:text-[var(--verde)]"
          >
            <FaArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold text-[var(--azul)]">
            {editando ? "Editar pedido" : "Publicar pedido"}
          </h1>
        </div>
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <label className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl bg-[var(--cinza)] p-5 text-center transition hover:bg-gray-200 md:w-[220px]">
            {imagemPreview ? (
              <img
                src={imagemPreview}
                alt="Pré-visualização da imagem selecionada"
                className="aspect-square h-full w-full rounded-xl object-cover"
              />
            ) : (
              <>
                <FaCamera className="mb-4 text-5xl text-[var(--azul)]/50" />
                <span className="font-semibold text-[var(--azul)]">
                  Adicionar foto
                </span>
                <span className="mt-1 text-sm text-[var(--azul)]">
                  (opcional)
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={selecionarImagem}
              className="hidden"
            />
          </label>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-bold text-[var(--azul)]">
              Título do pedido
              <input
                required
                value={titulo}
                onChange={(event) => setTitulo(event.target.value)}
                type="text"
                placeholder="Ex: Montar um armário"
                className="h-11 rounded-xl border border-gray-300 px-4 font-normal outline-none transition focus:border-[var(--verde)]"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-bold text-[var(--azul)]">
              Tipo de publicação
              <select
                value={tipoPublicacao}
                onChange={(event) =>
                  setTipoPublicacao(event.target.value as "AJUDA" | "OFERTA")
                }
                className="h-11 rounded-xl border border-gray-300 bg-white px-4 font-normal outline-none transition focus:border-[var(--verde)]"
              >
                <option value="AJUDA">Preciso de ajuda</option>
                <option value="OFERTA">Quero oferecer ajuda</option>
              </select>
              <span className="text-xs font-normal text-gray-500">
                Em uma oferta, mais de uma pessoa pode ser aceita
              </span>
            </label>
            <label className="flex flex-col gap-2 text-sm font-bold text-[var(--azul)]">
              Categoria
              <select
                required
                value={categoriaId}
                onChange={(event) =>
                  void selecionarCategoria(event.target.value)
                }
                className="h-11 rounded-xl border border-gray-300 bg-white px-4 font-normal outline-none transition focus:border-[var(--verde)]"
              >
                <option value="" disabled>
                  Selecione...
                </option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
              {descricaoCategoria && (
                <span className="text-xs font-normal text-gray-500">
                  {descricaoCategoria}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-sm font-bold text-[var(--azul)]">
              Descrição
              <textarea
                required
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                placeholder="Conte mais sobre o que precisa..."
                rows={3}
                className="resize-y rounded-xl border border-gray-300 px-4 py-3 font-normal outline-none transition focus:border-[var(--verde)]"
              />
            </label>
          </div>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm font-bold text-[var(--azul)]">
            <span className="flex items-center gap-2">
              <FaMapMarkerAlt />
              Localização
            </span>
            <input
              required
              value={bairro}
              onChange={(event) => setBairro(event.target.value)}
              type="text"
              placeholder="Seu bairro"
              className="h-11 min-w-0 rounded-xl border border-gray-300 px-4 font-normal outline-none transition focus:border-[var(--verde)]"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-bold text-[var(--azul)]">
            <span className="flex items-center gap-2">
              <FaCalendarAlt />
              Data e horário
            </span>
            <input
              required
              value={data}
              onChange={(event) => setData(event.target.value)}
              type="datetime-local"
              className="h-11 min-w-0 rounded-xl border border-gray-300 px-3 font-normal text-[var(--azul)] outline-none transition focus:border-[var(--verde)]"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-bold text-[var(--azul)]">
            Valor (R$)
            <input
              required={!semPagamento}
              value={valor}
              onChange={(event) => setValor(event.target.value)}
              disabled={semPagamento}
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              className="h-11 min-w-0 rounded-xl border border-gray-300 px-4 font-normal outline-none transition focus:border-[var(--verde)] disabled:bg-gray-100"
            />
            <span className="flex items-center gap-2 text-xs font-medium">
              <input
                type="checkbox"
                checked={semPagamento}
                onChange={(event) => {
                  setSemPagamento(event.target.checked);
                  if (event.target.checked) setValor("0");
                }}
                className="h-4 w-4 accent-[var(--verde)]"
              />
              Não incluir pagamento
            </span>
          </label>
        </div>
        {erro && (
          <p
            role="alert"
            className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {erro}
          </p>
        )}
        <div className="mt-8 flex flex-col-reverse items-center justify-center gap-3 sm:flex-row">
          <Botao
            type="submit"
            texto={
              carregando
                ? "Salvando..."
                : editando
                  ? "Salvar alterações"
                  : "Publicar pedido"
            }
            tamanho="grande"
            desabilitado={carregando}
          />
          {editando && (
            <button
              type="button"
              onClick={() => void excluirPedido()}
              disabled={carregando}
              className="flex items-center gap-2 rounded-xl border border-[var(--coral)] px-6 py-3 font-semibold text-[var(--coral)] disabled:opacity-50"
            >
              <FaTrash /> Excluir pedido
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
