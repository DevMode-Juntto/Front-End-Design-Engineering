type BotaoAutenticacaoProps = {
  texto: string;
};

export default function BotaoAutenticacao({ texto }: BotaoAutenticacaoProps) {
  return (
    <button
      type="submit"
      className="flex h-12 w-full items-center justify-center rounded-xl bg-[var(--laranja)] font-bold text-white shadow-sm transition hover:brightness-95"
    >
      {texto}
    </button>
  );
}
