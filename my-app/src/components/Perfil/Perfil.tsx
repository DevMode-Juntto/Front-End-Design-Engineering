import type { ChangeEvent } from "react";

type PerfilProps = {
  titulo: string;
  tipo?: string;
  placeholder: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

export default function Perfil({
  titulo,
  tipo = "text",
  placeholder,
  value,
  onChange,
}: PerfilProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--azul)]">
      {titulo}
      <input
        type={tipo}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 font-normal outline-none transition focus:border-[var(--verde)]"
      />
    </label>
  );
}
