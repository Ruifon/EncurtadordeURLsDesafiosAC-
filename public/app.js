// public/app.js
const btn = document.getElementById("btn");
const inputUrl = document.getElementById("url");
const inputCodigo = document.getElementById("codigo");
const inputExpiraEm = document.getElementById("expiraEm");
const resultado = document.getElementById("resultado");
const tbody = document.querySelector("#tabela tbody");

async function carregarLista() {
  try {
    const resp = await fetch("/api/urls");
    const lista = await resp.json();
    
    if (lista.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">Nenhuma URL cadastrada ainda</td></tr>';
      return;
    }
    
    tbody.innerHTML = lista
      .map((u) => {
        const expiraEm = u.expiraEm 
          ? new Date(u.expiraEm).toLocaleString("pt-BR", { 
              dateStyle: "short", 
              timeStyle: "short" 
            })
          : "Nunca";
        
        // Verifica se expirou
        const expirado = u.expiraEm && new Date(u.expiraEm) <= new Date();
        const classeExpiracao = expirado ? 'class="expired"' : '';
        const textoExpiracao = expirado ? `${expiraEm} (EXPIRADO)` : expiraEm;
        
        return `
        <tr>
          <td>
            <a href="/${u.codigo}" class="codigo-link" target="_blank">${u.codigo}</a>
            <a href="/stats/${u.codigo}" class="stats-link" target="_blank">📊 stats</a>
          </td>
          <td class="url-original" title="${u.urlOriginal}">${u.urlOriginal}</td>
          <td>${u.acessos}</td>
          <td ${classeExpiracao}>${textoExpiracao}</td>
        </tr>`;
      })
      .join("");
  } catch (error) {
    console.error("Erro ao carregar lista:", error);
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #c33;">Erro ao carregar URLs</td></tr>';
  }
}

btn.addEventListener("click", async () => {
  const urlOriginal = inputUrl.value.trim();
  const codigo = inputCodigo.value.trim();
  const expiraEm = inputExpiraEm.value;

  if (!urlOriginal) {
    mostrarResultado("Por favor, informe uma URL", true);
    return;
  }

  // Monta o corpo da requisição
  const corpo = { urlOriginal };
  if (codigo) corpo.codigo = codigo;
  if (expiraEm) corpo.expiraEm = new Date(expiraEm).toISOString();

  try {
    const resp = await fetch("/api/encurtar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });

    const dados = await resp.json();

    if (!resp.ok) {
      mostrarResultado(`■ ${dados.erro}`, true);
      return;
    }

    const curta = `${location.origin}/${dados.codigo}`;
    const statsLink = `${location.origin}/stats/${dados.codigo}`;
    
    const expiraMsg = dados.expiraEm 
      ? `<br><small>Expira em: ${new Date(dados.expiraEm).toLocaleString("pt-BR")}</small>`
      : '';
    
    mostrarResultado(
      `■ URL encurtada com sucesso!<br>
       <strong>Link curto:</strong> <a href="${curta}" target="_blank">${curta}</a><br>
       <strong>Estatísticas:</strong> <a href="${statsLink}" target="_blank">${statsLink}</a>
       ${expiraMsg}`,
      false
    );

    // Limpa os campos
    inputUrl.value = "";
    inputCodigo.value = "";
    inputExpiraEm.value = "";

    // Atualiza a lista
    carregarLista();
  } catch (error) {
    mostrarResultado("■ Erro ao encurtar URL. Tente novamente.", true);
    console.error("Erro:", error);
  }
});

function mostrarResultado(mensagem, isErro) {
  resultado.innerHTML = mensagem;
  resultado.className = "resultado show" + (isErro ? " erro" : "");
  
  // Remove a mensagem após 10 segundos
  setTimeout(() => {
    resultado.classList.remove("show");
  }, 10000);
}

// Carrega a lista ao abrir a página
carregarLista();
