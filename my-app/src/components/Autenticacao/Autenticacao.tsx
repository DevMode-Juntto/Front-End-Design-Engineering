import type { ReactNode } from "react";
import logoPrincipal from "../../img/logo-principal.png";
import imagemLogin from "../../img/login-principal.png";

type AutenticacaoProps = {
  titulo: string;
  subtitulo: string;
  children: ReactNode;
};

export default function Autenticacao({
  titulo,
  subtitulo,
  children,
}: AutenticacaoProps) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="relative flex min-h-[350px] flex-col items-center justify-center overflow-hidden bg-white px-6 py-10 lg:min-h-screen">
        <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[var(--verde)]/80" />

        <div className="absolute -bottom-20 -right-16 h-48 w-48 rounded-full bg-[var(--verde)]/80" />

        <div className="relative z-10 flex flex-col items-center">
          <img
            src={logoPrincipal}
            alt="Logo Junttô"
            className="mb-3 h-20 w-auto object-contain"
          />

          <p className="text-center text-lg font-medium text-[var(--azul)]">
            Ajuda que conecta pessoas
          </p>

          <img
            src={imagemLogin}
            alt="Duas pessoas comemorando com um toque de mãos"
            className="mt-6 w-full max-w-[420px] object-contain"
          />
        </div>
      </section>

      <section className="flex min-h-[500px] items-center justify-center bg-white px-6 py-12 lg:min-h-screen lg:px-12">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-[var(--azul)]">{titulo}</h1>

          <p className="mt-2 text-sm font-medium text-[var(--azul)]">
            {subtitulo}
          </p>

          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
