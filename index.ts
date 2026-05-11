// index.ts
import {
  inserirUrl,
  buscarPorCodigo,
  registrarAcesso,
  listarUrls,
  codigoExiste,
  urlExpirou,
} from "./banco";
import { gerarCodigo, urlValida, codigoValido } from "./util";
import type { RespostaErro, RequisicaoEncurtar } from "./tipos";

// Desafio E - Lê porta das variáveis de ambiente
const PORTA = parseInt(Bun.env.PORTA || "3000");

function json(dados: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(dados, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function erro(mensagem: string, status: number): Response {
  const resp: RespostaErro = { erro: mensagem };
  return json(resp, status);
}

function html(conteudo: string, status: number = 200): Response {
  return new Response(conteudo, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

const servidor = Bun.serve({
  port: PORTA,
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const caminho = url.pathname;
    const metodo = req.method;

    // POST /api/encurtar -> cria nova URL curta
    if (metodo === "POST" && caminho === "/api/encurtar") {
      const corpo = (await req.json()) as RequisicaoEncurtar;

      if (!corpo.urlOriginal || !urlValida(corpo.urlOriginal)) {
        return erro("URL inválida. Forneça http:// ou https://", 400);
      }

      // Desafio A - Código personalizado
      let codigo: string;
      if (corpo.codigo) {
        if (!codigoValido(corpo.codigo)) {
          return erro(
            "Código inválido. Use apenas letras e números (4-10 caracteres)",
            400
          );
        }
        if (codigoExiste(corpo.codigo)) {
          return erro("Código já existe. Escolha outro", 409);
        }
        codigo = corpo.codigo;
      } else {
        codigo = gerarCodigo();
        // Garante que código gerado não existe (improvável, mas possível)
        while (codigoExiste(codigo)) {
          codigo = gerarCodigo();
        }
      }

      // Desafio C - Validação de data de expiração
      let expiraEm: string | undefined;
      if (corpo.expiraEm) {
        const dataExpiracao = new Date(corpo.expiraEm);
        if (isNaN(dataExpiracao.getTime())) {
          return erro("Data de expiração inválida", 400);
        }
        if (dataExpiracao <= new Date()) {
          return erro("Data de expiração deve ser no futuro", 400);
        }
        expiraEm = corpo.expiraEm;
      }

      const registro = inserirUrl(codigo, corpo.urlOriginal, expiraEm);
      return json(registro, 201);
    }

    // GET /api/urls -> lista todas
    if (metodo === "GET" && caminho === "/api/urls") {
      return json(listarUrls());
    }

    // Desafio B - GET /stats/:codigo -> página de estatísticas
    if (metodo === "GET" && caminho.startsWith("/stats/")) {
      const codigo = caminho.slice(7);
      const registro = buscarPorCodigo(codigo);

      if (!registro) {
        return html(
          `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>404 - Não encontrado</title>
  <style>
    body { font-family: system-ui; max-width: 600px; margin: 40px auto; padding: 0 20px; text-align: center; }
    h1 { color: #c33; }
  </style>
</head>
<body>
  <h1>■ 404 - Código não encontrado</h1>
  <p>O código <strong>${codigo}</strong> não existe no sistema.</p>
  <a href="/">Voltar para página inicial</a>
</body>
</html>`,
          404
        );
      }

      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        `${url.origin}/${codigo}`
      )}`;

      const dataFormatada = new Date(registro.criadoEm).toLocaleString(
        "pt-BR"
      );
      const expiraEmFormatada = registro.expiraEm
        ? new Date(registro.expiraEm).toLocaleString("pt-BR")
        : "Nunca";
      const expirado = urlExpirou(registro);

      return html(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Estatísticas - ${codigo}</title>
  <style>
    body { font-family: system-ui; max-width: 700px; margin: 40px auto; padding: 0 20px; }
    h1 { color: #0d4f3c; }
    .card { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .stat { margin: 15px 0; }
    .stat strong { display: inline-block; width: 150px; }
    .qrcode { text-align: center; margin: 20px 0; }
    .qrcode img { border: 3px solid #0d4f3c; border-radius: 8px; }
    .link { color: #0d4f3c; word-break: break-all; }
    .expired { color: #c33; font-weight: bold; }
    .back { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #0d4f3c; color: white; text-decoration: none; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>■ Estatísticas da URL Encurtada</h1>
  
  <div class="card">
    <div class="stat">
      <strong>Código:</strong> <span class="link">${codigo}</span>
    </div>
    <div class="stat">
      <strong>URL Curta:</strong> <a href="/${codigo}" class="link">${url.origin}/${codigo}</a>
    </div>
    <div class="stat">
      <strong>URL Original:</strong> <a href="${registro.urlOriginal}" class="link" target="_blank">${registro.urlOriginal}</a>
    </div>
    <div class="stat">
      <strong>Total de Acessos:</strong> ${registro.acessos}
    </div>
    <div class="stat">
      <strong>Criado em:</strong> ${dataFormatada}
    </div>
    <div class="stat">
      <strong>Expira em:</strong> <span ${expirado ? 'class="expired"' : ""}>${expiraEmFormatada}</span>
      ${expirado ? '<span class="expired"> (EXPIRADO)</span>' : ""}
    </div>
  </div>

  <div class="qrcode">
    <h2>QR Code</h2>
    <img src="${qrCodeUrl}" alt="QR Code para ${codigo}">
    <p>Escaneie este código para acessar a URL</p>
  </div>

  <a href="/" class="back">← Voltar para página inicial</a>
</body>
</html>`);
    }

    // GET /:codigo -> redireciona
    if (metodo === "GET" && /^\/[A-Za-z0-9]{4,10}$/.test(caminho)) {
      const codigo = caminho.slice(1);
      const registro = buscarPorCodigo(codigo);

      if (!registro) return erro("Código não encontrado", 404);

      // Desafio C - Verifica se URL expirou
      if (urlExpirou(registro)) {
        return html(
          `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>410 - Link Expirado</title>
  <style>
    body { font-family: system-ui; max-width: 600px; margin: 40px auto; padding: 0 20px; text-align: center; }
    h1 { color: #c33; }
  </style>
</head>
<body>
  <h1>■ 410 - Link Expirado</h1>
  <p>Este link expirou em ${new Date(registro.expiraEm!).toLocaleString("pt-BR")}.</p>
  <a href="/">Voltar para página inicial</a>
</body>
</html>`,
          410
        );
      }

      registrarAcesso(codigo);
      return Response.redirect(registro.urlOriginal, 302);
    }

    // GET / -> serve o frontend
    if (metodo === "GET" && caminho === "/") {
      return new Response(Bun.file("./public/index.html"));
    }

    // GET /app.js -> serve o JavaScript
    if (metodo === "GET" && caminho === "/app.js") {
      return new Response(Bun.file("./public/app.js"));
    }

    return erro("Rota não encontrada", 404);
  },
});

console.log(`■ Servidor pronto em http://localhost:${servidor.port}`);
