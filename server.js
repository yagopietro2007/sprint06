// ── [SPRINT 01 — BASE: Express e ES Modules — mantido da primeira aula] ──
import express from "express";

// ── [SPRINT 04 — HERDADO] ──
// Módulo que lê e grava as mensagens em arquivo JSON.
import { lerMensagens, salvarMensagens } from "./store.js";

const app = express();
const PORT = 3000;

// ── [SPRINT 05 — HERDADO: API DE ENVIO] ──
// Recebe JSON do navegador ou de um cliente HTTP.
app.use(express.json());

// Serializa gravações dentro deste único processo Node.js.
let fila = Promise.resolve();
app.post("/mensagens", (req, res) => {
  const { usuario, texto } = req.body ?? {};
  if (typeof usuario !== "string" || !usuario.trim() ||
      typeof texto !== "string" || !texto.trim()) {
    return res.status(400).json({ erro: "Informe usuário e mensagem." });
  }
  if (usuario.trim().length > 40 || texto.trim().length > 500) {
    return res.status(400).json({ erro: "Nome ou mensagem muito longos." });
  }
  const tarefa = fila.then(async () => {
    const lista = await lerMensagens();
    const id = lista.reduce((maior, m) => Math.max(maior, Number(m.id) || 0), 0) + 1;
    const nova = { id, usuario: usuario.trim(), texto: texto.trim(), data: new Date().toISOString() };
    await salvarMensagens([...lista, nova]);
    return nova;
  });
  fila = tarefa.catch(() => {}); // mantém a fila utilizável após uma falha
  tarefa.then(nova => res.status(201).json(nova)).catch(erro => {
    console.error(erro);
    res.status(500).json({ erro: "Não foi possível salvar a mensagem." });
  });
});


// ── [SPRINT 06 — NOVO: interface web e arquivos estáticos] ──
// A rota GET / agora entrega public/index.html em vez da mensagem fixa.
app.use(express.static("public"));


// ── [SPRINT 01 — ROTAS HERDADAS: /status, /sobre; / agora é HTML] ──
// Rotas da Sprint 01 — continuam disponíveis.
app.get("/status", (req, res) => res.json({ status: "online", sprint: 6 }));
app.get("/sobre", (req, res) => res.send("Mensageiro Local com Node.js, Express e ES Modules."));


// ── [SPRINT 04 — ROTAS HERDADAS] ──
app.get("/mensagens", async (req, res) => {
  try { res.json(await lerMensagens()); }
  catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Não foi possível ler as mensagens." });
  }
});
app.get("/mensagens/:id", async (req, res) => {
  try {
    const lista = await lerMensagens();
    const mensagem = lista.find(m => m.id === Number(req.params.id));
    if (!mensagem) return res.status(404).json({ erro: "Mensagem não encontrada." });
    res.json(mensagem);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Falha ao consultar mensagem." });
  }
});
app.get("/total-mensagens", async (req, res) => {
  try { res.json({ total: (await lerMensagens()).length }); }
  catch (erro) { res.status(500).json({ erro: "Falha na contagem." }); }
});


// ── [SPRINT 01 — SERVIDOR: iniciado na porta 3000; mantido ao longo das aulas] ──
app.listen(PORT, () => {
  console.log(`Servidor em http://localhost:${PORT}`);
});