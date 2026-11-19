import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import LayoutAutenticacao from "../../components/Autenticacao/Autenticacao";
import CampoAutenticacao from "../../components/CampoAutenticacao/CampoAutenticacao";
import BotaoAutenticacao from "../../components/BotaoAutenticacao/BotaoAutenticacao";
import { api } from "../../services/api";

// controla a tela de cadastro
export default function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [maiorDeIdade, setMaiorDeIdade] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    document.title = "Cadastro - Junttô";
  }, []);

  // cria a conta com os dados preenchidos
  async function criarConta(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    if (!maiorDeIdade) {
      setErro("É necessário confirmar que você tem 18 anos ou mais.");
      return;
    }
    setCarregando(true);
    try {
      await api.cadastrar({ nome, email, senha });
      navigate("/login");
    } catch (erroApi) {
      setErro(
        erroApi instanceof Error
          ? erroApi.message
          : "Não foi possível criar a conta.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <LayoutAutenticacao
      titulo="Crie sua conta!"
      subtitulo="Faça parte da comunidade Junttô"
    >
      <form onSubmit={criarConta} className="flex flex-col gap-4">
        <CampoAutenticacao
          tipo="text"
          nome="nome"
          placeholder="Seu nome completo"
          icone={<FaUser />}
          value={nome}
          onChange={(event) => setNome(event.target.value)}
        />
        <CampoAutenticacao
          tipo="email"
          nome="email"
          placeholder="Seu e-mail"
          icone={<FaEnvelope />}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <CampoAutenticacao
          tipo="password"
          nome="senha"
          placeholder="Crie uma senha"
          icone={<FaLock />}
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
        />
        <label className="mt-1 flex items-start gap-3 text-xs leading-relaxed text-[var(--azul)]">
          <input
            type="checkbox"
            checked={maiorDeIdade}
            onChange={(event) => setMaiorDeIdade(event.target.checked)}
            required
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--verde)]"
          />
          Confirmo que tenho 18 anos ou mais e desejo participar do Junttô.
        </label>
        {erro && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {erro}
          </p>
        )}
        <div className="mt-2">
          <BotaoAutenticacao
            texto={carregando ? "Criando..." : "Criar conta"}
          />
        </div>
        <div className="mt-2 text-center text-sm text-[var(--azul)]">
          Já possui uma conta?{" "}
          <Link
            to="/login"
            className="font-bold text-[var(--azul)] transition hover:text-[var(--laranja)]"
          >
            Entrar
          </Link>
        </div>
      </form>
    </LayoutAutenticacao>
  );
}
