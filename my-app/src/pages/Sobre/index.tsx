import { useEffect } from "react";
import {
  FaHandsHelping,
  FaUsers,
  FaUniversalAccess,
  FaStore,
  FaGlobeAmericas,
  FaHeart,
  FaHandHoldingHeart,
  FaUserFriends,
} from "react-icons/fa";

export default function Sobre() {
  useEffect(() => {
    document.title = "Sobre - Junttô";
  }, []);

  const valores = [
    {
      icone: <FaHandsHelping />,
      titulo: "Colaboração",
      descricao: "Incentivar pessoas a ajudarem umas às outras.",
    },
    {
      icone: <FaUsers />,
      titulo: "Inclusão",
      descricao: "Criar oportunidades para todos participarem.",
    },
    {
      icone: <FaUniversalAccess />,
      titulo: "Acessibilidade",
      descricao: "Facilitar o acesso à ajuda e aos serviços.",
    },
    {
      icone: <FaStore />,
      titulo: "Oportunidades locais",
      descricao:
        "Valorizar talentos, serviços e pequenos produtores da região.",
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--creme)]">
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-[var(--verde)]/10 px-4 py-2 text-sm font-semibold text-[var(--verde)]">
              Conheça o Junttô
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight text-[var(--azul)] md:text-5xl">
              Pequenas ajudas podem transformar uma comunidade.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--texto)]">
              O Junttô nasceu da ideia de aproximar pessoas, facilitar a ajuda
              no dia a dia e fortalecer os laços entre moradores de uma mesma
              região.
            </p>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--texto)]">
              Acreditamos que todos podem precisar de ajuda em algum momento,
              assim como todos têm algo a oferecer.
            </p>
          </div>

          <div className="relative flex flex-col items-center justify-center gap-5 rounded-3xl bg-white p-8 shadow-lg md:p-12">
            <div className="flex w-full items-center gap-4 rounded-2xl bg-[var(--creme)] p-5">
              <FaUserFriends className="shrink-0 text-4xl text-[var(--verde)]" />

              <div>
                <h2 className="font-bold text-[var(--azul)]">
                  Quem precisa de ajuda
                </h2>

                <p className="mt-1 text-sm text-[var(--texto)]">
                  Encontra apoio para suas necessidades.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[var(--verde)]">
              <span className="text-2xl">↕</span>

              <span className="text-sm font-semibold">
                Conexão entre pessoas
              </span>

              <span className="text-2xl">↕</span>
            </div>

            <div className="flex w-full items-center gap-4 rounded-2xl bg-[var(--creme)] p-5">
              <FaHandHoldingHeart className="shrink-0 text-4xl text-[var(--verde)]" />

              <div>
                <h2 className="font-bold text-[var(--azul)]">
                  Quem pode ajudar
                </h2>

                <p className="mt-1 text-sm text-[var(--texto)]">
                  Compartilha seu tempo, talento ou serviço.
                </p>
              </div>
            </div>

            <div className="absolute -right-3 -top-5 rounded-2xl bg-[var(--laranja)] px-5 py-3 text-sm font-bold text-white shadow-md">
              Juntos somos mais fortes!
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-5xl text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-[var(--verde)]">
            O que nos move
          </span>

          <h2 className="mt-3 text-3xl font-bold text-[var(--azul)] md:text-4xl">
            Nosso propósito
          </h2>

          <div className="mx-auto mt-8 max-w-3xl rounded-3xl bg-[var(--creme)] p-8 md:p-12">
            <FaGlobeAmericas className="mx-auto text-5xl text-[var(--verde)]" />

            <p className="mt-6 text-xl font-semibold leading-relaxed text-[var(--azul)] md:text-2xl">
              Aproximar pessoas e fortalecer comunidades.
            </p>

            <p className="mt-4 text-base leading-relaxed text-[var(--texto)]">
              Queremos tornar mais fácil encontrar ajuda, compartilhar
              habilidades e criar oportunidades perto de casa.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-[var(--verde)]">
              No que acreditamos
            </span>

            <h2 className="mt-3 text-3xl font-bold text-[var(--azul)] md:text-4xl">
              Nossos valores
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-[var(--texto)]">
              São esses princípios que orientam nossa ideia de uma comunidade
              mais próxima, acolhedora e colaborativa.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 min-[481px]:grid-cols-2 md:grid-cols-4">
            {valores.map((valor) => (
              <div
                key={valor.titulo}
                className="rounded-2xl border border-[var(--cinza)] bg-white p-7 text-center shadow-md transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--creme)] text-3xl text-[var(--verde)]">
                  {valor.icone}
                </span>

                <h3 className="mt-5 text-lg font-bold text-[var(--azul)]">
                  {valor.titulo}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-[var(--texto)]">
                  {valor.descricao}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl rounded-3xl bg-[var(--azul)] px-8 py-12 text-center shadow-lg md:px-16">
          <FaHeart className="mx-auto text-4xl text-[var(--coral)]" />

          <h2 className="mt-4 text-2xl font-bold text-white md:text-3xl">
            Uma comunidade melhor começa com a união de pessoas.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-white/85">
            No Junttô, cada ajuda importa. Juntos, podemos transformar pequenas
            atitudes em grandes mudanças.
          </p>
        </div>
      </section>
    </main>
  );
}
