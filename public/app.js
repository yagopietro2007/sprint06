const lista = document.querySelector('#mensagens');
const formulario = document.querySelector('#formulario');
const aviso = document.querySelector('#aviso');
const conexao = document.querySelector('#conexao');
const enviar = document.querySelector('#enviar');
const nome = document.querySelector('#usuario');
const texto = document.querySelector('#texto');

async function atualizarMensagens() {
    try {
        const resposta = await fetch('/mensagens', { cache: 'no-store' });
        if (!resposta.ok) throw new Error('Não foi possível carregar mensagens.');
        const mensagens = await resposta.json();
        lista.replaceChildren();
        for (const mensagem of mensagens) {
            const li = document.createElement('li');
            const meta = document.createElement('div');
            meta.className = 'meta';
            const usuario = document.createElement('strong');
            usuario.textContent = mensagem.usuario;
            const hora = document.createElement('time');
            hora.textContent = mensagem.data ? new Date(mensagem.data).toLocaleString('pt-BR') : '';
            meta.append(usuario, hora);
            const conteudo = document.createElement('div');
            conteudo.className = 'texto';
            conteudo.textContent = mensagem.texto;
            li.append(meta, conteudo);
            lista.append(li);
        }
        conexao.textContent = `Online • ${mensagens.length} mensagens`;
    } catch (erro) {
        conexao.textContent = 'Conexão indisponível';
        aviso.textContent = erro.message;
    }
    }
    formulario.addEventListener('submit', async evento => {
        evento.preventDefault();
        enviar.disabled = true;
        try {
            const resposta = await fetch('/mensagens', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario: nome.value, texto: texto.value })
            });
            const dados = await resposta.json();
            if (!resposta.ok) throw new Error(dados.erro ?? 'Falha ao enviar.');
            texto.value = '';
            aviso.textContent = 'Mensagem enviada!';
            await atualizarMensagens();
        } catch (erro) { aviso.textContent = erro.message; }
        finally { enviar.disabled = false; }
    });
await atualizarMensagens();
setInterval(atualizarMensagens, 3000);