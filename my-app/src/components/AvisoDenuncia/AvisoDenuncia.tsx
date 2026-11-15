import { FaExclamationTriangle } from "react-icons/fa";

export default function AvisoDenuncia() {
  return (
    <div className="mb-7 flex gap-4 rounded-2xl border border-[var(--coral)]/30 bg-[var(--coral)]/10 p-4">
      <FaExclamationTriangle className="mt-1 shrink-0 text-xl text-[var(--coral)]" />

      <p className="text-sm leading-relaxed text-[var(--azul)]">
        Preencha as informações abaixo para relatar um problema. Sua denúncia
        será tratada com atenção.
      </p>
    </div>
  );
}