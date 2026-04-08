import { useEffect, useState } from 'react';
import api from './api';

const initialLivro = {
  titulo: '',
  autor: '',
  isbn: '',
  categoria: '',
  anoPublicacao: '',
  quantidadeTotal: 1,
};

const initialUsuario = {
  nome: '',
  email: '',
  documento: '',
  telefone: '',
};

const initialEmprestimo = {
  livroId: '',
  usuarioId: '',
  diasEmprestimo: 7,
};

export default function App() {
  const [stats, setStats] = useState(null);
  const [livros, setLivros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);
  const [livroForm, setLivroForm] = useState(initialLivro);
  const [usuarioForm, setUsuarioForm] = useState(initialUsuario);
  const [emprestimoForm, setEmprestimoForm] = useState(initialEmprestimo);
  const [mensagem, setMensagem] = useState('');

  async function carregarTudo() {
    try {
      const [statsRes, livrosRes, usuariosRes, emprestimosRes] = await Promise.all([
        api.get('/dashboard/estatisticas'),
        api.get('/livros'),
        api.get('/usuarios'),
        api.get('/emprestimos/ativos'),
      ]);

      setStats(statsRes.data);
      setLivros(livrosRes.data);
      setUsuarios(usuariosRes.data);
      setEmprestimos(emprestimosRes.data);
    } catch {
      setMensagem('Nao foi possivel carregar os dados. Verifique se a API esta ativa.');
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  function atualizarCampo(setter, field, value) {
    setter((prev) => ({ ...prev, [field]: value }));
  }

  async function criarLivro(event) {
    event.preventDefault();
    try {
      await api.post('/livros', {
        ...livroForm,
        anoPublicacao: Number(livroForm.anoPublicacao),
        quantidadeTotal: Number(livroForm.quantidadeTotal),
      });
      setLivroForm(initialLivro);
      setMensagem('Livro cadastrado com sucesso.');
      carregarTudo();
    } catch {
      setMensagem('Erro ao cadastrar livro.');
    }
  }

  async function criarUsuario(event) {
    event.preventDefault();
    try {
      await api.post('/usuarios', usuarioForm);
      setUsuarioForm(initialUsuario);
      setMensagem('Usuario cadastrado com sucesso.');
      carregarTudo();
    } catch {
      setMensagem('Erro ao cadastrar usuario.');
    }
  }

  async function criarEmprestimo(event) {
    event.preventDefault();
    try {
      await api.post('/emprestimos', {
        livroId: Number(emprestimoForm.livroId),
        usuarioId: Number(emprestimoForm.usuarioId),
        diasEmprestimo: Number(emprestimoForm.diasEmprestimo),
      });
      setEmprestimoForm(initialEmprestimo);
      setMensagem('Emprestimo registrado com sucesso.');
      carregarTudo();
    } catch {
      setMensagem('Erro ao registrar emprestimo.');
    }
  }

  async function devolver(id) {
    try {
      await api.post(`/emprestimos/${id}/devolucao`);
      setMensagem('Devolucao registrada com sucesso.');
      carregarTudo();
    } catch {
      setMensagem('Erro ao devolver livro.');
    }
  }

  return (
    <div className="layout">
      <header>
        <h1>Sistema de Biblioteca</h1>
        <p>Dashboard, catalogo de livros, usuarios e emprestimos</p>
      </header>

      {mensagem && <div className="alerta">{mensagem}</div>}

      <section className="cards">
        <Card titulo="Total de Livros" valor={stats?.totalLivros ?? 0} />
        <Card titulo="Usuarios" valor={stats?.totalUsuarios ?? 0} />
        <Card titulo="Emprestimos Ativos" valor={stats?.emprestimosAtivos ?? 0} />
        <Card titulo="Livros Disponiveis" valor={stats?.livrosDisponiveis ?? 0} />
      </section>

      <section className="grid">
        <article className="panel">
          <h2>Cadastrar Livro</h2>
          <form onSubmit={criarLivro}>
            <input placeholder="Titulo" value={livroForm.titulo} onChange={(e) => atualizarCampo(setLivroForm, 'titulo', e.target.value)} required />
            <input placeholder="Autor" value={livroForm.autor} onChange={(e) => atualizarCampo(setLivroForm, 'autor', e.target.value)} required />
            <input placeholder="ISBN" value={livroForm.isbn} onChange={(e) => atualizarCampo(setLivroForm, 'isbn', e.target.value)} required />
            <input placeholder="Categoria" value={livroForm.categoria} onChange={(e) => atualizarCampo(setLivroForm, 'categoria', e.target.value)} />
            <input type="number" placeholder="Ano" value={livroForm.anoPublicacao} onChange={(e) => atualizarCampo(setLivroForm, 'anoPublicacao', e.target.value)} />
            <input type="number" min="1" placeholder="Quantidade" value={livroForm.quantidadeTotal} onChange={(e) => atualizarCampo(setLivroForm, 'quantidadeTotal', e.target.value)} required />
            <button type="submit">Salvar Livro</button>
          </form>
        </article>

        <article className="panel">
          <h2>Cadastrar Usuario</h2>
          <form onSubmit={criarUsuario}>
            <input placeholder="Nome" value={usuarioForm.nome} onChange={(e) => atualizarCampo(setUsuarioForm, 'nome', e.target.value)} required />
            <input type="email" placeholder="Email" value={usuarioForm.email} onChange={(e) => atualizarCampo(setUsuarioForm, 'email', e.target.value)} required />
            <input placeholder="Documento" value={usuarioForm.documento} onChange={(e) => atualizarCampo(setUsuarioForm, 'documento', e.target.value)} required />
            <input placeholder="Telefone" value={usuarioForm.telefone} onChange={(e) => atualizarCampo(setUsuarioForm, 'telefone', e.target.value)} />
            <button type="submit">Salvar Usuario</button>
          </form>
        </article>

        <article className="panel">
          <h2>Novo Emprestimo</h2>
          <form onSubmit={criarEmprestimo}>
            <select value={emprestimoForm.livroId} onChange={(e) => atualizarCampo(setEmprestimoForm, 'livroId', e.target.value)} required>
              <option value="">Selecione um livro</option>
              {livros
                .filter((livro) => livro.quantidadeDisponivel > 0)
                .map((livro) => (
                  <option key={livro.id} value={livro.id}>
                    {livro.titulo} ({livro.quantidadeDisponivel} disponiveis)
                  </option>
                ))}
            </select>
            <select value={emprestimoForm.usuarioId} onChange={(e) => atualizarCampo(setEmprestimoForm, 'usuarioId', e.target.value)} required>
              <option value="">Selecione um usuario</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nome}
                </option>
              ))}
            </select>
            <input type="number" min="1" value={emprestimoForm.diasEmprestimo} onChange={(e) => atualizarCampo(setEmprestimoForm, 'diasEmprestimo', e.target.value)} />
            <button type="submit">Registrar Emprestimo</button>
          </form>
        </article>
      </section>

      <section className="panel">
        <h2>Emprestimos Ativos</h2>
        <div className="lista">
          {emprestimos.map((emp) => (
            <div className="item" key={emp.id}>
              <div>
                <strong>{emp.livroTitulo}</strong>
                <span>Usuario: {emp.usuarioNome}</span>
                <span>Previsto para: {emp.dataPrevistaDevolucao}</span>
              </div>
              <button onClick={() => devolver(emp.id)}>Registrar Devolucao</button>
            </div>
          ))}
          {emprestimos.length === 0 && <p>Nenhum emprestimo ativo.</p>}
        </div>
      </section>
    </div>
  );
}

function Card({ titulo, valor }) {
  return (
    <article className="card">
      <h3>{titulo}</h3>
      <p>{valor}</p>
    </article>
  );
}
