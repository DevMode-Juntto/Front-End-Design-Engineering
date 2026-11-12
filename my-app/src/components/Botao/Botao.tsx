type BotaoProps = {
    texto: string;
    aoClicar?: () => void;
    tipo?: "principal" | "secundario";
    tamanho?: "normal" | "grande";
    desabilitado?: boolean;
    type?: "button" | "submit" | "reset";
};

export default function Botao({
    texto,
    aoClicar,
    tipo = "principal",
    tamanho = "normal",
    desabilitado = false,
    type = "button",
}: BotaoProps) {
    const cores =
        tipo === "principal"
            ? "bg-[var(--verde)] text-[var(--branco)] hover:opacity-90"
            : "border-2 border-[var(--azul)] text-[var(--azul)] hover:bg-[var(--cinza)]";

    const tamanhoBotao =
        tamanho === "grande" ? "px-8 py-3 text-lg" : "px-6 py-2 text-base";

    return (
        <button
            type={type}
            onClick={aoClicar}
            disabled={desabilitado}
            className={`rounded-xl font-semibold transition ${cores} ${tamanhoBotao} ${desabilitado ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                }`}
        >
            {texto}
        </button>
    );
}
