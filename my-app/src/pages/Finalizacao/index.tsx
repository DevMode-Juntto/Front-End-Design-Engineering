import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  FaArrowLeft,
  FaMinus,
  FaPlus,
  FaCheckCircle,
  FaMoneyBillWave,
} from "react-icons/fa";
import { api, obterSessao } from "../../services/api";
import type { Pedido } from "../../types/types";

type FinalizacaoProps = {
  temValor?: boolean;
};

// mostra a finalização da ajuda e do pagamento
export default function Finalizacao({ temValor = true }: FinalizacaoProps) {
  const navigate = useNavigate();
  const [parametros] = useSearchParams();
  const pedidoId = parametros.get("pedidoId");
  const [valorPagamento, setValorPagamento] = useState(0);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [caixinha, setCaixinha] = useState(0);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    document.title = "Finalização - Junttô";
    if (pedidoId) {
      void api
        .buscarPedido(pedidoId)
        .then((pedidoRecebido) => {
          setPedido(pedidoRecebido);
          setValorPagamento(Number(pedidoRecebido.valor || 0));
        })
        .catch(() => undefined);
    }
  }, [pedidoId]);

  // registra o pagamento do pedido
  async function finalizar() {
    if (!pedidoId) {
      setErro("O pedido não foi informado. Abra esta tela com ?pedidoId=ID.");
      return;
    }
    setErro("");
    setCarregando(true);
    try {
      if (temValor)
        await api.registrarPagamento(pedidoId, {
          formaPagamento: "A_COMBINAR",
          valor: valorPagamento,
          caixinha,
        });
      navigate("/home-prototipo");
    } catch (erroApi) {
      setErro(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível finalizar o pedido.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--creme)] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-5 shadow-lg sm:p-8">
        <header className="mb-8 flex items-center gap-4">
          <Link
            to="/home-prototipo"
            aria-label="Voltar"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--cinza)] text-xl text-[var(--azul)] transition hover:bg-gray-200"
          >
            <FaArrowLeft />
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-[var(--azul)] sm:text-3xl">
              Finalização
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Registre o pagamento enviado ao prestador e avalie a ajuda
            </p>
          </div>
        </header>

        <section className="mb-8 rounded-2xl border border-[var(--laranja)]/20 bg-[var(--creme)] p-5 sm:p-6">
          <h2 className="text-lg font-bold text-[var(--azul)]">
            Dados da transferência
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Confira quem está enviando e quem vai receber o pagamento.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Quem envia
              </p>
              <p className="mt-2 font-bold text-[var(--azul)]">
                {obterSessao()?.nome || "Usuário atual"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                ID: {obterSessao()?.id ?? "não informado"} ·{" "}
                {obterSessao()?.bairro || "Bairro não informado"}
              </p>
            </div>
            <div className="rounded-xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Quem recebe
              </p>
              <p className="mt-2 font-bold text-[var(--azul)]">
                {pedido?.prestador?.nome || "Prestador ainda não informado"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                ID: {pedido?.prestador?.id ?? "não informado"} ·{" "}
                {pedido?.prestador?.bairro || "Bairro não informado"}
              </p>
            </div>
          </div>
        </section>

        {temValor && (
          <section className="rounded-2xl bg-[var(--creme)] p-5 sm:p-6">
            <h2 className="flex items-center gap-3 text-lg font-bold text-[var(--azul)] sm:text-xl">
              <FaMoneyBillWave className="text-2xl text-[var(--verde)]" />
              Resumo do pagamento
            </h2>

            <div className="mt-6 flex items-center justify-between gap-3">
              <span className="text-base text-[var(--azul)]">
                Valor enviado ao prestador
              </span>

              <label className="flex items-center gap-1 text-lg font-bold text-[var(--azul)]">
                <span>R$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={valorPagamento}
                  onChange={(event) =>
                    setValorPagamento(Math.max(0, Number(event.target.value)))
                  }
                  aria-label="Valor enviado ao prestador"
                  className="w-28 rounded-lg border border-gray-300 bg-white px-2 py-1 text-right outline-none focus:border-[var(--verde)]"
                />
              </label>
            </div>

            <div className="mt-7">
              <p className="mb-4 font-semibold text-[var(--azul)]">
                Caixinha (opcional)
              </p>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCaixinha(Math.max(0, caixinha - 1))}
                  disabled={caixinha === 0}
                  aria-label="Diminuir caixinha"
                  className="flex size-12 min-w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--azul)] bg-white text-[var(--azul)] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FaMinus />
                </button>

                <div className="flex flex-1 flex-col items-center">
                  <span className="text-2xl font-bold text-[var(--azul)]">
                    R$ {caixinha.toFixed(2).replace(".", ",")}
                  </span>

                  <span className="mt-1 text-xs text-gray-500">
                    Valor adicional
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setCaixinha(caixinha + 1)}
                  aria-label="Aumentar caixinha"
                  className="flex size-12 min-w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--azul)] bg-white text-[var(--azul)] transition hover:bg-gray-100"
                >
                  <FaPlus />
                </button>
              </div>
            </div>

            <div className="mt-7 flex items-center justify-between gap-3 border-t border-gray-300 pt-5">
              <span className="text-lg font-bold text-[var(--azul)]">
                Total
              </span>

              <span className="text-2xl font-bold text-[var(--verde)]">
                R$ {(valorPagamento + caixinha).toFixed(2).replace(".", ",")}
              </span>
            </div>
          </section>
        )}

        {erro && (
          <p
            role="alert"
            className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {erro}
          </p>
        )}

        {temValor && (
          <button
            type="button"
            onClick={finalizar}
            className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-[var(--laranja)] px-6 py-4 text-lg font-bold text-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:brightness-95 hover:shadow-lg active:translate-y-0 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--azul)]"
          >
            <FaCheckCircle className="text-xl" />
            {carregando ? "Registrando..." : "Registrar pagamento"}
          </button>
        )}
      </div>
    </main>
  );
}
