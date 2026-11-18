import { FaUser, FaMoneyBillWave } from "react-icons/fa";

type ResumoRecebimentoProps = {
  nomeSolicitante?: string;
  idSolicitante?: string | number;
  bairroSolicitante?: string;
  nomePrestador?: string;
  idPrestador?: string | number;
  bairroPrestador?: string;
  valorRecebido?: number;
};

export default function ResumoRecebimento({
  nomeSolicitante,
  idSolicitante,
  bairroSolicitante,
  nomePrestador,
  idPrestador,
  bairroPrestador,
  valorRecebido,
}: ResumoRecebimentoProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold text-[var(--azul)]">
        Resumo da transferência
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--verde)]/10">
            <FaUser className="text-xl text-[var(--verde)]" />
          </div>

          <div>
            <p className="text-sm text-gray-500">Quem enviou</p>

            <p className="font-bold text-[var(--azul)]">
              {nomeSolicitante || "Nome não informado"}
            </p>
            <p className="text-xs text-gray-500">
              ID: {idSolicitante ?? "não informado"} ·{" "}
              {bairroSolicitante || "Bairro não informado"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-gray-200 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
          <FaUser className="text-2xl text-[var(--verde)]" />
          <div>
            <p className="text-sm text-gray-500">Quem recebe</p>
            <p className="font-bold text-[var(--azul)]">
              {nomePrestador || "Prestador não informado"}
            </p>
            <p className="text-xs text-gray-500">
              ID: {idPrestador ?? "não informado"} ·{" "}
              {bairroPrestador || "Bairro não informado"}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3 border-t border-gray-200 pt-4">
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
    </section>
  );
}
