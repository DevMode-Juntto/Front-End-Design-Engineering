import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

type CardPerguntaProps = {
  pergunta: string;
  resposta: string;
};

export default function CardPergunta({
  pergunta,
  resposta,
}: CardPerguntaProps) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="rounded-2xl border border-[var(--cinza)] bg-white shadow-sm transition hover:shadow-md">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        aria-expanded={aberto}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <span className="font-semibold text-[var(--azul)]">{pergunta}</span>

        <FaChevronDown
          className={`shrink-0 text-[var(--verde)] transition-transform ${
            aberto ? "rotate-180" : ""
          }`}
        />
      </button>

      {aberto && (
        <div className="border-t border-[var(--cinza)] px-5 py-4">
          <p className="text-sm leading-relaxed text-[var(--texto)]">
            {resposta}
          </p>
        </div>
      )}
    </div>
  );
}
