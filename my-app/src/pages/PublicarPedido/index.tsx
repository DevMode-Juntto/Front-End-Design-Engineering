import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  FaArrowLeft,
  FaCamera,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTrash,
  FaHandsHelping,
  FaHandHoldingHeart,
} from "react-icons/fa";
import Botao from "../../components/Botao/Botao";
import { apiIA, type ValorSugerido } from "../../services/apiIA";
import { api, obterSessao } from "../../services/api";
import type { Categoria, DadosPedido, TipoPublicacao } from "../../types/types";

// "2026-12-20T14:00" (input datetime-local) -> "2026-12-20T14:00:00" (formato da API)
function paraApi(dataHora: string) {
  if (!dataHora) return "";
  return dataHora.length === 16 ? `${dataHora}:00` : dataHora;
}

// "2026-12-20T14:00:00" (API) -> "2026-12-20T14:00" (input datetime-local)
function paraInput(dataHora?: string | null) {
  return dataHora ? dataHora.slice(0, 16) : "";
}

export default function PublicarPedido() {
  const navigate = useNavigate();
  const [parametros] = useSearchParams();
  const pedidoId = parametros.get("pedidoId");
  const origemHistorico = parametros.get("origem") === "historico";
  const editando = Boolean(pedidoId);
  const sessao = obterSessao();

  const [tipo, setTipo] = useState<TipoPublicacao>("AJUDA");
  const [semPagamento, setSemPagamento] = useState(false);
  const [valor, setValor] = useState("");
  // valor sugerido pela IA (API Flask)
  const [sugestao, setSugestao] = useState<ValorSugerido | null>(null);
  const [buscandoSugestao, setBuscandoSugestao] = useState(false);
  const [erroSugestao, setErroSugestao] = useState("");
  const [recompensa, setRecompensa] = useState("");
  const [titulo, setTitulo] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dtInicio, setDtInicio] = useState("");
  const [dtFinal, setDtFinal] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [buscandoLocal, setBuscandoLocal] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  // pede à IA um valor justo com base no título, descrição, categoria, data e localização
  async function sugerirValor() {
    setErroSugestao("");
    setSugestao(null);
    if (!titulo.trim() || !descricao.trim() || !idCategoria || !dtInicio) {
      setErroSugestao("Preencha título, descrição, categoria e data para a IA sugerir um valor.");
      return;
    }
    setBuscandoSugestao(true);
    try {
      setSugestao(
        await apiIA.sugerirValor({
          titulo: titulo.trim(),
          descricao: descricao.trim(),
          idCategoria,
          dtInicio: paraApi(dtInicio),
          latitude,
          longitude,
        }),
      );
    } catch {
      setErroSugestao("A IA não está disponível agora. Você pode informar o valor normalmente.");
    } finally {
      setBuscandoSugestao(false);
    }
  }

  // AJUDA e OFERTA podem ter valor (ex.: aulas ou produtos à venda) ou ser sem pagamento
  const publicacaoSemPagamento = semPagamento;

  useEffect(() => {
    document.title = editando ? "Editar pedido - Junttô" : "Publicar pedido - Junttô";
    api
      .listarCategorias()
      .then(setCategorias)
      .catch(() => setCategorias([]));

    if (pedidoId) {
      api
        .buscarPedido(pedidoId)
        .then((pedido) => {
          setTipo(pedido.tipoPublicacao || "AJUDA");
          setTitulo(pedido.titulo);
          setIdCategoria(pedido.idCategoria);
          setDescricao(pedido.descricao || "");
          setDtInicio(paraInput(pedido.dtInicio));
          setDtFinal(paraInput(pedido.dtFinal));
          setSemPagamento(pedido.naoIncluirPagamento);
          setValor(pedido.valor != null ? String(pedido.valor) : "");
          setRecompensa(pedido.recompensa || "");
          setFotoUrl(pedido.fotoUrl || "");
          setLatitude(pedido.latitude ?? null);
          setLongitude(pedido.longitude ?? null);
        })
        .catch(() => setErro("Não foi possível carregar o pedido para edição"));
    } else if (sessao) {
      // usa a localização do perfil, se o usuário tiver cadastrado
      api
        .buscarUsuario(sessao.id, true)
        .then((usuario) => {
          if (usuario.latitude != null && usuario.longitude != null) {
            setLatitude(usuario.latitude);
            setLongitude(usuario.longitude);
          }
        })
        .catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editando, pedidoId]);

  // pega a localização atual pelo navegador
  function usarMinhaLocalizacao() {
    if (!navigator.geolocation) {
      setErro("Seu navegador não permite pegar a localização.");
      return;
    }
    setBuscandoLocal(true);
    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        setLatitude(Number(posicao.coords.latitude.toFixed(6)));
        setLongitude(Number(posicao.coords.longitude.toFixed(6)));
        setBuscandoLocal(false);
      },
      () => {
        setErro("Não foi possível pegar sua localização. Permita o acesso no navegador.");
        setBuscandoLocal(false);
      },
    );
  }

  // cria ou atualiza o pedido
  async function publicar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    if (!sessao) {
      setErro("Faça login para publicar.");
      return;
    }
    if (latitude == null || longitude == null) {
      setErro("Informe a localização: clique em “Usar minha localização”.");
      return;
    }
    const dados: DadosPedido = {
      idSolicitante: sessao.id,
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      tipoPublicacao: tipo,
      idCategoria,
      naoIncluirPagamento: publicacaoSemPagamento,
      valor: publicacaoSemPagamento ? null : Number(valor),
      recompensa: publicacaoSemPagamento && tipo === "AJUDA" && recompensa.trim() ? recompensa.trim() : null,
      dtInicio: paraApi(dtInicio),
      dtFinal: dtFinal ? paraApi(dtFinal) : null,
      fotoUrl: fotoUrl.trim() || null,
      latitude,
      longitude,
    };
    setCarregando(true);
    try {
      if (pedidoId) await api.atualizarPedido(pedidoId, dados);
      else await api.criarPedido(dados);
      navigate(origemHistorico ? "/historico" : "/home-prototipo");
    } catch (erroApi) {
      setErro(erroApi instanceof Error ? erroApi.message : "Não foi possível publicar o pedido");
    } finally {
      setCarregando(false);
    }
  }

  // exclui o pedido depois de confirmar
  async function excluirPedido() {
    if (!pedidoId || !sessao || !window.confirm("Tem certeza que deseja excluir este pedido?")) return;
    setErro("");
    setCarregando(true);
    try {
      await api.excluirPedido(pedidoId, sessao.id);
      navigate("/historico");
    } catch (erroApi) {
      setErro(erroApi instanceof Error ? erroApi.message : "Não foi possível excluir o pedido");
    } finally {
      setCarregando(false);
    }
  }

  const estiloCampo =
    "h-11 min-w-0 rounded-xl border border-gray-300 px-4 font-normal outline-none transition focus:border-[var(--verde)] disabled:bg-gray-100";

  return (
    <main className="min-h-screen bg-[var(--creme)] px-5 py-10">
      <form
        onSubmit={publicar}
        className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white p-6 shadow-md md:p-10"
      >
        <div className="mb-8 flex items-center gap-4">
          <Link
            to={origemHistorico ? "/historico" : "/home-prototipo"}
            aria-label={origemHistorico ? "Voltar para o Histórico" : "Voltar para a HomePrototipo"}
            className="text-2xl text-[var(--azul)] transition hover:text-[var(--verde)]"
          >
            <FaArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold text-[var(--azul)]">
            {editando ? "Editar publicação" : "Nova publicação"}
          </h1>
        </div>

        {/* tipo da publicação */}
        <fieldset className="mb-6 grid gap-3 sm:grid-cols-2">
          <legend className="mb-2 text-sm font-bold text-[var(--azul)]">O que você quer publicar?</legend>
          {(
            [
              ["AJUDA", "Preciso de ajuda", <FaHandsHelping key="a" />],
              ["OFERTA", "Quero oferecer algo", <FaHandHoldingHeart key="o" />],
            ] as const
          ).map(([valorTipo, texto, icone]) => (
            <label
              key={valorTipo}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 font-semibold transition ${
                tipo === valorTipo
                  ? "border-[var(--verde)] bg-green-50 text-[var(--azul)]"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              <input
                type="radio"
                name="tipo"
                value={valorTipo}
                checked={tipo === valorTipo}
                onChange={() => setTipo(valorTipo)}
                className="accent-[var(--verde)]"
              />
              <span className="text-xl">{icone}</span>
              {texto}
            </label>
          ))}
        </fieldset>

        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          {/* foto: o banco guarda só o link (até 200 caracteres) */}
          <div className="flex flex-col gap-2">
            <div className="flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-[var(--cinza)] p-5 text-center md:w-[220px]">
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt="Pré-visualização da foto"
                  className="aspect-square h-full w-full rounded-xl object-cover"
                />
              ) : (
                <>
                  <FaCamera className="mb-4 text-5xl text-[var(--azul)]/50" />
                  <span className="font-semibold text-[var(--azul)]">Foto</span>
                  <span className="mt-1 text-sm text-[var(--azul)]">(opcional)</span>
                </>
              )}
            </div>
            <input
              value={fotoUrl}
              onChange={(event) => setFotoUrl(event.target.value)}
              type="url"
              maxLength={200}
              placeholder="Link da foto (https://...)"
              aria-label="Link da foto"
              className="h-10 rounded-xl border border-gray-300 px-3 text-sm outline-none focus:border-[var(--verde)]"
            />
          </div>

          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-bold text-[var(--azul)]">
              Título
              <input
                required
                minLength={3}
                maxLength={50}
                value={titulo}
                onChange={(event) => setTitulo(event.target.value)}
                type="text"
                placeholder={tipo === "OFERTA" ? "Ex: Dou aulas de matemática" : "Ex: Montar um armário"}
                className={estiloCampo}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-bold text-[var(--azul)]">
              Categoria
              <select
                required
                value={idCategoria}
                onChange={(event) => setIdCategoria(event.target.value)}
                className={`${estiloCampo} bg-white`}
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
            </label>
            <label className="flex flex-col gap-2 text-sm font-bold text-[var(--azul)]">
              Descrição
              <textarea
                required
                minLength={5}
                maxLength={500}
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                placeholder="Conte mais detalhes..."
                rows={3}
                className="resize-y rounded-xl border border-gray-300 px-4 py-3 font-normal outline-none transition focus:border-[var(--verde)]"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div className="flex flex-col gap-2 text-sm font-bold text-[var(--azul)]">
            <span className="flex items-center gap-2">
              <FaMapMarkerAlt />
              Localização
            </span>
            <button
              type="button"
              onClick={usarMinhaLocalizacao}
              disabled={buscandoLocal}
              className="h-11 rounded-xl border border-[var(--verde)] px-4 font-semibold text-[var(--verde)] transition hover:bg-green-50 disabled:opacity-50"
            >
              {buscandoLocal ? "Buscando..." : "Usar minha localização"}
            </button>
            <span className="text-xs font-normal text-gray-500">
              {latitude != null && longitude != null
                ? `Definida (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
                : "Ainda não definida"}
            </span>
          </div>
          <label className="flex flex-col gap-2 text-sm font-bold text-[var(--azul)]">
            <span className="flex items-center gap-2">
              <FaCalendarAlt />
              Início
            </span>
            <input
              required
              value={dtInicio}
              onChange={(event) => setDtInicio(event.target.value)}
              type="datetime-local"
              className={`${estiloCampo} px-3 text-[var(--azul)]`}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-bold text-[var(--azul)]">
            <span className="flex items-center gap-2">
              <FaCalendarAlt />
              Término previsto (opcional)
            </span>
            <input
              value={dtFinal}
              min={dtInicio || undefined}
              onChange={(event) => setDtFinal(event.target.value)}
              type="datetime-local"
              className={`${estiloCampo} px-3 text-[var(--azul)]`}
            />
          </label>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-bold text-[var(--azul)]">
            Valor (R$)
            <input
              required={!publicacaoSemPagamento}
              value={publicacaoSemPagamento ? "" : valor}
              onChange={(event) => setValor(event.target.value)}
              disabled={publicacaoSemPagamento}
              type="number"
              min="0.01"
              step="0.01"
              placeholder={publicacaoSemPagamento ? "Sem pagamento" : "0,00"}
              className={estiloCampo}
            />
            {!publicacaoSemPagamento && tipo === "AJUDA" && (
              <div className="rounded-xl border border-dashed border-[var(--verde)] bg-[var(--creme)] p-3 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => void sugerirValor()}
                  disabled={buscandoSugestao}
                  className="rounded-lg bg-[var(--verde)] px-3 py-1.5 font-bold text-white disabled:opacity-60"
                >
                  {buscandoSugestao ? "Calculando..." : "✨ Sugerir valor com IA"}
                </button>
                {sugestao && (
                  <p className="mt-2 text-[var(--azul)]">
                    Sugestão da IA: <strong>R$ {sugestao.valorSugerido}</strong> (faixa de R$ {sugestao.minimo} a R${" "}
                    {sugestao.maximo}) para {sugestao.categoria}
                    {sugestao.bairroConsiderado ? ` em ${sugestao.bairroConsiderado}` : ""}.{" "}
                    <button
                      type="button"
                      onClick={() => setValor(String(sugestao.valorSugerido))}
                      className="font-bold text-[var(--verde)] underline"
                    >
                      Usar este valor
                    </button>
                  </p>
                )}
                {erroSugestao && <p className="mt-2 text-[var(--coral)]">{erroSugestao}</p>}
              </div>
            )}
            <span className="flex items-center gap-2 text-xs font-medium">
              <input
                type="checkbox"
                checked={publicacaoSemPagamento}
                onChange={(event) => setSemPagamento(event.target.checked)}
                className="h-4 w-4 accent-[var(--verde)]"
              />
              {tipo === "OFERTA" ? "Oferta gratuita" : "Não incluir pagamento"}
            </span>
          </label>
          {publicacaoSemPagamento && tipo === "AJUDA" && (
            <label className="flex flex-col gap-2 text-sm font-bold text-[var(--azul)]">
              Recompensa (opcional)
              <input
                value={recompensa}
                maxLength={300}
                onChange={(event) => setRecompensa(event.target.value)}
                type="text"
                placeholder="Ex: Um bolo caseiro de agradecimento"
                className={estiloCampo}
              />
            </label>
          )}
        </div>

        {erro && (
          <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {erro}
          </p>
        )}
        <div className="mt-8 flex flex-col-reverse items-center justify-center gap-3 sm:flex-row">
          <Botao
            type="submit"
            texto={carregando ? "Salvando..." : editando ? "Salvar alterações" : "Publicar"}
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
              <FaTrash /> Excluir
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
