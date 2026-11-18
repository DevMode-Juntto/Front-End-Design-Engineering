import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaImage,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaTag,
  FaUser,
} from "react-icons/fa";
import { api } from "../../services/api";
import type { Pedido, Usuario } from "../../types/types";

type PedidoCompleto = Pedido & {
  fotos?: unknown;
  fotosUrls?: unknown;
  foto?: unknown;
  fotoUrl?: unknown;
  urlFoto?: unknown;
  imagem?: unknown;
  imagemUrl?: unknown;
  imagens?: unknown;
  images?: unknown;
  anexos?: unknown;
  dtInicio?: string;
  solicitanteId?: string | number;
  prestadorId?: string | number;
};

// traduz o status do pedido p mostrar na tela
function nomeStatus(status?: string) {
  const nomes: Record<string, string> = {
    ABERTO: "Aberto",
    ACEITO: "Prestador escolhido",
    EM_ANDAMENTO: "Em andamento",
    AGUARDANDO_CONFIRMACAO: "Aguardando confirmação",
    CONCLUIDO: "Concluído",
    FINALIZADO: "Finalizado",
    CANCELADO: "Cancelado",
    EXPIRADO: "Expirado",
    REMOVIDO: "Removido",
  };
  return nomes[String(status || "").toUpperCase()] || status || "Não informado";
}

// deixa a data em um formato mais fácil
function dataFormatada(data?: string) {
  if (!data) return "Data não informada";
  const resultado = new Date(data);
  if (Number.isNaN(resultado.getTime())) return data;
  return resultado.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

// encontra a primeira imagem do pedido
function imagensDoPedido(pedido: PedidoCompleto) {
  const valores = [
    pedido.fotos,
    pedido.fotosUrls,
    pedido.foto,
    pedido.fotoUrl,
    pedido.urlFoto,
    pedido.imagem,
    pedido.imagemUrl,
    pedido.imagens,
    pedido.images,
    pedido.anexos,
  ].flatMap((valor) => (Array.isArray(valor) ? valor : [valor]));
  return valores.flatMap((foto) => {
    if (typeof foto === "string" && foto.trim()) return [foto];
    if (foto && typeof foto === "object" && "url" in foto) {
      const url = foto.url;
      if (typeof url === "string" && url.trim()) return [url];
    }
    return [];
  });
}

// mostra os dados de uma pessoa ligada ao pedido
function Pessoa({
  titulo,
  pessoa,
  id,
}: {
  titulo: string;
  pessoa?: Usuario;
  id?: string | number;
}) {
  const pessoaId = pessoa?.id ?? id;
  return (
    <div className="rounded-2xl bg-[var(--creme)] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
        {titulo}
      </p>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center overflow-hidden rounded-full bg-white text-[var(--verde)]">
          {pessoa?.foto ? (
            <img
              src={pessoa.foto}
              alt={pessoa.nome}
              className="size-full object-cover"
            />
          ) : (
            <FaUser />
          )}
        </div>
        <div>
          <p className="font-bold text-[var(--azul)]">
            {pessoa?.nome || "Não informado"}
          </p>
          <p className="text-xs text-gray-500">
            ID: {pessoaId ?? "não informado"} ·{" "}
            {pessoa?.bairro || "Bairro não informado"}
          </p>
        </div>
      </div>
      {pessoaId !== undefined && (
        <Link
          to={`/perfil/${pessoaId}`}
          className="mt-3 inline-block text-xs font-bold text-[var(--azul)] hover:underline"
        >
          Ver perfil
        </Link>
      )}
    </div>
  );
}

// busca e mostra todos os dados do pedido
export default function DetalhesPedido() {
  const { id } = useParams();
  const [parametros] = useSearchParams();
  const voltarPara =
    parametros.get("origem") === "historico" ? "/historico" : "/home-prototipo";
  const [pedido, setPedido] = useState<PedidoCompleto | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!id) {
      setErro("Pedido não informado.");
      return;
    }
    void api
      .buscarPedido(id)
      .then((dados) => setPedido(dados as PedidoCompleto))
      .catch((erroApi) =>
        setErro(
          erroApi instanceof Error
            ? erroApi.message
            : "Não foi possível carregar os detalhes do pedido.",
        ),
      );
  }, [id]);

  if (erro) {
    return (
      <main className="min-h-screen bg-[var(--creme)] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="text-[var(--coral)]">{erro}</p>
          <Link
            to={voltarPara}
            className="mt-5 inline-block font-bold text-[var(--azul)]"
          >
            Voltar para a HomePrototipo
          </Link>
        </div>
      </main>
    );
  }

  if (!pedido) {
    return (
      <main className="min-h-screen bg-[var(--creme)] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
          Carregando detalhes do pedido...
        </div>
      </main>
    );
  }

  const imagens = imagensDoPedido(pedido).slice(0, 1);
  const categoriaNome =
    typeof pedido.categoria === "string"
      ? pedido.categoria
      : pedido.categoria?.nome || "Não informada";

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex items-center gap-4">
          <Link
            to={voltarPara}
            aria-label="Voltar"
            className="flex size-11 items-center justify-center rounded-full bg-white text-xl text-[var(--azul)] shadow-sm"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <p className="text-sm font-semibold text-[var(--verde)]">
              Detalhes da ajuda
            </p>
            <h1 className="text-3xl font-bold text-[var(--azul)]">
              Pedido #{pedido.id}
            </h1>
          </div>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-flex rounded-full bg-[var(--verde)]/10 px-3 py-1 text-xs font-bold text-[var(--verde)]">
                {nomeStatus(pedido.status)}
              </span>
              <h2 className="mt-3 text-2xl font-bold text-[var(--azul)]">
                {pedido.titulo}
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                {pedido.descricao || "Nenhuma descrição informada."}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--creme)] px-5 py-4 text-right">
              <p className="text-xs text-gray-500">Valor combinado</p>
              <p className="mt-1 text-2xl font-bold text-[var(--laranja)]">
                {pedido.valor !== undefined
                  ? pedido.valor.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : "A combinar"}
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 p-4">
              <FaTag className="text-[var(--laranja)]" />
              <p className="mt-2 text-xs text-gray-500">Categoria</p>
              <p className="font-bold text-[var(--azul)]">{categoriaNome}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <FaMapMarkerAlt className="text-[var(--verde)]" />
              <p className="mt-2 text-xs text-gray-500">Local</p>
              <p className="font-bold text-[var(--azul)]">
                {pedido.bairro || "Bairro não informado"}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <FaCalendarAlt className="text-[var(--azul)]" />
              <p className="mt-2 text-xs text-gray-500">Data e horário</p>
              <p className="font-bold text-[var(--azul)]">
                {dataFormatada(pedido.data || pedido.dtInicio)}
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <Pessoa
              titulo="Quem pediu a ajuda"
              pessoa={pedido.solicitante}
              id={pedido.solicitanteId}
            />
            <Pessoa
              titulo="Quem vai ajudar"
              pessoa={pedido.prestador}
              id={pedido.prestadorId}
            />
          </div>

          <section className="mt-7">
            <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--azul)]">
              <FaImage className="text-[var(--verde)]" /> Foto do pedido
            </h3>
            {imagens.length ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {imagens.map((foto, indice) => (
                  <img
                    key={`${foto}-${indice}`}
                    src={foto}
                    alt={`Foto do pedido ${indice + 1}`}
                    className="aspect-square w-full rounded-2xl object-cover shadow-sm"
                  />
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-xl bg-[var(--creme)] p-4 text-sm text-gray-500">
                Este pedido não possui fotos anexadas.
              </p>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
