import {
  FaHandsHelping,
  FaHandHoldingHeart,
  FaUsers,
  FaLightbulb,
  FaQuestionCircle,
  FaEnvelope,
  FaHome,
  FaClipboardList,
  FaHistory,
  FaUser,
  FaCreditCard,
  FaExclamationTriangle,
  FaBell,
  FaLock,
} from "react-icons/fa";

import Botao from "../../components/Botao/Botao";
import Card from "../../components/Card/Card";
import Titulo from "../../components/Titulo/Titulo";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--creme)]">
      <section className="flex flex-col items-center justify-center gap-6 px-6 py-20 text-center md:py-28">
        <span className="rounded-full bg-[var(--verde)]/10 px-5 py-2 font-semibold text-[var(--verde)]">
          Conectando pessoas e comunidades
        </span>

        <h1 className="max-w-4xl text-4xl font-bold leading-tight text-[var(--azul)] md:text-6xl">
          Juntos podemos fazer a diferença!
        </h1>

        <p className="max-w-2xl text-lg leading-relaxed text-[var(--texto)]">
          O Junttô aproxima pessoas que precisam de ajuda de quem pode oferecer
          apoio. Uma maneira simples de fortalecer a comunidade e transformar
          pequenas atitudes em grandes mudanças
        </p>

        <a href="#conheca">
          <Botao texto="Conheça o projeto" tamanho="grande" />
        </a>
      </section>

      <section className="bg-[var(--branco)] px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <Titulo
            titulo="Como funciona o Junttô?"
            subtitulo="Uma rede de apoio que conecta pessoas e facilita o dia a dia"
          />

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <Card
              icone={<FaHandHoldingHeart />}
              titulo="Peça ajuda"
              descricao="Encontre pessoas disponíveis para ajudar com suas necessidades do dia a dia"
            />

            <Card
              icone={<FaHandsHelping />}
              titulo="Ofereça ajuda"
              descricao="Compartilhe suas habilidades, ofereça serviços e ajude outras pessoas"
            />

            <Card
              icone={<FaUsers />}
              titulo="Fortaleça sua comunidade"
              descricao="Aproxime vizinhos, incentive a colaboração e valorize o comércio local"
            />
          </div>
        </div>
      </section>

      <section id="conheca" className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <Titulo
            titulo="Conheça mais sobre nós"
            subtitulo="Explore o projeto, conheça nossa equipe e descubra como fazemos a diferença"
          />

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card
              icone={<FaUsers />}
              titulo="Integrantes"
              descricao="Conheça o time por trás do desenvolvimento do Junttô"
            >
              <a href="/integrantes">
                <Botao texto="Conhecer" tipo="secundario" />
              </a>
            </Card>

            <Card
              icone={<FaLightbulb />}
              titulo="Sobre o projeto"
              descricao="Entenda nossa ideia, nossos objetivos e o impacto que queremos gerar"
            >
              <a href="/sobre">
                <Botao texto="Saiba mais" tipo="secundario" />
              </a>
            </Card>

            <Card
              icone={<FaQuestionCircle />}
              titulo="Dúvidas frequentes"
              descricao="Encontre respostas para as principais dúvidas sobre o projeto "
            >
              <a href="/faq">
                <Botao texto="Ver dúvidas" tipo="secundario" />
              </a>
            </Card>

            <Card
              icone={<FaEnvelope />}
              titulo="Contato"
              descricao="Entre em contato com nossa equipe e converse conosco."
            >
              <a href="/contato">
                <Botao texto="Fale conosco" tipo="secundario" />
              </a>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-[var(--branco)] px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border-2 border-dashed border-[var(--laranja)]/50 bg-[var(--creme)] p-6 text-center sm:p-10">
            <span className="inline-flex rounded-full bg-[var(--laranja)]/15 px-4 py-2 text-sm font-bold uppercase tracking-wide text-[var(--laranja)]">
              Área de demonstração
            </span>
            <h2 className="mt-4 text-3xl font-bold text-[var(--azul)]">
              Protótipos navegáveis do Junttô
            </h2>
            <p className="mx-auto mt-3 max-w-3xl leading-relaxed text-[var(--texto)]">
              Estas páginas são protótipos do projeto e servem para demonstrar
              os fluxos que estão sendo desenvolvidos. Algumas funções dependem
              de login e da API hospedada para funcionar completamente.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card
              icone={<FaHome />}
              titulo="HomePrototipo"
              descricao="Página principal do usuário, com oportunidades de ajuda, categorias recomendadas, notificações e ajudas em processo."
            >
              <a href="/home-prototipo">
                <Botao texto="Abrir protótipo" tipo="secundario" />
              </a>
            </Card>
            <Card
              icone={<FaClipboardList />}
              titulo="Publicar pedido"
              descricao="Permite publicar um pedido de ajuda, escolher categoria, informar valor, data, horário e localização. Também permite editar pedidos abertos."
            >
              <a href="/publicar-pedido">
                <Botao texto="Abrir protótipo" tipo="secundario" />
              </a>
            </Card>
            <Card
              icone={<FaHistory />}
              titulo="Histórico"
              descricao="Mostra serviços realizados, pedidos publicados, candidaturas, pagamentos, comentários e denúncias do usuário."
            >
              <a href="/historico">
                <Botao texto="Abrir protótipo" tipo="secundario" />
              </a>
            </Card>
            <Card
              icone={<FaUser />}
              titulo="Perfil"
              descricao="Exibe nome, foto, categorias e avaliações recebidas"
            >
              <a href="/perfil">
                <Botao texto="Abrir protótipo" tipo="secundario" />
              </a>
            </Card>
            <Card
              icone={<FaCreditCard />}
              titulo="Finalização"
              descricao="Fluxo em que o solicitante registra o pagamento enviado e comenta sobre o prestador após a realização da ajuda."
            >
              <a href="/finalizacao">
                <Botao texto="Abrir protótipo" tipo="secundario" />
              </a>
            </Card>
            <Card
              icone={<FaBell />}
              titulo="Confirmação de recebimento"
              descricao="Fluxo em que o prestador confirma o pagamento recebido e comenta sobre o solicitante."
            >
              <a href="/confirmacao-recebimento">
                <Botao texto="Abrir protótipo" tipo="secundario" />
              </a>
            </Card>
            <Card
              icone={<FaExclamationTriangle />}
              titulo="Denúncias"
              descricao="Permite denunciar outro usuário e acompanhar, editar ou retirar denúncias abertas pelo Histórico."
            >
              <a href="/denuncia">
                <Botao texto="Abrir protótipo" tipo="secundario" />
              </a>
            </Card>
            <Card
              icone={<FaLock />}
              titulo="Painel administrador"
              descricao="Área administrativa de protótipo para gerenciar usuários, categorias, pedidos, denúncias e enviar avisos."
            >
              <a href="/admin">
                <Botao texto="Abrir protótipo" tipo="secundario" />
              </a>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-[var(--azul)] px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-[var(--branco)]">
          Pequenas ajudas criam grandes mudanças!
        </h2>

        <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-[var(--branco)]">
          Acreditamos que uma comunidade mais unida começa quando as pessoas
          podem contar umas com as outras
        </p>

        <a href="/sobre" className="mt-8 inline-block">
          <Botao texto="Saiba mais" tamanho="grande" />
        </a>
      </section>
    </div>
  );
}
