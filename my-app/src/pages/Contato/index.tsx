import { useEffect } from "react";
import { FaEnvelope, FaPaperPlane } from "react-icons/fa";

export default function Contato() {
  useEffect(() => {
    document.title = "Contato - Junttô";
  }, []);

  return (
    <main className="min-h-screen bg-[var(--creme)] px-6 py-16">
      <section className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <FaEnvelope className="mx-auto text-5xl text-[var(--verde)]" />

          <h1 className="mt-5 text-3xl font-bold text-[var(--azul)] md:text-4xl">
            Entre em contato
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[var(--texto)]">
            Tem alguma dúvida, sugestão ou deseja falar com nossa equipe? Envie
            uma mensagem pelo formulário abaixo!
          </p>
        </div>

        <form
          onSubmit={(evento) => {
            evento.preventDefault();
            alert(
              "Formulário enviado com sucesso!",
            );
          }}
          className="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-lg md:p-10"
        >
          <div>
            <label
              htmlFor="nome"
              className="mb-2 block text-sm font-semibold text-[var(--azul)]"
            >
              Nome
            </label>

            <input
              type="text"
              id="nome"
              name="nome"
              placeholder="Digite seu nome"
              required
              className="w-full rounded-xl border border-[var(--cinza)] bg-[var(--creme)] px-4 py-3 text-sm outline-none transition focus:border-[var(--verde)]"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-[var(--azul)]"
            >
              E-mail
            </label>

            <input
              type="email"
              id="email"
              name="email"
              placeholder="Digite seu e-mail"
              required
              className="w-full rounded-xl border border-[var(--cinza)] bg-[var(--creme)] px-4 py-3 text-sm outline-none transition focus:border-[var(--verde)]"
            />
          </div>

          <div>
            <label
              htmlFor="assunto"
              className="mb-2 block text-sm font-semibold text-[var(--azul)]"
            >
              Assunto
            </label>

            <input
              type="text"
              id="assunto"
              name="assunto"
              placeholder="Qual é o assunto da mensagem?"
              required
              className="w-full rounded-xl border border-[var(--cinza)] bg-[var(--creme)] px-4 py-3 text-sm outline-none transition focus:border-[var(--verde)]"
            />
          </div>

          <div>
            <label
              htmlFor="mensagem"
              className="mb-2 block text-sm font-semibold text-[var(--azul)]"
            >
              Mensagem
            </label>

            <textarea
              id="mensagem"
              name="mensagem"
              placeholder="Escreva sua mensagem (mínimo de 15 caracteres)"
              required
              minLength={15}
              rows={5}
              className="w-full resize-y rounded-xl border border-[var(--cinza)] bg-[var(--creme)] px-4 py-3 text-sm outline-none transition focus:border-[var(--verde)]"
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[var(--verde)] px-6 py-4 font-bold text-white transition hover:opacity-90"
          >
            Enviar mensagem
            <FaPaperPlane />
          </button>
        </form>
      </section>
    </main>
  );
}