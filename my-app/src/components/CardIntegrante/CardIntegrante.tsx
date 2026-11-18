import { FaGithub, FaLinkedin } from "react-icons/fa";

type CardIntegranteProps = {
  titulo: string;
  info?: string;
  descricao?: string;
  imagem?: string;
  github?: string;
  linkedin?: string;
};

export default function CardIntegrante({
  titulo,
  info,
  descricao,
  imagem,
  github,
  linkedin,
}: CardIntegranteProps) {
  return (
    <div className="flex h-full flex-col items-center rounded-2xl border border-[var(--cinza)] bg-[var(--branco)] p-6 text-center shadow-md transition hover:-translate-y-1 hover:shadow-lg">
      {imagem && (
        <img
          src={imagem}
          alt={`Foto de ${titulo}`}
          className="mb-5 h-36 w-36 rounded-full border-4 border-[var(--verde)] object-cover"
        />
      )}

      <h2 className="text-xl font-bold text-[var(--azul)]">{titulo}</h2>

      {info && (
        <p className="mt-2 text-sm font-medium text-[var(--verde)]">{info}</p>
      )}

      {descricao && (
        <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--texto)]">
          {descricao}
        </p>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {github && (
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`GitHub de ${titulo}`}
            className="flex items-center gap-2 rounded-lg bg-[var(--azul)] px-5 py-2 font-semibold text-[var(--branco)] transition hover:opacity-90"
          >
            <FaGithub size={20} />
            GitHub
          </a>
        )}

        {linkedin && (
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`LinkedIn de ${titulo}`}
            className="flex items-center gap-2 rounded-lg bg-[var(--verde)] px-5 py-2 font-semibold text-[var(--branco)] transition hover:opacity-90"
          >
            <FaLinkedin size={20} />
            LinkedIn
          </a>
        )}
      </div>
    </div>
  );
}
