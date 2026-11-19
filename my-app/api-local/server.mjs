import http from "node:http";
const PORT = Number(process.env.PORT || 8080);

const usuarios = [
  {
    id: 1,
    nome: "Ana Souza",
    email: "ana@juntto.local",
    senha: "123456",
    bairro: "Bela Vista",
    tags: ["Montagem", "Compras"],
  },
  {
    id: 2,
    nome: "Bruno Lima",
    email: "bruno@juntto.local",
    senha: "123456",
    bairro: "Paraíso",
    tags: ["Montagem", "Transporte"],
  },
  {
    id: 3,
    nome: "Carla Mendes",
    email: "carla@juntto.local",
    senha: "123456",
    bairro: "Liberdade",
    tags: ["Compras", "Cuidados"],
  },
];

const categorias = [
  { id: 1, nome: "Montagem", descricao: "Ajuda para montar móveis e objetos." },
  {
    id: 2,
    nome: "Compras",
    descricao: "Ajuda para comprar ou buscar produtos.",
  },
  {
    id: 3,
    nome: "Transporte",
    descricao: "Ajuda com deslocamentos e entregas.",
  },
  {
    id: 4,
    nome: "Cuidados",
    descricao: "Ajuda e companhia em tarefas do dia a dia.",
  },
];

const pedidos = [
  {
    id: 1,
    titulo: "Montar uma prateleira",
    descricao: "Preciso de ajuda para montar uma prateleira pequena.",
    categoriaId: 1,
    bairro: "Bela Vista",
    data: "2026-11-20T14:00",
    valor: 50,
    status: "ABERTO",
    solicitanteId: 1,
  },
  {
    id: 2,
    titulo: "Buscar compras no mercado",
    descricao: "Preciso buscar algumas compras perto de casa.",
    categoriaId: 2,
    bairro: "Paraíso",
    data: "2026-11-21T10:00",
    valor: 30,
    status: "ABERTO",
    solicitanteId: 1,
  },
  {
    id: 3,
    titulo: "Ajudar com compras",
    descricao: "Preciso de ajuda para buscar alguns itens no mercado.",
    categoriaId: 2,
    bairro: "Liberdade",
    data: "2026-11-22T09:00",
    valor: 35,
    status: "ABERTO",
    solicitanteId: 2,
  },
];

const solicitacoes = [
  { id: 1, pedidoId: 1, prestadorId: 2, status: "PENDENTE" },
  { id: 2, pedidoId: 1, prestadorId: 3, status: "PENDENTE" },
];

const notificacoes = [
  {
    id: 1,
    usuarioId: 1,
    pedidoId: 1,
    solicitacaoId: 1,
    tipo: "NOVA_SOLICITACAO",
    mensagem: "Bruno Lima aceitou sua solicitação de ajuda.",
    lida: false,
  },
  {
    id: 2,
    usuarioId: 1,
    pedidoId: 1,
    solicitacaoId: 2,
    tipo: "NOVA_SOLICITACAO",
    mensagem: "Carla Mendes aceitou sua solicitação de ajuda.",
    lida: false,
  },
];

const comentarios = [];
const pagamentos = [];
const denuncias = [];
let proximoUsuarioId = 4;
let proximoPedidoId = 4;
let proximaSolicitacaoId = 3;
let proximaNotificacaoId = 3;
let proximoComentarioId = 1;
let proximoPagamentoId = 1;
let proximaDenunciaId = 1;

function normalizarEmail(email) {
  return String(email || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function usuarioPublico(usuario) {
  if (!usuario) return null;
  const { senha: _senha, ...publico } = usuario;
  return publico;
}

function pedidoCompleto(pedido) {
  const categoria = categorias.find(
    (item) => String(item.id) === String(pedido.categoriaId),
  );
  return {
    ...pedido,
    categoria: categoria || pedido.categoria,
    solicitante: usuarioPublico(
      usuarios.find((item) => item.id === pedido.solicitanteId),
    ),
    prestador: usuarioPublico(
      usuarios.find((item) => item.id === pedido.prestadorId),
    ),
  };
}

function solicitacaoCompleta(solicitacao) {
  return {
    ...solicitacao,
    pedido: pedidoCompleto(
      pedidos.find((item) => String(item.id) === String(solicitacao.pedidoId)),
    ),
    prestador: usuarioPublico(
      usuarios.find(
        (item) => String(item.id) === String(solicitacao.prestadorId),
      ),
    ),
  };
}

function tokenPara(usuario) {
  return `token-local-${usuario.id}`;
}

function usuarioDoRequest(request, url) {
  const bearer = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  const tokenId = bearer?.startsWith("token-local-")
    ? bearer.replace("token-local-", "")
    : null;
  const queryId = url.searchParams.get("usuarioId");
  const id = tokenId || queryId;
  return usuarios.find((item) => String(item.id) === String(id)) || null;
}

function json(resposta, status, dados) {
  resposta.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  });
  resposta.end(JSON.stringify(dados));
}

function semConteudo(resposta) {
  resposta.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  });
  resposta.end();
}

async function corpo(request) {
  let texto = "";
  for await (const parte of request) texto += parte;
  if (!texto) return {};
  try {
    return JSON.parse(texto);
  } catch {
    return {};
  }
}

function criarNotificacao(dados) {
  const notificacao = { id: proximaNotificacaoId++, lida: false, ...dados };
  notificacoes.push(notificacao);
  return notificacao;
}

async function tratar(request, resposta) {
  if (request.method === "OPTIONS") return semConteudo(resposta);
  const url = new URL(
    request.url,
    `http://${request.headers.host || "localhost"}`,
  );
  const caminho = url.pathname.replace(/\/$/, "") || "/";
  const partes = caminho.split("/").filter(Boolean);
  const dados = ["POST", "PUT", "PATCH"].includes(request.method)
    ? await corpo(request)
    : {};
  const usuario = usuarioDoRequest(request, url);

  if (request.method === "GET" && caminho === "/health")
    return json(resposta, 200, { status: "ok", servico: "junttô-api-local" });

  if (request.method === "POST" && caminho === "/login") {
    const encontrado = usuarios.find(
      (item) =>
        normalizarEmail(item.email) === normalizarEmail(dados.email) &&
        item.senha === dados.senha,
    );
    if (!encontrado)
      return json(resposta, 401, { mensagem: "E-mail ou senha inválidos." });
    return json(resposta, 200, {
      ...usuarioPublico(encontrado),
      token: tokenPara(encontrado),
    });
  }

  if (
    request.method === "POST" &&
    (caminho === "/cadastro" || caminho === "/usuarios")
  ) {
    if (
      usuarios.some(
        (item) => normalizarEmail(item.email) === normalizarEmail(dados.email),
      )
    )
      return json(resposta, 409, { mensagem: "E-mail já cadastrado." });
    const novo = {
      id: proximoUsuarioId++,
      nome: dados.nome || "Novo usuário",
      email: dados.email || "",
      senha: dados.senha || "",
      bairro: dados.bairro || "",
      tags: [],
    };
    usuarios.push(novo);
    return json(resposta, 201, {
      ...usuarioPublico(novo),
      token: tokenPara(novo),
    });
  }

  if (request.method === "GET" && caminho === "/usuarios")
    return json(resposta, 200, usuarios.map(usuarioPublico));
  if (partes[0] === "usuarios" && partes.length === 2) {
    const id = Number(partes[1]);
    const encontrado = usuarios.find((item) => item.id === id);
    if (!encontrado)
      return json(resposta, 404, { mensagem: "Usuário não encontrado." });
    if (request.method === "GET")
      return json(resposta, 200, usuarioPublico(encontrado));
    if (request.method === "PUT") {
      Object.assign(encontrado, {
        nome: dados.nome ?? encontrado.nome,
        email: dados.email ?? encontrado.email,
        bairro: dados.bairro ?? encontrado.bairro,
      });
      return json(resposta, 200, usuarioPublico(encontrado));
    }
    if (request.method === "DELETE") {
      usuarios.splice(usuarios.indexOf(encontrado), 1);
      return semConteudo(resposta);
    }
  }
  if (partes[0] === "usuarios" && partes[2] === "tags" && partes.length === 3) {
    const encontrado = usuarios.find((item) => item.id === Number(partes[1]));
    if (!encontrado)
      return json(resposta, 404, { mensagem: "Usuário não encontrado." });
    if (request.method === "GET")
      return json(resposta, 200, encontrado.tags || []);
    if (request.method === "PUT") {
      encontrado.tags = Array.isArray(dados)
        ? dados
        : Array.isArray(dados.tags)
          ? dados.tags
          : [];
      return json(resposta, 200, encontrado.tags);
    }
  }
  if (
    partes[0] === "usuarios" &&
    partes.length === 3 &&
    partes[2] === "desativar" &&
    request.method === "PATCH"
  ) {
    const encontrado = usuarios.find((item) => item.id === Number(partes[1]));
    if (!encontrado)
      return json(resposta, 404, { mensagem: "Usuário não encontrado." });
    encontrado.status = "INATIVO";
    return json(resposta, 200, usuarioPublico(encontrado));
  }
  if (
    partes[0] === "usuarios" &&
    partes.length === 3 &&
    partes[2] === "status" &&
    request.method === "PATCH"
  ) {
    const encontrado = usuarios.find((item) => item.id === Number(partes[1]));
    if (!encontrado)
      return json(resposta, 404, { mensagem: "Usuário não encontrado." });
    encontrado.status = dados.status || encontrado.status || "ATIVO";
    return json(resposta, 200, usuarioPublico(encontrado));
  }
  if (
    partes[0] === "usuarios" &&
    partes[2] === "pedidos" &&
    request.method === "GET"
  ) {
    const id = Number(partes[1]);
    const papel = url.searchParams.get("papel");
    const lista = pedidos.filter((pedido) =>
      papel === "PRESTADOR"
        ? String(pedido.prestadorId) === String(id)
        : String(pedido.solicitanteId) === String(id),
    );
    return json(resposta, 200, lista.map(pedidoCompleto));
  }

  if (caminho === "/categorias" && request.method === "GET")
    return json(resposta, 200, categorias);
  if (caminho === "/categorias" && request.method === "POST") {
    const nova = {
      id: Math.max(...categorias.map((item) => Number(item.id)), 0) + 1,
      nome: dados.nome || "Nova categoria",
      descricao: dados.descricao || "",
    };
    categorias.push(nova);
    return json(resposta, 201, nova);
  }
  if (
    partes[0] === "categorias" &&
    partes.length === 2 &&
    request.method === "PUT"
  ) {
    const categoria = categorias.find(
      (item) => String(item.id) === String(partes[1]),
    );
    if (!categoria)
      return json(resposta, 404, { mensagem: "Categoria não encontrada." });
    Object.assign(categoria, {
      nome: dados.nome ?? categoria.nome,
      descricao: dados.descricao ?? categoria.descricao,
    });
    return json(resposta, 200, categoria);
  }
  if (
    partes[0] === "categorias" &&
    partes.length === 2 &&
    request.method === "DELETE"
  ) {
    const categoria = categorias.find(
      (item) => String(item.id) === String(partes[1]),
    );
    if (!categoria)
      return json(resposta, 404, { mensagem: "Categoria não encontrada." });
    categorias.splice(categorias.indexOf(categoria), 1);
    return semConteudo(resposta);
  }
  if (caminho === "/categorias" && request.method === "PUT") {
    const categoria = categorias.find(
      (item) => String(item.id) === String(dados.id),
    );
    if (!categoria)
      return json(resposta, 404, { mensagem: "Categoria não encontrada." });
    Object.assign(categoria, {
      nome: dados.nome ?? categoria.nome,
      descricao: dados.descricao ?? categoria.descricao,
    });
    return json(resposta, 200, categoria);
  }
  if (caminho === "/categorias" && request.method === "DELETE") {
    const categoria = categorias.find(
      (item) => String(item.id) === String(dados.id),
    );
    if (!categoria)
      return json(resposta, 404, { mensagem: "Categoria não encontrada." });
    categorias.splice(categorias.indexOf(categoria), 1);
    return semConteudo(resposta);
  }
  if (
    request.method === "GET" &&
    partes[0] === "categorias" &&
    partes.length === 2
  )
    return json(
      resposta,
      200,
      categorias.find((item) => String(item.id) === partes[1]) || {
        id: Number(partes[1]),
        nome: "Outros",
        descricao: "",
      },
    );

  if (request.method === "GET" && caminho === "/pedidos") {
    let lista = pedidos;
    const categoriaId = url.searchParams.get("categoria");
    const bairro = url.searchParams.get("bairro");
    if (categoriaId)
      lista = lista.filter((item) => String(item.categoriaId) === categoriaId);
    if (bairro)
      lista = lista.filter((item) =>
        item.bairro?.toLowerCase().includes(bairro.toLowerCase()),
      );
    return json(
      resposta,
      200,
      lista.filter((item) => item.status === "ABERTO").map(pedidoCompleto),
    );
  }
  if (request.method === "POST" && caminho === "/pedidos") {
    const novo = {
      id: proximoPedidoId++,
      ...dados,
      categoriaId: Number(dados.categoriaId),
      valor: Number(dados.valor || 0),
      solicitanteId: usuario?.id || Number(dados.solicitanteId || 1),
      status: "ABERTO",
    };
    pedidos.push(novo);
    return json(resposta, 201, pedidoCompleto(novo));
  }
  if (partes[0] === "pedidos" && partes.length === 2) {
    const pedido = pedidos.find((item) => String(item.id) === partes[1]);
    if (!pedido)
      return json(resposta, 404, { mensagem: "Pedido não encontrado." });
    if (request.method === "GET")
      return json(resposta, 200, pedidoCompleto(pedido));
    if (request.method === "PUT") {
      Object.assign(pedido, dados);
      return json(resposta, 200, pedidoCompleto(pedido));
    }
    if (request.method === "DELETE") {
      pedidos.splice(pedidos.indexOf(pedido), 1);
      return semConteudo(resposta);
    }
  }

  if (
    partes[0] === "pedidos" &&
    ["aceitar", "aceites"].includes(partes[2]) &&
    request.method === "POST"
  ) {
    const pedido = pedidos.find((item) => String(item.id) === partes[1]);
    if (!pedido)
      return json(resposta, 404, { mensagem: "Pedido não encontrado." });
    const prestador = usuario || usuarios.find((item) => item.id === 2);
    if (!prestador || prestador.id === pedido.solicitanteId)
      return json(resposta, 403, {
        mensagem: "Apenas outro usuário pode aceitar o pedido.",
      });
    let solicitacao = solicitacoes.find(
      (item) =>
        item.pedidoId === pedido.id && item.prestadorId === prestador.id,
    );
    if (!solicitacao) {
      solicitacao = {
        id: proximaSolicitacaoId++,
        pedidoId: pedido.id,
        prestadorId: prestador.id,
        status: "PENDENTE",
      };
      solicitacoes.push(solicitacao);
    }
    criarNotificacao({
      usuarioId: pedido.solicitanteId,
      pedidoId: pedido.id,
      solicitacaoId: solicitacao.id,
      prestadorId: prestador.id,
      prestador: usuarioPublico(prestador),
      tipo: "NOVA_SOLICITACAO",
      mensagem: `${prestador.nome} aceitou sua solicitação de ajuda.`,
    });
    return json(resposta, 200, pedidoCompleto(pedido));
  }
  if (
    partes[0] === "pedidos" &&
    partes[2] === "status" &&
    request.method === "PATCH"
  ) {
    const pedido = pedidos.find((item) => String(item.id) === partes[1]);
    if (!pedido)
      return json(resposta, 404, { mensagem: "Pedido não encontrado." });
    pedido.status = dados.status || pedido.status;
    return json(resposta, 200, pedidoCompleto(pedido));
  }
  if (
    partes[0] === "pedidos" &&
    partes[2] === "remover" &&
    request.method === "PATCH"
  ) {
    const pedido = pedidos.find((item) => String(item.id) === partes[1]);
    if (!pedido)
      return json(resposta, 404, { mensagem: "Pedido não encontrado." });
    pedidos.splice(pedidos.indexOf(pedido), 1);
    return semConteudo(resposta);
  }

  if (
    partes[0] === "pedidos" &&
    ["solicitacoes", "aceites"].includes(partes[2]) &&
    partes.length === 3 &&
    request.method === "GET"
  ) {
    const pedidoId = Number(partes[1]);
    return json(
      resposta,
      200,
      solicitacoes
        .filter((item) => item.pedidoId === pedidoId)
        .map(solicitacaoCompleta),
    );
  }
  if (
    partes[0] === "pedidos" &&
    ["solicitacoes", "aceites"].includes(partes[2]) &&
    partes.length === 4
  ) {
    const solicitacao = solicitacoes.find(
      (item) =>
        item.pedidoId === Number(partes[1]) && item.id === Number(partes[3]),
    );
    if (!solicitacao)
      return json(resposta, 404, { mensagem: "Solicitação não encontrada." });
    if (request.method === "GET")
      return json(resposta, 200, solicitacaoCompleta(solicitacao));
    if (request.method === "PUT") {
      if (
        dados.status === "ACEITA" &&
        solicitacoes.some(
          (item) =>
            item.pedidoId === solicitacao.pedidoId &&
            item.id !== solicitacao.id &&
            item.status === "ACEITA",
        )
      ) {
        return json(resposta, 409, {
          mensagem: "Este pedido já possui um prestador escolhido.",
        });
      }
      solicitacao.status = dados.status || solicitacao.status;
      const pedido = pedidos.find((item) => item.id === solicitacao.pedidoId);
      if (solicitacao.status === "ACEITA" && pedido) {
        pedido.prestadorId = solicitacao.prestadorId;
        pedido.status = "EM_ANDAMENTO";
        solicitacoes
          .filter(
            (item) => item.pedidoId === pedido.id && item.id !== solicitacao.id,
          )
          .forEach((item) => {
            item.status = "RECUSADA";
            criarNotificacao({
              usuarioId: item.prestadorId,
              pedidoId: pedido.id,
              solicitacaoId: item.id,
              tipo: "SOLICITACAO_RECUSADA",
              mensagem: "Outra pessoa foi escolhida para esta ajuda.",
            });
          });
        criarNotificacao({
          usuarioId: solicitacao.prestadorId,
          pedidoId: pedido.id,
          solicitacaoId: solicitacao.id,
          tipo: "SOLICITACAO_ACEITA",
          mensagem:
            "Sua solicitação foi aceita. Uma nova conversa foi aberta. +1",
        });
      }
      return json(resposta, 200, solicitacaoCompleta(solicitacao));
    }
  }

  if (request.method === "GET" && caminho === "/aceites") {
    const usuarioId = url.searchParams.get("usuarioId");
    return json(
      resposta,
      200,
      solicitacoes
        .filter(
          (item) =>
            !usuarioId || String(item.prestadorId) === String(usuarioId),
        )
        .map(solicitacaoCompleta),
    );
  }

  if (partes[0] === "aceites" && partes.length === 2) {
    const solicitacao = solicitacoes.find(
      (item) => String(item.id) === partes[1],
    );
    if (!solicitacao)
      return json(resposta, 404, { mensagem: "Aceite não encontrado." });
    if (request.method === "GET")
      return json(resposta, 200, solicitacaoCompleta(solicitacao));
    if (request.method === "DELETE") {
      solicitacoes.splice(solicitacoes.indexOf(solicitacao), 1);
      return semConteudo(resposta);
    }
    if (request.method === "PUT") {
      solicitacao.observacao = dados.observacao ?? solicitacao.observacao;
      const escolherPrestador =
        dados.observacao === "Prestador escolhido pelo solicitante.";
      if (
        escolherPrestador &&
        solicitacoes.some(
          (item) =>
            item.pedidoId === solicitacao.pedidoId &&
            item.id !== solicitacao.id &&
            item.status === "ACEITA",
        )
      )
        return json(resposta, 409, {
          mensagem: "Este pedido já possui um prestador escolhido.",
        });
      const pedido = pedidos.find((item) => item.id === solicitacao.pedidoId);
      if (escolherPrestador && pedido) {
        solicitacao.status = "ACEITA";
        pedido.prestadorId = solicitacao.prestadorId;
        pedido.status = "EM_ANDAMENTO";
        solicitacoes
          .filter(
            (item) => item.pedidoId === pedido.id && item.id !== solicitacao.id,
          )
          .forEach((item) => {
            item.status = "RECUSADA";
            criarNotificacao({
              usuarioId: item.prestadorId,
              pedidoId: pedido.id,
              solicitacaoId: item.id,
              tipo: "SOLICITACAO_RECUSADA",
              mensagem: "Outra pessoa foi escolhida para esta ajuda.",
            });
          });
        criarNotificacao({
          usuarioId: solicitacao.prestadorId,
          pedidoId: pedido.id,
          solicitacaoId: solicitacao.id,
          tipo: "SOLICITACAO_ACEITA",
          mensagem:
            "Sua solicitação foi aceita. Uma nova conversa foi aberta. +1",
        });
      }
      return json(resposta, 200, solicitacaoCompleta(solicitacao));
    }
  }

  if (
    partes[0] === "pedidos" &&
    partes[2] === "pagamento" &&
    partes.length === 3 &&
    request.method === "POST"
  ) {
    const pedido = pedidos.find((item) => String(item.id) === partes[1]);
    if (!pedido)
      return json(resposta, 404, { mensagem: "Pedido não encontrado." });
    const pagamento = {
      id: proximoPagamentoId++,
      pedidoId: pedido.id,
      ...dados,
      usuarioId: usuario?.id || pedido.solicitanteId,
    };
    pagamentos.push(pagamento);
    pedido.pagamento = pagamento;
    pedido.status = pedido.pagamentoConfirmado
      ? "CONCLUIDO"
      : "AGUARDANDO_CONFIRMACAO";
    return json(resposta, 200, pedidoCompleto(pedido));
  }
  if (
    partes[0] === "pedidos" &&
    partes[2] === "pagamento" &&
    partes[3] === "confirmacao" &&
    request.method === "PATCH"
  ) {
    const pedido = pedidos.find((item) => String(item.id) === partes[1]);
    if (!pedido)
      return json(resposta, 404, { mensagem: "Pedido não encontrado." });
    pedido.pagamentoConfirmado = true;
    pedido.status = pedido.pagamento ? "CONCLUIDO" : "AGUARDANDO_CONFIRMACAO";
    return json(resposta, 200, pedidoCompleto(pedido));
  }

  if (
    partes[0] === "pedidos" &&
    partes[2] === "comentarios" &&
    partes.length === 3 &&
    request.method === "GET"
  )
    return json(
      resposta,
      200,
      comentarios.filter((item) => String(item.pedidoId) === partes[1]),
    );
  if (
    partes[0] === "pedidos" &&
    partes[2] === "comentarios" &&
    partes.length === 3 &&
    request.method === "POST"
  ) {
    const pedido = pedidos.find((item) => String(item.id) === partes[1]);
    if (!pedido || !usuario)
      return json(resposta, 401, { mensagem: "Faça login para comentar." });
    const ehSolicitante = String(usuario.id) === String(pedido.solicitanteId);
    const ehPrestador = String(usuario.id) === String(pedido.prestadorId);
    if (!ehSolicitante && !ehPrestador)
      return json(resposta, 403, {
        mensagem: "Somente os participantes da ajuda podem comentar.",
      });
    const sobreUsuarioId = ehSolicitante
      ? pedido.prestadorId
      : pedido.solicitanteId;
    if (
      sobreUsuarioId === undefined ||
      String(sobreUsuarioId) === String(usuario.id)
    )
      return json(resposta, 403, {
        mensagem: "Você não pode comentar sobre si mesmo.",
      });
    const comentario = {
      id: proximoComentarioId++,
      pedidoId: Number(partes[1]),
      autor: usuarioPublico(usuario),
      usuarioId: usuario.id,
      sobreUsuarioId,
      texto: dados.texto || dados.comentario || "",
    };
    comentarios.push(comentario);
    return json(resposta, 201, comentario);
  }
  if (partes[0] === "comentarios" && partes.length === 2) {
    const comentario = comentarios.find(
      (item) => String(item.id) === partes[1],
    );
    if (!comentario)
      return json(resposta, 404, { mensagem: "Comentário não encontrado." });
    if (request.method === "GET") return json(resposta, 200, comentario);
    if (!usuario || String(comentario.usuarioId) !== String(usuario.id))
      return json(resposta, 403, {
        mensagem: "Você só pode alterar seus próprios comentários.",
      });
    if (request.method === "PUT") {
      comentario.texto = dados.texto || dados.comentario || comentario.texto;
      return json(resposta, 200, comentario);
    }
    if (request.method === "DELETE") {
      comentarios.splice(comentarios.indexOf(comentario), 1);
      return semConteudo(resposta);
    }
  }

  if (request.method === "POST" && caminho === "/notificacoes") {
    const notificacao = criarNotificacao({
      usuarioId: dados.idDestinatario,
      pedidoId: dados.idPedido ?? null,
      tipo: "AVISO_ADMIN",
      mensagem: dados.mensagem || "Aviso do administrador.",
    });
    return json(resposta, 201, notificacao);
  }
  if (request.method === "GET" && caminho === "/notificacoes")
    return json(
      resposta,
      200,
      notificacoes.filter(
        (item) =>
          String(item.usuarioId) ===
            String(url.searchParams.get("usuarioId")) &&
          (url.searchParams.get("lida") !== "false" || !item.lida),
      ),
    );
  if (partes[0] === "notificacoes" && partes.length === 2) {
    const notificacao = notificacoes.find(
      (item) => String(item.id) === partes[1],
    );
    if (!notificacao)
      return json(resposta, 404, { mensagem: "Notificação não encontrada." });
    if (request.method === "GET") return json(resposta, 200, notificacao);
    if (request.method === "PUT") {
      notificacao.lida = Boolean(dados.lida);
      return json(resposta, 200, notificacao);
    }
    if (request.method === "DELETE") {
      notificacoes.splice(notificacoes.indexOf(notificacao), 1);
      return semConteudo(resposta);
    }
  }

  if (request.method === "GET" && caminho === "/comentarios") {
    const usuarioId = url.searchParams.get("usuarioId");
    const autorId = url.searchParams.get("autorId");
    return json(
      resposta,
      200,
      comentarios
        .filter(
          (item) => !usuarioId || String(item.sobreUsuarioId) === usuarioId,
        )
        .filter((item) => !autorId || String(item.usuarioId) === autorId),
    );
  }
  if (request.method === "POST" && caminho === "/denuncias") {
    const denuncia = {
      id: proximaDenunciaId++,
      status: "PENDENTE",
      ...dados,
      denuncianteId: usuario?.id,
    };
    denuncias.push(denuncia);
    return json(resposta, 201, denuncia);
  }
  if (request.method === "GET" && caminho === "/denuncias")
    return json(resposta, 200, denuncias);
  if (
    partes[0] === "denuncias" &&
    partes.length === 2 &&
    request.method === "GET"
  )
    return json(
      resposta,
      200,
      denuncias.find((item) => String(item.id) === partes[1]) || {},
    );
  if (
    partes[0] === "denuncias" &&
    partes.length === 2 &&
    request.method === "PUT"
  ) {
    const denuncia = denuncias.find((item) => String(item.id) === partes[1]);
    if (!denuncia)
      return json(resposta, 404, { mensagem: "Denúncia não encontrada." });
    Object.assign(denuncia, dados);
    return json(resposta, 200, denuncia);
  }
  if (
    partes[0] === "denuncias" &&
    partes.length === 2 &&
    request.method === "DELETE"
  ) {
    const denuncia = denuncias.find((item) => String(item.id) === partes[1]);
    if (!denuncia)
      return json(resposta, 404, { mensagem: "Denúncia não encontrada." });
    denuncias.splice(denuncias.indexOf(denuncia), 1);
    return semConteudo(resposta);
  }
  if (
    partes[0] === "denuncias" &&
    partes[2] === "status" &&
    request.method === "PATCH"
  ) {
    const denuncia = denuncias.find((item) => String(item.id) === partes[1]);
    if (!denuncia)
      return json(resposta, 404, { mensagem: "Denúncia não encontrada." });
    denuncia.status = dados.status || denuncia.status;
    return json(resposta, 200, denuncia);
  }

  return json(resposta, 404, {
    mensagem: `Endpoint não encontrado: ${request.method} ${caminho}`,
  });
}

const servidor = http.createServer((request, resposta) => {
  tratar(request, resposta).catch((erro) => {
    console.error(erro);
    json(resposta, 500, { mensagem: "Erro interno na API local." });
  });
});

servidor.listen(PORT, "0.0.0.0", () => {
  console.log(`Junttô API local disponível em http://localhost:${PORT}`);
  console.log(
    "Usuários de teste: ana@juntto.local, bruno@juntto.local e carla@juntto.local | senha: 123456",
  );
});

process.on("SIGINT", () => servidor.close(() => process.exit(0)));
