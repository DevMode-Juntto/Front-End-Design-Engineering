type TituloProps = {
    titulo: string;
    subtitulo?: string;
    alinhamento?: "centro" | "esquerda";
};

export default function Titulo({
    titulo,
    subtitulo,
    alinhamento = "centro",
}: TituloProps) {
    return (
        <div
            className={`flex flex-col gap-3 ${alinhamento === "centro"
                    ? "items-center text-center"
                    : "items-start text-left"
                }`}
        >
            <h2 className="text-2xl font-bold text-[var(--azul)] md:text-3xl">
                {titulo}
            </h2>

            <div className="h-1 w-16 rounded-full bg-[var(--verde)]"></div>

            {subtitulo && (
                <p className="max-w-2xl text-base leading-relaxed text-[var(--texto)]">
                    {subtitulo}
                </p>
            )}
        </div>
    );
}
