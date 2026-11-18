import type { ChangeEvent, ReactNode } from "react";

type CampoAutenticacaoProps = {
  tipo: string;
  placeholder: string;
  icone: ReactNode;
  nome: string;
  required?: boolean;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

export default function CampoAutenticacao({
  tipo,
  placeholder,
  icone,
  nome,
  required = true,
  value,
  onChange,
}: CampoAutenticacaoProps) {
  return (
    <div className="flex h-12 items-center gap-4 rounded-xl border border-gray-300 px-4 shadow-sm transition focus-within:border-[var(--verde)]">
      <span className="shrink-0 text-lg text-[var(--azul)]">{icone}</span>
      <input
        type={tipo}
        name={nome}
        placeholder={placeholder}
        aria-label={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        className="h-full w-full bg-transparent text-sm text-[var(--azul)] outline-none placeholder:text-gray-500"
      />
    </div>
  );
}
