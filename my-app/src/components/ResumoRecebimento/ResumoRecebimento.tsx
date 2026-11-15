import { FaUser, FaMoneyBillWave } from "react-icons/fa";

type ResumoRecebimentoProps = {
  nomeSolicitante?: string;
  valorRecebido?: number;
};

export default function ResumoRecebimento({
  nomeSolicitante,
  valorRecebido,
}: ResumoRecebimentoProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--verde)]/10">
            <FaUser className="text-xl text-[var(--verde)]" />
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Pessoa que solicitou a ajuda
            </p>

            <p className="font-bold text-[var(--azul)]">
              {nomeSolicitante || "Nome não informado"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-gray-200 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
          <FaMoneyBillWave className="text-2xl text-[var(--verde)]" />

          <div>
            <p className="text-sm text-gray-500">Valor recebido</p>

            <p className="text-xl font-bold text-[var(--laranja)]">
              {valorRecebido !== undefined
                ? valorRecebido.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : "Aguardando valor"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}