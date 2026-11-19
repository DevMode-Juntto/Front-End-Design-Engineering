import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaImage,
  FaMapMarkerAlt,
  FaTag,
  FaUser,
} from "react-icons/fa";
import { api, formatarData, formatarValor, NOMES_STATUS, NOMES_STATUS_PAGAMENTO, obterSessao } from "../../services/api";
import type { Pedido } from "../../types/types";

// mostra os dados de uma pessoa ligada ao pedido
function Pessoa({
  titulo,
  id,
  nome,
  email,
}: {
  titulo: string;
  id?: string | null;
  nome?: string | null;
  email?: string | null;
}) {
  return (
    <div className="rounded-2xl bg-[var(--creme)] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{titulo}</p>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center overflow-hidden rounded-full bg-white text-[var(--verde)]">
          <FaUser />
        </div>
        <div>
          <p className="font-bold text-[var(--azul)]">{nome || "Ainda não definido"}</p>
          {email && <p className="text-xs text-gray-500">Contato: {email}</p>}
        </div>
      </div>
      {id && (
        <Link to={`/perfil/${id}`} className="mt-3 inline-block text-xs font-bold text-[var(--azul)] hover:underline">
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
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!id) {
      setErro("Pedido não informado.");
      return;
    }
    // com o id do usuário logado, os e-mails de contato aparecem para os participantes
    void api
      .buscarPedido(id, obterSessao()?.id)
      .then(setPedido)
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

  const imagens = pedido.fotoUrl ? [pedido.fotoUrl] : [];
  const oferta = pedido.tipoPublicacao === "OFERTA";
  // em AJUDA quem publicou recebe a ajuda; em OFERTA quem publicou é quem ajuda
  const ajudante = oferta
    ? { id: pedido.idSolicitante, nome: pedido.nomeSolicitante, email: pedido.emailSolicitante }
    : { id: pedido.idPrestador, nome: pedido.nomePrestador, email: pedido.emailPrestador };
  // em OFERTA podem ser vários interessados aceitos: aparece só a quantidade
  const ajudado = oferta
    ? {
        id: null,
        nome: pedido.totalAceitas
          ? `${pedido.totalAceitas} interessado(s) aceito(s)`
          : "Nenhum interessado aceito ainda",
        email: null,
      }
    : { id: pedido.idSolicitante, nome: pedido.nomeSolicitante, email: pedido.emailSolicitante };

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
                {NOMES_STATUS[pedido.status] || pedido.status}
              </span>{" "}
              <span className="inline-flex rounded-full bg-[var(--laranja)]/10 px-3 py-1 text-xs font-bold text-[var(--laranja)]">
                {oferta ? "Oferta de ajuda" : "Pedido de ajuda"}
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
              <p className="mt-1 text-2xl font-bold text-[var(--laranja)]">{formatarValor(pedido)}</p>
              {pedido.status === "CONCLUIDO" && pedido.total != null && pedido.tipoPublicacao === "AJUDA" && (
                <p className="mt-1 text-xs text-gray-500">
                  Total: R$ {pedido.total.toFixed(2).replace(".", ",")}
                  {pedido.statusPagamento ? ` (${NOMES_STATUS_PAGAMENTO[pedido.statusPagamento] || pedido.statusPagamento})` : ""}
                </p>
              )}
              {pedido.tipoPublicacao === "OFERTA" && !!pedido.totalAceitas && (
                <p className="mt-1 text-xs text-gray-500">{pedido.totalAceitas} interessado(s) aceito(s)</p>
              )}
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 p-4">
              <FaTag className="text-[var(--laranja)]" />
              <p className="mt-2 text-xs text-gray-500">Categoria</p>
              <p className="font-bold text-[var(--azul)]">{pedido.nomeCategoria}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <FaMapMarkerAlt className="text-[var(--verde)]" />
              <p className="mt-2 text-xs text-gray-500">Local</p>
              {pedido.latitude != null && pedido.longitude != null ? (
                <a
                  href={`https://www.google.com/maps?q=${pedido.latitude},${pedido.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[var(--azul)] hover:underline"
                >
                  Ver no mapa
                </a>
              ) : (
                <p className="font-bold text-[var(--azul)]">Não informado</p>
              )}
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <FaCalendarAlt className="text-[var(--azul)]" />
              <p className="mt-2 text-xs text-gray-500">Data e horário</p>
              <p className="font-bold text-[var(--azul)]">
                {formatarData(pedido.dtInicio)}
                {pedido.dtFinal ? ` até ${formatarData(pedido.dtFinal)}` : ""}
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <Pessoa titulo={oferta ? "Interessados" : "Quem recebe a ajuda"} {...ajudado} />
            <Pessoa titulo="Quem vai ajudar" {...ajudante} />
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
                Este pedido não possui foto.
              </p>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
