import { FaCommentDots, FaStar } from "react-icons/fa";

type CampoFeedbackProps = {
  estrelas: number; // 0 = ainda não escolheu
  aoAlterarEstrelas: (valor: number) => void;
  comentario: string;
  aoAlterar: (valor: string) => void;
  pessoaAvaliada?: string;
};

// avaliação do serviço: estrelas de 1 a 5 (obrigatório para avaliar) + comentário opcional
export default function CampoFeedback({
  estrelas,
  aoAlterarEstrelas,
  comentario,
  aoAlterar,
  pessoaAvaliada = "a pessoa",
}: CampoFeedbackProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-[var(--creme)] p-5 sm:p-7">
      <div className="flex items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--verde)]/10">
          <FaCommentDots className="text-2xl text-[var(--verde)]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--azul)]">Avaliação</h2>
          <p className="mt-1 text-sm text-gray-600">Como foi sua experiência com {pessoaAvaliada}?</p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2" role="radiogroup" aria-label="Nota de 1 a 5 estrelas">
        {[1, 2, 3, 4, 5].map((nota) => (
          <button
            key={nota}
            type="button"
            role="radio"
            aria-checked={estrelas === nota}
            aria-label={`${nota} estrela${nota > 1 ? "s" : ""}`}
            onClick={() => aoAlterarEstrelas(nota)}
            className={`text-3xl transition ${nota <= estrelas ? "text-[var(--laranja)]" : "text-gray-300 hover:text-gray-400"}`}
          >
            <FaStar />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-500">{estrelas ? `${estrelas}/5` : "Escolha uma nota"}</span>
      </div>

      <div className="mt-5">
        <label htmlFor="comentario" className="mb-2 block font-semibold text-[var(--azul)]">
          Comentário (opcional)
        </label>
        <textarea
          id="comentario"
          value={comentario}
          onChange={(event) => aoAlterar(event.target.value.slice(0, 500))}
          maxLength={500}
          rows={4}
          placeholder={`Conte como foi a experiência com ${pessoaAvaliada}...`}
          className="w-full resize-y rounded-xl border border-gray-300 bg-white p-4 text-base leading-relaxed text-[var(--azul)] outline-none transition placeholder:text-gray-400 focus:border-[var(--verde)] focus:ring-2 focus:ring-[var(--verde)]/20"
        />
        <div className="mt-2 text-right text-sm text-gray-500">{comentario.length}/500</div>
      </div>
    </section>
  );
}
