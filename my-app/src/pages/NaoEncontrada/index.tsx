import { useEffect } from "react";
import { useNavigate } from "react-router";
import Botao from "../../components/Botao/Botao";

export default function NaoEncontrada() {
  const navegar = useNavigate();

  useEffect(() => {
    document.title = "Página não encontrada - Junttô";
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[var(--creme)] px-6 text-center">
      <h1 className="text-4xl font-bold text-[var(--azul)]">Página não encontrada</h1>
      <p className="max-w-md text-[var(--texto)]">
        O endereço que você abriu não existe ou foi removido. Volte para o início e continue ajudando a sua vizinhança.
      </p>
      <Botao texto="Voltar para o início" aoClicar={() => navegar("/home")} />
    </main>
  );
}
