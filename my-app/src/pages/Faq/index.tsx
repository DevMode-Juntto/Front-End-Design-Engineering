import { useEffect } from "react";
import { Link } from "react-router";
import { FaQuestionCircle } from "react-icons/fa";
import CardPergunta from "../../components/CardPergunta/CardPergunta";

export default function FAQ() {
  useEffect(() => {
    document.title = "Perguntas Frequentes - Junttô";
  }, []);

  return (
    <main className="min-h-screen bg-[var(--creme)] px-6 py-16">
      <section className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <FaQuestionCircle className="mx-auto text-5xl text-[var(--verde)]" />

          <h1 className="mt-5 text-3xl font-bold text-[var(--azul)] md:text-4xl">
            Perguntas frequentes
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[var(--texto)]">
            Ficou com alguma dúvida sobre o Junttô? Confira as respostas para
            conhecer melhor nossa plataforma.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <CardPergunta
            pergunta="O que é o Junttô?"
            resposta="O Junttô é uma plataforma que conecta pessoas de uma mesma região, permitindo que moradores solicitem ou ofereçam ajuda em atividades do dia a dia."
          />

          <CardPergunta
            pergunta="Quem pode utilizar a plataforma?"
            resposta="Qualquer pessoa maior de 18 anos pode criar uma conta e participar da comunidade, tanto para solicitar quanto para oferecer ajuda."
          />

          <CardPergunta
            pergunta="Como posso solicitar ajuda?"
            resposta="Você poderá criar um pedido informando o título, a categoria, a descrição, o valor, a data, o horário e a localização da atividade."
          />

          <CardPergunta
            pergunta="Posso oferecer ajuda e também solicitar serviços?"
            resposta="Sim! A mesma conta pode ser utilizada para solicitar ajuda e oferecer serviços para outras pessoas da comunidade."
          />

          <CardPergunta
            pergunta="Todos os serviços são pagos?"
            resposta="Não. A plataforma permite tanto atividades gratuitas quanto serviços remunerados, de acordo com a proposta de cada pedido."
          />

          <CardPergunta
            pergunta="Pequenos produtores podem participar?"
            resposta="Sim! Pequenos produtores e comerciantes locais poderão divulgar seus produtos e serviços, alcançando pessoas da própria região."
          />

          <CardPergunta
            pergunta="Como funcionam as parcerias com universidades?"
            resposta="Estudantes poderão participar de atividades comunitárias vinculadas a projetos de extensão universitária, desde que sejam aprovadas pelas instituições."
          />
        </div>

        <div className="mt-12 rounded-2xl bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-[var(--azul)]">
            Ainda tem dúvidas?
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-[var(--texto)]">
            Entre em contato com nossa equipe. Estamos aqui para ajudar!
          </p>

          <Link
            to="/contato"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-[var(--verde)] px-7 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Fale conosco
          </Link>
        </div>
      </section>
    </main>
  );
}