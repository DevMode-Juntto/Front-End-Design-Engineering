import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { FaEnvelope, FaLock, FaUsers } from "react-icons/fa";
import Autenticacao from "../../components/Autenticacao/Autenticacao";
import CampoAutenticacao from "../../components/CampoAutenticacao/CampoAutenticacao";
import BotaoAutenticacao from "../../components/BotaoAutenticacao/BotaoAutenticacao";
import { api, salvarSessao } from "../../services/api";

type ContaRapida = {
  nome: string;
  email: string;
  senha: string;
};

// contas usadas p facilitar a demonstração com os professores
const contasRapidas: ContaRapida[] = [
  { nome: "Ana Souza", email: "ana@juntto.local", senha: "123456" },
  { nome: "Bruno Lima", email: "bruno@juntto.local", senha: "123456" },
  { nome: "Carla Mendes", email: "carla@juntto.local", senha: "123456" },
  { nome: "Diego Alves", email: "diego@juntto.local", senha: "123456" },
];

// controla a tela de login e o acesso do usuário
export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarContas, setMostrarContas] = useState(false);

  useEffect(() => {
    document.title = "Login - Junttô";
  }, []);

  // confere os dados e entra na conta
  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      const usuario = await api.login({ email, senha });
      salvarSessao(usuario);
      navigate("/home");
    } catch (erroApi) {
      setErro(
        erroApi instanceof Error ? erroApi.message : "Não foi possível entrar.",
      );
    } finally {
      setCarregando(false);
    }
  }

  // mostra ou esconde os acessos rápidos de demonstração
  function mostrarContasCadastradas() {
    if (mostrarContas) {
      setMostrarContas(false);
      return;
    }
    setErro("");
    setMostrarContas(true);
  }

  // entra direto em uma conta de demonstração
  async function entrarComConta(conta: ContaRapida) {
    setErro("");
    setCarregando(true);
    try {
      const usuario = await api.login({
        email: conta.email,
        senha: conta.senha,
      });
      salvarSessao(usuario);
      navigate("/home");
    } catch (erroApi) {
      setErro(
        erroApi instanceof Error
          ? erroApi.message
          : `Não foi possível entrar como ${conta.nome}.`,
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Autenticacao titulo="Bem-vindo!" subtitulo="Entre na sua conta">
      <form onSubmit={entrar} className="flex flex-col gap-3">
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
          placeholder="Sua senha"
          icone={<FaLock />}
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
        />
        <button
          type="button"
          onClick={() => void mostrarContasCadastradas()}
          className="flex items-center justify-center gap-2 rounded-lg border border-[var(--azul)]/20 px-3 py-2 text-sm font-semibold text-[var(--azul)] transition hover:bg-[var(--creme)]"
        >
          <FaUsers />
          {mostrarContas
            ? "Ocultar contas de demonstração"
            : "Entrar com uma conta cadastrada"}
        </button>
        {mostrarContas && (
          <div className="rounded-xl border border-gray-200 bg-[var(--creme)] p-3">
            <p className="mb-2 text-xs text-gray-600">
              Escolha uma conta para entrar automaticamente na demonstração.
            </p>
            <div className="flex max-h-40 flex-col gap-2 overflow-y-auto">
              {contasRapidas.map((conta) => (
                <button
                  key={conta.email}
                  type="button"
                  onClick={() => void entrarComConta(conta)}
                  disabled={carregando}
                  className="rounded-lg bg-white px-3 py-2 text-left text-sm text-[var(--azul)] transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="block font-bold">
                    Entrar como {conta.nome}
                  </span>
                  <span className="block text-xs text-gray-500">
                    acesso de demonstração
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        {erro && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {erro}
          </p>
        )}
        <div className="mt-2">
          <BotaoAutenticacao texto={carregando ? "Entrando..." : "Entrar"} />
        </div>
        <div className="mt-4 flex items-center justify-start">
          <Link
            to="/cadastro"
            className="text-sm font-bold text-[var(--azul)] transition hover:text-[var(--laranja)]"
          >
            Criar conta
          </Link>
        </div>
      </form>
    </Autenticacao>
  );
}
