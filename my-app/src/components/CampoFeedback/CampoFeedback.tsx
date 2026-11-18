import { FaCommentDots } from "react-icons/fa";

type CampoFeedbackProps = {
  comentario: string;
  aoAlterar: (valor: string) => void;
  pessoaAvaliada?: string;
};

export default function CampoFeedback({
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
          <h2 className="text-xl font-bold text-[var(--azul)]">Feedback</h2>

          <p className="mt-1 text-sm text-gray-600">
            Conte como foi sua experiência com {pessoaAvaliada}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <label
          htmlFor="comentario"
          className="mb-2 block font-semibold text-[var(--azul)]"
        >
          Seu comentário
        </label>

        <textarea
          id="comentario"
          value={comentario}
          onChange={(event) => aoAlterar(event.target.value.slice(0, 300))}
          maxLength={300}
          rows={4}
          placeholder={`Conte como foi a experiência com ${pessoaAvaliada} (opcional)...`}
          className="w-full resize-y rounded-xl border border-gray-300 bg-white p-4 text-base leading-relaxed text-[var(--azul)] outline-none transition placeholder:text-gray-400 focus:border-[var(--verde)] focus:ring-2 focus:ring-[var(--verde)]/20"
        />

        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">Opcional</span>
          <span className="text-sm text-gray-500">{comentario.length}/300</span>
        </div>
      </div>
    </section>
  );
}
