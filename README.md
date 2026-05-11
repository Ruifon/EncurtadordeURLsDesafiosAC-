# 🔗 Encurtador de URLs

Encurtador de URLs completo construído com **Bun** e **TypeScript**, desenvolvido como atividade prática do curso de Sistemas de Informação do Ifes.

## ✨ Funcionalidades

### Funcionalidades Básicas
- ✅ Criar URLs curtas a partir de URLs longas
- ✅ Redirecionamento automático para URL original
- ✅ Listagem de todas as URLs cadastradas
- ✅ Contador de acessos por URL
- ✅ Interface web moderna e responsiva
- ✅ Persistência em SQLite

### Desafios Implementados

#### 🎯 Desafio A - Códigos Personalizados
- Permite definir um código personalizado ao encurtar uma URL
- Validação: apenas letras e números, entre 4 e 10 caracteres
- Retorna erro 409 (Conflict) se o código já existir
- Geração automática de códigos únicos quando não especificado

#### 📊 Desafio B - Página de Estatísticas
- Rota `/stats/:codigo` com informações detalhadas:
  - URL original e URL curta
  - Total de acessos
  - Data de criação
  - Data de expiração (se houver)
  - QR Code gerado automaticamente via API pública
- Interface visual atraente e informativa

#### ⏰ Desafio C - Expiração de Links
- Suporte a data de expiração opcional para URLs
- Links expirados retornam status 410 (Gone)
- Página de erro específica para links expirados
- Visualização do status de expiração na listagem e estatísticas

#### 🧪 Desafio D - Testes Automatizados
- Suite completa de testes com Bun Test
- Cobertura de funções utilitárias (`util.ts`)
- Testes de banco de dados (`banco.ts`)
- Validação de edge cases e segurança

#### ⚙️ Desafio E - Variáveis de Ambiente
- Arquivo `.env` para configurações
- Porta configurável via `PORTA`
- Documentação de como alterar configurações

## 🚀 Tecnologias Utilizadas

- **[Bun](https://bun.sh)** - Runtime JavaScript/TypeScript ultrarrápido
- **TypeScript** - Tipagem estática
- **SQLite** - Banco de dados embutido (via `bun:sqlite`)
- **HTML/CSS/JavaScript** - Frontend moderno
- **Prepared Statements** - Proteção contra SQL Injection

## 📋 Pré-requisitos

- Bun ≥ 1.1 instalado
- Sistema operacional: Linux, macOS ou Windows
- Navegador web moderno

### Instalação do Bun

```bash
# Linux / macOS
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# Verificar instalação
bun --version
```

## 🔧 Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/encurtador-urls.git
cd encurtador-urls
```

### 2. Instale as dependências

```bash
bun install
```

### 3. Configure as variáveis de ambiente (opcional)

Edite o arquivo `.env` para alterar a porta:

```env
PORTA=3000
```

### 4. Execute o servidor

```bash
# Modo de desenvolvimento (hot reload)
bun run dev

# ou
bun --hot index.ts

# Modo de produção
bun run start
```

O servidor estará disponível em `http://localhost:3000`

## 🧪 Executando os Testes

```bash
bun test
```

Os testes cobrem:
- Geração de códigos aleatórios
- Validação de URLs
- Validação de códigos personalizados
- Operações de banco de dados
- Verificação de expiração

## 📁 Estrutura do Projeto

```
encurtador-urls/
├── public/              # Frontend
│   ├── index.html       # Interface do usuário
│   └── app.js           # Lógica do cliente
├── index.ts             # Servidor HTTP e rotas
├── banco.ts             # Camada de persistência SQLite
├── tipos.ts             # Definições de tipos TypeScript
├── util.ts              # Funções utilitárias
├── util.test.ts         # Testes das funções utilitárias
├── banco.test.ts        # Testes do banco de dados
├── .env                 # Variáveis de ambiente
├── .gitignore           # Arquivos ignorados pelo Git
├── package.json         # Configurações do projeto
├── tsconfig.json        # Configurações do TypeScript
└── README.md            # Este arquivo
```

## 🔌 API Endpoints

### `POST /api/encurtar`

Cria uma nova URL curta.

**Request Body:**
```json
{
  "urlOriginal": "https://exemplo.com/pagina-muito-longa",
  "codigo": "meulink",          // Opcional - código personalizado
  "expiraEm": "2025-12-31T23:59:59.000Z"  // Opcional - data de expiração
}
```

**Response (201):**
```json
{
  "id": 1,
  "codigo": "meulink",
  "urlOriginal": "https://exemplo.com/pagina-muito-longa",
  "acessos": 0,
  "criadoEm": "2025-05-11T10:30:00.000Z",
  "expiraEm": "2025-12-31T23:59:59.000Z"
}
```

**Possíveis erros:**
- `400` - URL inválida ou data de expiração inválida
- `409` - Código personalizado já existe

### `GET /api/urls`

Lista todas as URLs cadastradas.

**Response (200):**
```json
[
  {
    "id": 1,
    "codigo": "abc123",
    "urlOriginal": "https://exemplo.com",
    "acessos": 42,
    "criadoEm": "2025-05-11T10:30:00.000Z",
    "expiraEm": null
  }
]
```

### `GET /:codigo`

Redireciona para a URL original e incrementa o contador de acessos.

**Response:**
- `302` - Redirecionamento para URL original
- `404` - Código não encontrado
- `410` - Link expirado

### `GET /stats/:codigo`

Exibe página HTML com estatísticas detalhadas da URL.

**Response:**
- `200` - Página de estatísticas
- `404` - Código não encontrado

## 🛡️ Segurança

- ✅ **Prepared Statements** - Todas as queries SQL usam prepared statements para prevenir SQL Injection
- ✅ **Validação de entrada** - URLs e códigos são validados antes de serem processados
- ✅ **Protocolo restrito** - Apenas URLs HTTP/HTTPS são aceitas
- ✅ **Códigos seguros** - Geração aleatória de códigos com 62 caracteres possíveis

## 🎨 Interface do Usuário

A interface web oferece:
- Design moderno e responsivo
- Formulário intuitivo para encurtar URLs
- Opções avançadas (código personalizado e expiração)
- Tabela com todas as URLs cadastradas
- Links diretos para estatísticas
- Feedback visual de erros e sucessos
- Indicação de links expirados

## 📝 Exemplos de Uso

### Usando a interface web

1. Acesse `http://localhost:3000`
2. Cole a URL longa no campo
3. (Opcional) Defina um código personalizado
4. (Opcional) Defina uma data de expiração
5. Clique em "Encurtar URL"
6. Copie o link curto gerado

### Usando curl

```bash
# Criar URL curta simples
curl -X POST http://localhost:3000/api/encurtar \
  -H "Content-Type: application/json" \
  -d '{"urlOriginal": "https://www.ifes.edu.br"}'

# Criar URL com código personalizado
curl -X POST http://localhost:3000/api/encurtar \
  -H "Content-Type: application/json" \
  -d '{"urlOriginal": "https://www.ifes.edu.br", "codigo": "ifes"}'

# Criar URL com expiração
curl -X POST http://localhost:3000/api/encurtar \
  -H "Content-Type: application/json" \
  -d '{"urlOriginal": "https://exemplo.com", "expiraEm": "2025-12-31T23:59:59.000Z"}'

# Listar todas as URLs
curl http://localhost:3000/api/urls

# Acessar URL curta (redireciona)
curl -L http://localhost:3000/abc123
```

## 🎯 Critérios de Avaliação Atendidos

- ✅ **30%** - Servidor funcional com todas as rotas obrigatórias
- ✅ **20%** - Persistência correta em SQLite com prepared statements
- ✅ **20%** - Frontend integrado e funcional
- ✅ **20%** - Todos os 5 desafios implementados (A, B, C, D, E)
- ✅ **10%** - Código organizado, README completo e commits descritivos

## 🤝 Contribuindo

Este é um projeto educacional. Sinta-se à vontade para fazer fork e experimentar!

## 📄 Licença

MIT License - sinta-se livre para usar este código para aprendizado.

## 👨‍💻 Autor

Desenvolvido como atividade prática do curso de Sistemas de Informação do Ifes.

---

**Dica:** Experimente criar URLs curtas personalizadas como `/github`, `/portfolio`, `/cv` para seus links mais importantes! 🚀
