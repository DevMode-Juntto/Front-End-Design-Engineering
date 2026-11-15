import type { ReactNode } from "react";

type CardProps = {
    icone: ReactNode;
    titulo: String;
    descricao: String;
    children?: ReactNode;
};

export default function Card({
    titulo,
    descricao,
    icone,
    children,
}: CardProps) {
    return (
        <div className="flex h-full flex-col items-center rounded-2xl bg-[var(--branco)] p-6 text-center shadow-md transition hover:-translate-y-1 hover:shadow-lg">
            {icone && (
                <div className="mb-4 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--creme)] text-3xl">
                    {icone}
                </div>
            )}

            <h3 className="mb-3 min-h-14 flex items-center justify-center text-xl font-bold text-[var(--azul)]">
                {titulo}
            </h3>

            <p className="flex-1 leading-relaxed text-[var(--texto)]">{descricao}</p>

            {children && (
                <div className="mt-auto flex w-full justify-center pt-5">
                    {children}
                </div>
            )}
        </div>
    );
}     