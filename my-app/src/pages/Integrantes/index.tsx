import { useEffect } from "react";
import CardIntegrante from "../../components/CardIntegrante/CardIntegrante";

import heloisaCostaPereira from "../../img/heloisa-costa-pereira.jpeg";
import isabelleDantasDeAraujo from "../../img/isabelle-dantas-de-araujo.jpeg";
import yasminNunesDosSantos from "../../img/yasmin-nunes-dos-santos.jpeg";
import vitorReisSouza from "../../img/vitor-reis-souza.jpeg";

export default function Integrantes() {
  useEffect(() => {
    document.title = "Integrantes - Junttô";
  }, []);

  return (
    <main className="min-h-screen w-full flex-1 bg-[var(--creme)]">
      <section className="w-full px-[3%] py-[3%] max-[992px]:px-[5%] max-[992px]:py-[4%] max-[768px]:px-[5%] max-[768px]:py-[4%] max-[480px]:px-6 max-[480px]:py-10">
        <h1 className="mb-4 text-center text-3xl font-bold text-[var(--azul)] max-[480px]:text-2xl">
          Nossa equipe
        </h1>

        <p className="mx-auto mb-10 max-w-[900px] text-center text-sm leading-relaxed text-[var(--texto)]">
          Conheça as pessoas que fazem parte do Junttô e trabalham juntas para
          aproximar pessoas e fortalecer a comunidade.
        </p>

        <div className="grid grid-cols-1 gap-8 min-[481px]:grid-cols-2 min-[481px]:gap-5 min-[993px]:grid-cols-3 min-[993px]:gap-6">
            
          <CardIntegrante titulo="Felipe" />

          <CardIntegrante
            titulo="Heloisa Costa Pereira"
            info="RM: 572756 | Turma: 1TDSPY"
            imagem={heloisaCostaPereira}
            github="https://github.com/helo0309"
            linkedin="https://www.linkedin.com/in/heloisa-costa-pereira-4a0810381/"
          />

          <CardIntegrante
            titulo="Isabelle Dantas de Araújo"
            info="RM: 570167 | Turma: 1TDSPY"
            imagem={isabelleDantasDeAraujo}
            github="https://github.com/isabellearaujod"
            linkedin="https://www.linkedin.com/in/isabelle-dantas-araujo/"
          />

          <CardIntegrante
            titulo="Vitor Reis Souza"
            info="RM: 573315 | Turma: 1TDSPY"
            imagem={vitorReisSouza}
            github="https://github.com/vtrzxy"
            linkedin="https://www.linkedin.com/in/vi-reis"
          />

          <CardIntegrante
            titulo="Yasmin Nunes dos Santos"
            info="RM: 568618 | Turma: 1TDSPY"
            imagem={yasminNunesDosSantos}
            github="https://github.com/Yasmin5511"
            linkedin="https://www.linkedin.com/in/yasmin-nunes-727202186/"
          />
        </div>
      </section>
    </main>
  );
}
