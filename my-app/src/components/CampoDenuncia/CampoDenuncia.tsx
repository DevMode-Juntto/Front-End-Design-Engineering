import type { ReactNode } from "react";

type CampoDenunciaProps = {
  titulo: string;
  children: ReactNode;
};

export default function CampoDenuncia({
  titulo,
  children,
}: CampoDenunciaProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-semibold text-[var(--azul)]">{titulo}</label>

      {children}
    </div>
  );
}
