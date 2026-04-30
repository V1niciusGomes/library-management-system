// Componente principal da interface; orquestra login, consultas, cadastros e telas do painel.
import { useEffect, useMemo, useState } from 'react';
import api, { authApi } from './api';

const initialLivro = {
  titulo: '',
  autor: '',
  isbn: '',
  categoria: '',
  sinopse: '',
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

const initialEditState = {
  livroId: null,
  usuarioId: null,
};

const sections = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'livros', label: 'Livros' },
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'emprestimos', label: 'Emprestimos' },
  { id: 'configuracoes', label: 'Configuracoes' },
];

export default function App() {
  const [activeSection, setActiveSection] = useState(localStorage.getItem('defaultSection') || 'dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [compactMode, setCompactMode] = useState(localStorage.getItem('compactMode') === 'true');
  const [confirmActions, setConfirmActions] = useState(localStorage.getItem('confirmActions') !== 'false');
  const [autoRefreshSeconds, setAutoRefreshSeconds] = useState(Number(localStorage.getItem('autoRefreshSeconds') || '0'));
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || '');
  const [adminUser, setAdminUser] = useState(localStorage.getItem('adminUser') || '');
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: 'admin123' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [livros, setLivros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [emprestimosAtivos, setEmprestimosAtivos] = useState([]);
  const [historicoEmprestimos, setHistoricoEmprestimos] = useState([]);
  const [livroForm, setLivroForm] = useState(initialLivro);
  const [usuarioForm, setUsuarioForm] = useState(initialUsuario);
  const [emprestimoForm, setEmprestimoForm] = useState(initialEmprestimo);
  const [editState, setEditState] = useState(initialEditState);
  const [mensagem, setMensagem] = useState({ text: '', type: 'ok' });
  const [loading, setLoading] = useState(false);
  const [livroSearch, setLivroSearch] = useState('');
  const [livroCategoriaFiltro, setLivroCategoriaFiltro] = useState('todas');
  const [usuarioSearch, setUsuarioSearch] = useState('');
  const [emprestimoSearch, setEmprestimoSearch] = useState('');
  const [lastSync, setLastSync] = useState(null);
  const [multaPorDia, setMultaPorDia] = useState(Number(localStorage.getItem('multaPorDia') || '2.5'));
  const [livroSinopseSelecionado, setLivroSinopseSelecionado] = useState(null);
  const [livrosTab, setLivrosTab] = useState('todos');
  const [livrosSelecionados, setLivrosSelecionados] = useState([]);
  const [quantidadeExclusaoPorLivro, setQuantidadeExclusaoPorLivro] = useState({});
  const [usuariosSelecionados, setUsuariosSelecionados] = useState([]);

  async function carregarTudo() {
    if (!authToken) {
      return;
    }

    setLoading(true);
    try {
      const statsRes = await api.get('/dashboard/estatisticas');
      const livrosRes = await api.get('/livros');
      const usuariosRes = await api.get('/usuarios');
      const emprestimosAtivosRes = await api.get('/emprestimos/ativos');
      const emprestimosRes = await api.get('/emprestimos');

      setStats(statsRes.data);
      setLivros(livrosRes.data);
      setUsuarios(usuariosRes.data);
      setEmprestimosAtivos(emprestimosAtivosRes.data);
      setHistoricoEmprestimos(emprestimosRes.data);
      setLastSync(new Date());
      setMensagem({ text: '', type: 'ok' });
    } catch (error) {
      const failedEndpoint =
        error?.config?.url?.replace('http://localhost:8080/api', '') ||
        error?.config?.url ||
        'desconhecido';
      const status = error?.response?.status;
      const detalhe = error?.response?.data?.message;

      if (error?.response?.status === 401) {
        logout('Sessao expirada. Faca login novamente.');
        return;
      }
      setMensagem({
        text: `Nao foi possivel carregar os dados em ${failedEndpoint}${status ? ` (HTTP ${status})` : ''}. ${detalhe || 'Verifique a API ou o login do admin.'}`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authToken) {
      carregarTudo();
    }
  }, [authToken]);

  useEffect(() => {
    if (!authToken) {
      return;
    }

    let active = true;

    api.get('/dashboard/estatisticas')
      .then(() => {
        if (active) {
          carregarTudo();
        }
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        if (error?.response?.status === 401) {
          logout('Sessao invalida ou expirada. Faça login novamente.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-compact', compactMode ? 'true' : 'false');
    localStorage.setItem('compactMode', String(compactMode));
  }, [compactMode]);

  useEffect(() => {
    localStorage.setItem('confirmActions', String(confirmActions));
  }, [confirmActions]);

  useEffect(() => {
    localStorage.setItem('autoRefreshSeconds', String(autoRefreshSeconds));
  }, [autoRefreshSeconds]);

  useEffect(() => {
    localStorage.setItem('defaultSection', activeSection);
  }, [activeSection]);

  useEffect(() => {
    localStorage.setItem('multaPorDia', String(multaPorDia));
  }, [multaPorDia]);

  useEffect(() => {
    if (!authToken || autoRefreshSeconds <= 0) {
      return undefined;
    }

    const interval = setInterval(() => {
      carregarTudo();
    }, autoRefreshSeconds * 1000);

    return () => clearInterval(interval);
  }, [authToken, autoRefreshSeconds]);

  useEffect(() => {
    const idsAtuais = new Set(livros.map((livro) => livro.id));
    setLivrosSelecionados((prev) => prev.filter((id) => idsAtuais.has(id)));
    setQuantidadeExclusaoPorLivro((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        if (!idsAtuais.has(Number(id))) {
          delete next[id];
        }
      });
      return next;
    });
  }, [livros]);

  useEffect(() => {
    const idsAtuais = new Set(usuarios.map((usuario) => usuario.id));
    setUsuariosSelecionados((prev) => prev.filter((id) => idsAtuais.has(id)));
  }, [usuarios]);

  const livrosFiltrados = useMemo(() => {
    const query = livroSearch.trim().toLowerCase();
    return livros.filter((livro) => {
      const textoOk = !query || `${livro.titulo} ${livro.autor} ${livro.isbn}`.toLowerCase().includes(query);
      const categoria = (livro.categoria || '').trim();
      const categoriaOk = livroCategoriaFiltro === 'todas' || categoria === livroCategoriaFiltro;
      return textoOk && categoriaOk;
    });
  }, [livros, livroSearch, livroCategoriaFiltro]);

  const categoriasLivros = useMemo(() => {
    const categorias = livros
      .map((livro) => (livro.categoria || '').trim())
      .filter((categoria) => categoria.length > 0);

    return Array.from(new Set(categorias)).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [livros]);

  const livrosEmEstoqueFiltrados = useMemo(() => (
    livrosFiltrados.filter((livro) => (livro.quantidadeDisponivel ?? 0) > 0)
  ), [livrosFiltrados]);

  const livrosEmprestadosFiltrados = useMemo(() => (
    livrosFiltrados.filter((livro) => ((livro.quantidadeTotal ?? 0) - (livro.quantidadeDisponivel ?? 0)) > 0)
  ), [livrosFiltrados]);

  const livrosTodosFiltrados = useMemo(() => livrosFiltrados, [livrosFiltrados]);

  const usuariosFiltrados = useMemo(() => {
    const query = usuarioSearch.trim().toLowerCase();
    if (!query) {
      return usuarios;
    }
    return usuarios.filter((usuario) => (
      `${usuario.nome} ${usuario.email} ${usuario.documento}`.toLowerCase().includes(query)
    ));
  }, [usuarios, usuarioSearch]);

  const todosUsuariosSelecionados = usuariosFiltrados.length > 0
    && usuariosFiltrados.every((usuario) => usuariosSelecionados.includes(usuario.id));

  const emprestimosFiltrados = useMemo(() => {
    const query = emprestimoSearch.trim().toLowerCase();
    if (!query) {
      return emprestimosAtivos;
    }
    return emprestimosAtivos.filter((emprestimo) => (
      `${emprestimo.livroTitulo} ${emprestimo.usuarioNome}`.toLowerCase().includes(query)
    ));
  }, [emprestimosAtivos, emprestimoSearch]);

  const emprestimosAtrasados = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return emprestimosAtivos.filter((emprestimo) => {
      const prevista = new Date(emprestimo.dataPrevistaDevolucao);
      prevista.setHours(0, 0, 0, 0);
      return prevista < hoje;
    });
  }, [emprestimosAtivos]);

  const livrosBaixoEstoque = useMemo(() => (
    livros.filter((livro) => {
      const disponivel = livro.quantidadeDisponivel ?? 0;
      return disponivel > 0 && disponivel <= 1;
    })
  ), [livros]);

  const pendenciasPorUsuario = useMemo(() => {
    const mapa = new Map();

    for (const emprestimo of emprestimosAtrasados) {
      const diasAtraso = diffDaysFromToday(emprestimo.dataPrevistaDevolucao);
      const multa = diasAtraso * multaPorDia;
      const chave = emprestimo.usuarioId;

      if (!mapa.has(chave)) {
        mapa.set(chave, {
          usuarioId: emprestimo.usuarioId,
          usuarioNome: emprestimo.usuarioNome,
          livrosAtrasados: 0,
          diasAtrasoTotal: 0,
          multaTotal: 0,
        });
      }

      const item = mapa.get(chave);
      item.livrosAtrasados += 1;
      item.diasAtrasoTotal += diasAtraso;
      item.multaTotal += multa;
    }

    return Array.from(mapa.values()).sort((a, b) => b.multaTotal - a.multaTotal);
  }, [emprestimosAtrasados, multaPorDia]);

  const multasTotais = useMemo(() => (
    pendenciasPorUsuario.reduce((acc, item) => acc + item.multaTotal, 0)
  ), [pendenciasPorUsuario]);

  function atualizarCampo(setter, field, value) {
    setter((prev) => ({ ...prev, [field]: value }));
  }

  async function criarLivro(event) {
    event.preventDefault();
    try {
      const payload = {
        ...livroForm,
        anoPublicacao: livroForm.anoPublicacao ? Number(livroForm.anoPublicacao) : null,
        quantidadeTotal: Number(livroForm.quantidadeTotal),
      };

      if (editState.livroId) {
        await api.put(`/livros/${editState.livroId}`, payload);
        setMensagem({ text: 'Livro atualizado com sucesso.', type: 'ok' });
      } else {
        await api.post('/livros', payload);
        setMensagem({ text: 'Livro cadastrado com sucesso.', type: 'ok' });
      }

      setLivroForm(initialLivro);
      setEditState((prev) => ({ ...prev, livroId: null }));
      await carregarTudo();
    } catch (error) {
      setMensagem({ text: getApiErrorMessage(error, 'Erro ao salvar livro.'), type: 'error' });
    }
  }

  async function criarUsuario(event) {
    event.preventDefault();
    try {
      if (editState.usuarioId) {
        await api.put(`/usuarios/${editState.usuarioId}`, usuarioForm);
        setMensagem({ text: 'Usuario atualizado com sucesso.', type: 'ok' });
      } else {
        await api.post('/usuarios', usuarioForm);
        setMensagem({ text: 'Usuario cadastrado com sucesso.', type: 'ok' });
      }

      setUsuarioForm(initialUsuario);
      setEditState((prev) => ({ ...prev, usuarioId: null }));
      await carregarTudo();
    } catch (error) {
      setMensagem({ text: getApiErrorMessage(error, 'Erro ao salvar usuario.'), type: 'error' });
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
      setMensagem({ text: 'Emprestimo registrado com sucesso.', type: 'ok' });
      await carregarTudo();
    } catch (error) {
      setMensagem({ text: getApiErrorMessage(error, 'Erro ao registrar emprestimo.'), type: 'error' });
    }
  }

  async function devolver(id) {
    try {
      await api.post(`/emprestimos/${id}/devolucao`);
      setMensagem({ text: 'Devolucao registrada com sucesso.', type: 'ok' });
      await carregarTudo();
    } catch (error) {
      setMensagem({ text: getApiErrorMessage(error, 'Erro ao devolver livro.'), type: 'error' });
    }
  }

  function getQuantidadeExclusao(livro) {
    const raw = quantidadeExclusaoPorLivro[livro.id];
    const parsed = Number(raw ?? 1);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 1;
    }
    return Math.min(Math.floor(parsed), livro.quantidadeDisponivel ?? 0);
  }

  async function deletarLivro(id, quantidade = 1) {
    const confirmado = confirmActions
      ? window.confirm(`Deseja realmente excluir ${quantidade} unidade(s) deste livro?`)
      : true;
    if (!confirmado) {
      return;
    }

    try {
      await api.delete(`/livros/${id}`, { params: { quantidade } });
      setMensagem({ text: `${quantidade} unidade(s) removida(s) com sucesso.`, type: 'ok' });
      setLivrosSelecionados((prev) => prev.filter((livroId) => livroId !== id));
      await carregarTudo();
    } catch (error) {
      setMensagem({ text: getApiErrorMessage(error, 'Erro ao remover livro.'), type: 'error' });
    }
  }

  async function deletarLivrosSelecionados() {
    if (livrosSelecionados.length === 0) {
      setMensagem({ text: 'Selecione ao menos um livro para excluir.', type: 'error' });
      return;
    }

    const payload = livrosSelecionados
      .map((id) => livros.find((livro) => livro.id === id))
      .filter(Boolean)
      .map((livro) => ({
        livroId: livro.id,
        quantidade: getQuantidadeExclusao(livro),
      }))
      .filter((item) => item.quantidade > 0);

    if (payload.length === 0) {
      setMensagem({ text: 'Nenhum item valido para exclusao em lote.', type: 'error' });
      return;
    }

    const totalUnidades = payload.reduce((acc, item) => acc + item.quantidade, 0);
    const confirmado = confirmActions
      ? window.confirm(`Deseja excluir ${totalUnidades} unidade(s) em ${payload.length} livro(s)?`)
      : true;
    if (!confirmado) {
      return;
    }

    try {
      await api.post('/livros/remocao-lote', payload);
      setMensagem({ text: `Exclusao em lote concluida: ${totalUnidades} unidade(s).`, type: 'ok' });
      setLivrosSelecionados([]);
      await carregarTudo();
    } catch (error) {
      setMensagem({ text: getApiErrorMessage(error, 'Erro ao remover livros em lote.'), type: 'error' });
    }
  }

  function alterarQuantidadeExclusao(livro, value) {
    const disponivel = livro.quantidadeDisponivel ?? 0;
    const parsed = Number(value);
    const quantidade = Number.isFinite(parsed) ? Math.min(Math.max(Math.floor(parsed), 1), disponivel) : 1;
    setQuantidadeExclusaoPorLivro((prev) => ({
      ...prev,
      [livro.id]: quantidade,
    }));
  }

  function alternarSelecaoLivro(id, checked) {
    setLivrosSelecionados((prev) => {
      if (checked) {
        return prev.includes(id) ? prev : [...prev, id];
      }
      return prev.filter((item) => item !== id);
    });
  }

  function alternarSelecionarTodosEstoque(checked) {
    const ids = livrosEmEstoqueFiltrados.map((livro) => livro.id);
    setLivrosSelecionados((prev) => {
      if (checked) {
        return Array.from(new Set([...prev, ...ids]));
      }
      return prev.filter((id) => !ids.includes(id));
    });
  }

  function alternarSelecionarTodosUsuarios(checked) {
    const ids = usuariosFiltrados.map((usuario) => usuario.id);
    setUsuariosSelecionados((prev) => {
      if (checked) {
        return Array.from(new Set([...prev, ...ids]));
      }
      return prev.filter((id) => !ids.includes(id));
    });
  }

  async function deletarUsuario(id) {
    const confirmado = confirmActions ? window.confirm('Deseja realmente excluir este usuario?') : true;
    if (!confirmado) {
      return;
    }

    try {
      await api.delete(`/usuarios/${id}`);
      setMensagem({ text: 'Usuario removido com sucesso.', type: 'ok' });
      await carregarTudo();
    } catch (error) {
      setMensagem({ text: getApiErrorMessage(error, 'Erro ao remover usuario.'), type: 'error' });
    }
  }

  async function deletarUsuariosSelecionados() {
    if (usuariosSelecionados.length === 0) {
      setMensagem({ text: 'Selecione ao menos um usuario para excluir.', type: 'error' });
      return;
    }

    const confirmado = confirmActions
      ? window.confirm(`Deseja realmente excluir ${usuariosSelecionados.length} usuario(s) selecionado(s)?`)
      : true;
    if (!confirmado) {
      return;
    }

    try {
      await api.post('/usuarios/remocao-lote', usuariosSelecionados.map((usuarioId) => ({ usuarioId })));
      setUsuariosSelecionados([]);
      setMensagem({ text: 'Usuarios removidos com sucesso.', type: 'ok' });
      await carregarTudo();
    } catch (error) {
      setMensagem({ text: getApiErrorMessage(error, 'Erro ao remover usuarios.'), type: 'error' });
    }
  }

  function iniciarEdicaoLivro(livro) {
    setLivroForm({
      titulo: livro.titulo || '',
      autor: livro.autor || '',
      isbn: livro.isbn || '',
      categoria: livro.categoria || '',
      sinopse: livro.sinopse || '',
      anoPublicacao: livro.anoPublicacao || '',
      quantidadeTotal: livro.quantidadeTotal || 1,
    });
    setEditState((prev) => ({ ...prev, livroId: livro.id }));
  }

  function cancelarEdicaoLivro() {
    setLivroForm(initialLivro);
    setEditState((prev) => ({ ...prev, livroId: null }));
  }

  function iniciarEdicaoUsuario(usuario) {
    setUsuarioForm({
      nome: usuario.nome || '',
      email: usuario.email || '',
      documento: usuario.documento || '',
      telefone: usuario.telefone || '',
    });
    setEditState((prev) => ({ ...prev, usuarioId: usuario.id }));
  }

  function cancelarEdicaoUsuario() {
    setUsuarioForm(initialUsuario);
    setEditState((prev) => ({ ...prev, usuarioId: null }));
  }

  async function login(event) {
    event.preventDefault();
    setLoginLoading(true);
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('defaultSection');
      localStorage.removeItem('autoRefreshSeconds');
      const response = await authApi.post('/auth/login', loginForm);
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('adminUser', response.data.username);
      setAuthToken(response.data.token);
      setAdminUser(response.data.username);
      setMensagem({ text: 'Login realizado com sucesso.', type: 'ok' });
      await carregarTudo();
    } catch (error) {
      setMensagem({ text: getApiErrorMessage(error, 'Falha ao autenticar admin.'), type: 'error' });
    } finally {
      setLoginLoading(false);
    }
  }

  function logout(message) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminUser');
    setAuthToken('');
    setAdminUser('');
    setEditState(initialEditState);
    setLivrosSelecionados([]);
    setUsuariosSelecionados([]);
    setStats(null);
    setLivros([]);
    setUsuarios([]);
    setEmprestimosAtivos([]);
    setHistoricoEmprestimos([]);
    if (message) {
      setMensagem({ text: message, type: 'error' });
    }
  }

  function limparSessao() {
    localStorage.clear();
    setActiveSection('dashboard');
    setTheme('light');
    setCompactMode(false);
    setConfirmActions(true);
    setAutoRefreshSeconds(0);
    setAuthToken('');
    setAdminUser('');
    setEditState(initialEditState);
    setLivrosSelecionados([]);
    setUsuariosSelecionados([]);
    setLoginForm({ username: 'admin', password: 'admin123' });
    setMensagem({ text: 'Sessao limpa com sucesso.', type: 'ok' });
  }

  if (!authToken) {
    return (
      <div className="login-page">
        <div className="login-box">
          <span className="eyebrow">Painel Administrativo</span>
          <h1>Sistema Biblioteca</h1>
          <p>Acesso restrito ao administrador.</p>

          {mensagem.text && (
            <div className={`alerta ${mensagem.type === 'error' ? 'alerta-erro' : 'alerta-ok'}`}>
              {mensagem.text}
            </div>
          )}

          <form className="login-form" onSubmit={login}>
            <label htmlFor="username">Usuario admin</label>
            <input
              id="username"
              value={loginForm.username}
              onChange={(e) => setLoginForm((prev) => ({ ...prev, username: e.target.value }))}
              required
            />

            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />

            <button type="submit" disabled={loginLoading}>
              {loginLoading ? 'Entrando...' : 'Entrar'}
            </button>

            <button type="button" className="secondary-btn" onClick={limparSessao}>
              Limpar sessao
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Biblioteca</h1>
        <p>Gestao profissional de acervo e emprestimos</p>
        <nav>
          {sections.map((section) => (
            <button
              key={section.id}
              className={`nav-btn ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span>Sistema online</span>
          <strong>{formatDateTime(lastSync)}</strong>
        </div>
      </aside>

      <main className="content">
        <div className="frame">
        <header className="topbar">
          <div>
            <h2>Painel de Controle</h2>
            <p>{loading ? 'Atualizando dados...' : 'Dados sincronizados com a API.'}</p>
          </div>
          <div className="topbar-actions">
            <span className="sync-chip">Ultima sincronizacao: {formatDateTime(lastSync)}</span>
            <span className="sync-chip">Admin: {adminUser || 'logado'}</span>
            <button className="refresh-btn" onClick={carregarTudo}>Atualizar</button>
            <button className="danger-btn" onClick={() => logout('Logout realizado.')}>Sair</button>
          </div>
        </header>

        {mensagem.text && (
          <div className={`alerta ${mensagem.type === 'error' ? 'alerta-erro' : 'alerta-ok'}`}>
            {mensagem.text}
          </div>
        )}

        <section className="cards">
          <Card titulo="Total de Livros" valor={stats?.totalLivros ?? 0} />
          <Card titulo="Usuarios" valor={stats?.totalUsuarios ?? 0} />
          <Card titulo="Emprestimos Ativos" valor={stats?.emprestimosAtivos ?? 0} />
          <Card titulo="Livros Disponiveis" valor={stats?.livrosDisponiveis ?? 0} />
          <Card titulo="Atrasados" valor={emprestimosAtrasados.length} />
          <Card titulo="Baixo Estoque" valor={livrosBaixoEstoque.length} />
          <Card titulo="Multas (estimativa)" valor={formatCurrency(multasTotais)} />
        </section>

        {activeSection === 'dashboard' && (
          <>
            <section className="panel">
              <h3>Visao Geral</h3>
              <p>
                Use os modulos ao lado para cadastrar, consultar e remover livros e usuarios,
                alem de controlar emprestimos e devolucoes.
              </p>
            </section>
            <section className="panel">
              <h3>Status Operacional</h3>
              <div className="status-grid">
                <StatusItem label="Acervo" value={(stats?.totalLivros ?? 0) > 0 ? 'Ativo' : 'Vazio'} tone={(stats?.totalLivros ?? 0) > 0 ? 'ok' : 'warn'} />
                <StatusItem label="Usuarios" value={(stats?.totalUsuarios ?? 0) > 0 ? 'Ativo' : 'Sem cadastros'} tone={(stats?.totalUsuarios ?? 0) > 0 ? 'ok' : 'warn'} />
                <StatusItem label="Emprestimos" value={(stats?.emprestimosAtivos ?? 0) > 0 ? 'Em andamento' : 'Sem movimentacao'} tone={(stats?.emprestimosAtivos ?? 0) > 0 ? 'info' : 'ok'} />
              </div>
            </section>
            <section className="panel">
              <h3>Alertas de Gestao</h3>
              <div className="status-grid">
                <StatusItem label="Emprestimos atrasados" value={String(emprestimosAtrasados.length)} tone={emprestimosAtrasados.length > 0 ? 'warn' : 'ok'} />
                <StatusItem label="Livros com baixo estoque" value={String(livrosBaixoEstoque.length)} tone={livrosBaixoEstoque.length > 0 ? 'warn' : 'ok'} />
                <StatusItem label="Total de movimentacoes" value={String(stats?.totalEmprestimos ?? 0)} tone='info' />
              </div>
            </section>
            <section className="panel">
              <h3>Usuarios com Pendencias</h3>
              <DataTable
                columns={['Usuario', 'Livros atrasados', 'Dias em atraso', 'Multa estimada']}
                rows={pendenciasPorUsuario.map((item) => [
                  item.usuarioNome,
                  String(item.livrosAtrasados),
                  String(item.diasAtrasoTotal),
                  formatCurrency(item.multaTotal),
                ])}
                emptyMessage="Nenhum usuario com pendencias no momento."
              />
            </section>
          </>
        )}

        {activeSection === 'livros' && (
          <>
            <section className="panel">
              <h3>Cadastrar Livro</h3>
              <form className="form-grid" onSubmit={criarLivro}>
                <input placeholder="Titulo" value={livroForm.titulo} onChange={(e) => atualizarCampo(setLivroForm, 'titulo', e.target.value)} required />
                <input placeholder="Autor" value={livroForm.autor} onChange={(e) => atualizarCampo(setLivroForm, 'autor', e.target.value)} required />
                <input placeholder="ISBN" value={livroForm.isbn} onChange={(e) => atualizarCampo(setLivroForm, 'isbn', e.target.value)} required />
                <input placeholder="Categoria" value={livroForm.categoria} onChange={(e) => atualizarCampo(setLivroForm, 'categoria', e.target.value)} />
                <textarea placeholder="Sinopse" value={livroForm.sinopse} onChange={(e) => atualizarCampo(setLivroForm, 'sinopse', e.target.value)} rows={3} />
                <input type="number" placeholder="Ano" value={livroForm.anoPublicacao} onChange={(e) => atualizarCampo(setLivroForm, 'anoPublicacao', e.target.value)} />
                <input type="number" min="1" placeholder="Quantidade" value={livroForm.quantidadeTotal} onChange={(e) => atualizarCampo(setLivroForm, 'quantidadeTotal', e.target.value)} required />
                <button type="submit">{editState.livroId ? 'Salvar Alterações' : 'Salvar Livro'}</button>
                {editState.livroId && (
                  <button type="button" className="secondary-btn" onClick={cancelarEdicaoLivro}>
                    Cancelar edição
                  </button>
                )}
              </form>
            </section>

            <section className="panel">
              <h3>Livros Cadastrados</h3>
              <div className="table-toolbar">
                <input
                  value={livroSearch}
                  onChange={(e) => setLivroSearch(e.target.value)}
                  placeholder="Buscar por titulo, autor ou ISBN"
                />
                <select
                  value={livroCategoriaFiltro}
                  onChange={(e) => setLivroCategoriaFiltro(e.target.value)}
                  aria-label="Filtrar livros por genero"
                >
                  <option value="todas">Todos os generos</option>
                  {categoriasLivros.map((categoria) => (
                    <option key={categoria} value={categoria}>{categoria}</option>
                  ))}
                </select>
                <span className="count-chip">
                  {livrosTab === 'todos'
                    ? livrosTodosFiltrados.length
                    : livrosTab === 'estoque'
                      ? livrosEmEstoqueFiltrados.length
                      : livrosEmprestadosFiltrados.length} resultados
                </span>
              </div>
              <div className="tab-switch" role="tablist" aria-label="Separar livros por status">
                <button
                  type="button"
                  className={`secondary-btn ${livrosTab === 'todos' ? 'tab-active' : ''}`}
                  onClick={() => setLivrosTab('todos')}
                >
                  Todos
                </button>
                <button
                  type="button"
                  className={`secondary-btn ${livrosTab === 'estoque' ? 'tab-active' : ''}`}
                  onClick={() => setLivrosTab('estoque')}
                >
                  Em Estoque
                </button>
                <button
                  type="button"
                  className={`secondary-btn ${livrosTab === 'emprestados' ? 'tab-active' : ''}`}
                  onClick={() => setLivrosTab('emprestados')}
                >
                  Emprestados
                </button>
              </div>

              {livrosTab === 'todos' ? (
                <DataTable
                  columns={['Titulo', 'Autor', 'ISBN', 'Disponivel', 'Total', 'Qtd excluir', 'Acoes']}
                  rows={livrosTodosFiltrados.map((livro) => [
                    livro.titulo,
                    livro.autor,
                    livro.isbn,
                    <span className={`badge ${livro.quantidadeDisponivel > 0 ? 'badge-ok' : 'badge-warn'}`} key={`disp-all-${livro.id}`}>
                      {livro.quantidadeDisponivel}
                    </span>,
                    String(livro.quantidadeTotal),
                    (livro.quantidadeDisponivel ?? 0) > 0 ? (
                      <input
                        type="number"
                        min="1"
                        max={livro.quantidadeDisponivel}
                        value={quantidadeExclusaoPorLivro[livro.id] ?? 1}
                        onChange={(e) => alterarQuantidadeExclusao(livro, e.target.value)}
                      />
                    ) : '-',
                    <div className="row-actions" key={`acoes-all-livro-${livro.id}`}>
                      <button type="button" onClick={() => setLivroSinopseSelecionado(livro)}>Sinopse</button>
                      <button type="button" onClick={() => iniciarEdicaoLivro(livro)}>Editar</button>
                      {(livro.quantidadeDisponivel ?? 0) > 0 ? (
                        <button
                          className="danger-btn"
                          type="button"
                          onClick={() => deletarLivro(livro.id, getQuantidadeExclusao(livro))}
                        >
                          Excluir unidades
                        </button>
                      ) : (
                        <span className="badge badge-info">Sem estoque</span>
                      )}
                    </div>,
                  ])}
                  emptyMessage="Nenhum livro cadastrado."
                />
              ) : livrosTab === 'estoque' ? (
                <>
                  <div className="batch-actions">
                    <label className="batch-check">
                      <input
                        type="checkbox"
                        checked={livrosEmEstoqueFiltrados.length > 0 && livrosEmEstoqueFiltrados.every((livro) => livrosSelecionados.includes(livro.id))}
                        onChange={(e) => alternarSelecionarTodosEstoque(e.target.checked)}
                      />
                      Selecionar todos visiveis
                    </label>
                    <button type="button" className="secondary-btn" onClick={() => setLivrosSelecionados([])}>
                      Limpar selecao
                    </button>
                    <button type="button" className="danger-btn" onClick={deletarLivrosSelecionados}>
                      Excluir selecionados
                    </button>
                  </div>
                <DataTable
                  columns={['Sel', 'Titulo', 'Autor', 'ISBN', 'Disponivel', 'Total', 'Qtd excluir', 'Acoes']}
                  rows={livrosEmEstoqueFiltrados.map((livro) => [
                    <input
                      type="checkbox"
                      key={`sel-${livro.id}`}
                      checked={livrosSelecionados.includes(livro.id)}
                      onChange={(e) => alternarSelecaoLivro(livro.id, e.target.checked)}
                    />,
                    livro.titulo,
                    livro.autor,
                    livro.isbn,
                    <span className="badge badge-ok" key={`disp-${livro.id}`}>
                      {livro.quantidadeDisponivel}
                    </span>,
                    String(livro.quantidadeTotal),
                    <input
                      type="number"
                      min="1"
                      max={livro.quantidadeDisponivel}
                      value={quantidadeExclusaoPorLivro[livro.id] ?? 1}
                      onChange={(e) => alterarQuantidadeExclusao(livro, e.target.value)}
                    />,
                    <div className="row-actions" key={`acoes-livro-${livro.id}`}>
                      <button type="button" onClick={() => setLivroSinopseSelecionado(livro)}>Sinopse</button>
                      <button type="button" onClick={() => iniciarEdicaoLivro(livro)}>Editar</button>
                      <button
                        className="danger-btn"
                        type="button"
                        onClick={() => deletarLivro(livro.id, getQuantidadeExclusao(livro))}
                      >
                        Excluir unidades
                      </button>
                    </div>,
                  ])}
                  emptyMessage="Nenhum livro em estoque."
                />
                </>
              ) : (
                <DataTable
                  columns={['Titulo', 'Autor', 'ISBN', 'Emprestados', 'Disponivel']}
                  rows={livrosEmprestadosFiltrados.map((livro) => [
                    livro.titulo,
                    livro.autor,
                    livro.isbn,
                    <span className="badge badge-warn" key={`emp-${livro.id}`}>
                      {(livro.quantidadeTotal ?? 0) - (livro.quantidadeDisponivel ?? 0)}
                    </span>,
                    String(livro.quantidadeDisponivel ?? 0),
                  ])}
                  emptyMessage="Nenhum livro emprestado no momento."
                />
              )}
            </section>

            <section className="panel">
              <h3>Alerta de Baixo Estoque</h3>
              <DataTable
                columns={['Titulo', 'Autor', 'Disponivel', 'Total']}
                rows={livrosBaixoEstoque.map((livro) => [
                  livro.titulo,
                  livro.autor,
                  String(livro.quantidadeDisponivel),
                  String(livro.quantidadeTotal),
                ])}
                emptyMessage="Nenhum livro em baixo estoque."
              />
            </section>

            <section className="panel">
              <h3>Resumo dos Livros em Estoque</h3>
              <DataTable
                columns={['Livro', 'Disponivel', 'Resumo']}
                rows={livros
                  .filter((livro) => (livro.quantidadeDisponivel ?? 0) > 0)
                  .map((livro) => [
                    livro.titulo,
                    String(livro.quantidadeDisponivel),
                    <button type="button" onClick={() => setLivroSinopseSelecionado(livro)}>
                      Abrir sinopse
                    </button>,
                  ])}
                emptyMessage="Nenhum livro disponivel em estoque."
              />
            </section>
          </>
        )}

        {activeSection === 'usuarios' && (
          <>
            <section className="panel">
              <h3>Cadastrar Usuario</h3>
              <form className="form-grid" onSubmit={criarUsuario}>
                <input placeholder="Nome" value={usuarioForm.nome} onChange={(e) => atualizarCampo(setUsuarioForm, 'nome', e.target.value)} required />
                <input type="email" placeholder="Email" value={usuarioForm.email} onChange={(e) => atualizarCampo(setUsuarioForm, 'email', e.target.value)} required />
                <input placeholder="Documento" value={usuarioForm.documento} onChange={(e) => atualizarCampo(setUsuarioForm, 'documento', e.target.value)} required />
                <input placeholder="Telefone" value={usuarioForm.telefone} onChange={(e) => atualizarCampo(setUsuarioForm, 'telefone', e.target.value)} />
                <button type="submit">Salvar Usuario</button>
              </form>
            </section>

            <section className="panel">
              <h3>Usuarios Cadastrados</h3>
              <div className="table-toolbar">
                <input
                  value={usuarioSearch}
                  onChange={(e) => setUsuarioSearch(e.target.value)}
                  placeholder="Buscar por nome, email ou documento"
                />
                <span className="count-chip">{usuariosFiltrados.length} resultados</span>
              </div>
              <div className="batch-actions">
                <label className="batch-check">
                  <input
                    type="checkbox"
                    checked={todosUsuariosSelecionados}
                    onChange={(e) => alternarSelecionarTodosUsuarios(e.target.checked)}
                  />
                  Selecionar todos visiveis
                </label>
                <button type="button" className="secondary-btn" onClick={() => setUsuariosSelecionados([])}>
                  Limpar selecao
                </button>
                <button type="button" className="danger-btn" onClick={deletarUsuariosSelecionados}>
                  Excluir selecionados
                </button>
              </div>
              <DataTable
                columns={['Sel', 'Nome', 'Email', 'Documento', 'Cadastro', 'Acoes']}
                rows={usuariosFiltrados.map((usuario) => [
                  <input
                    type="checkbox"
                    key={`sel-usuario-${usuario.id}`}
                    checked={usuariosSelecionados.includes(usuario.id)}
                    onChange={(e) => {
                      setUsuariosSelecionados((prev) => (
                        e.target.checked
                          ? (prev.includes(usuario.id) ? prev : [...prev, usuario.id])
                          : prev.filter((id) => id !== usuario.id)
                      ));
                    }}
                  />,
                  usuario.nome,
                  usuario.email,
                  usuario.documento,
                  formatDate(usuario.dataCadastro),
                  <div className="row-actions" key={`actions-usuario-${usuario.id}`}>
                    <button type="button" onClick={() => iniciarEdicaoUsuario(usuario)}>
                      Editar
                    </button>
                    <button className="danger-btn" type="button" onClick={() => deletarUsuario(usuario.id)}>
                      Excluir
                    </button>
                  </div>,
                ])}
                emptyMessage="Nenhum usuario cadastrado."
              />
            </section>
          </>
        )}

        {activeSection === 'emprestimos' && (
          <>
            <section className="panel">
              <h3>Novo Emprestimo</h3>
              <form className="form-grid" onSubmit={criarEmprestimo}>
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
            </section>

            <section className="panel">
              <h3>Emprestimos Ativos</h3>
              <div className="table-toolbar">
                <input
                  value={emprestimoSearch}
                  onChange={(e) => setEmprestimoSearch(e.target.value)}
                  placeholder="Buscar por livro ou usuario"
                />
                <span className="count-chip">{emprestimosFiltrados.length} resultados</span>
              </div>
              <DataTable
                columns={['Livro', 'Usuario', 'Emprestimo', 'Previsto', 'Acoes']}
                rows={emprestimosFiltrados.map((emp) => [
                  emp.livroTitulo,
                  emp.usuarioNome,
                  formatDate(emp.dataEmprestimo),
                  formatDate(emp.dataPrevistaDevolucao),
                  <button key={`devolver-${emp.id}`} onClick={() => devolver(emp.id)}>Registrar Devolucao</button>,
                ])}
                emptyMessage="Nenhum emprestimo ativo."
              />
            </section>

            <section className="panel">
              <h3>Emprestimos Atrasados</h3>
              <DataTable
                columns={['Livro', 'Usuario', 'Previsto', 'Dias em atraso']}
                rows={emprestimosAtrasados.map((emp) => [
                  emp.livroTitulo,
                  emp.usuarioNome,
                  formatDate(emp.dataPrevistaDevolucao),
                  String(diffDaysFromToday(emp.dataPrevistaDevolucao)),
                ])}
                emptyMessage="Nenhum emprestimo atrasado."
              />
            </section>

            <section className="panel">
              <h3>Pendencias e Multas por Usuario</h3>
              <DataTable
                columns={['Usuario', 'Livros atrasados', 'Dias em atraso', 'Multa estimada']}
                rows={pendenciasPorUsuario.map((item) => [
                  item.usuarioNome,
                  String(item.livrosAtrasados),
                  String(item.diasAtrasoTotal),
                  formatCurrency(item.multaTotal),
                ])}
                emptyMessage="Nenhuma pendencia ativa."
              />
            </section>

            <section className="panel">
              <h3>Historico de Emprestimos</h3>
              <DataTable
                columns={['Livro', 'Usuario', 'Status', 'Data de Devolucao']}
                rows={historicoEmprestimos.map((emp) => [
                  emp.livroTitulo,
                  emp.usuarioNome,
                  emp.status,
                  formatDate(emp.dataDevolucao),
                ])}
                emptyMessage="Sem historico de emprestimos."
              />
            </section>
          </>
        )}

        {activeSection === 'configuracoes' && (
          <section className="panel">
            <h3>Configuracoes de Interface</h3>
            <div className="settings-row">
              <div>
                <strong>Tema da Aplicacao</strong>
                <p>Alterne entre modo claro e modo escuro.</p>
              </div>
              <button onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}>
                {theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
              </button>
            </div>
              <div className="settings-row">
                <div>
                  <strong>Modo Compacto</strong>
                  <p>Reduz espacamentos para maior densidade de informacao.</p>
                </div>
                <button onClick={() => setCompactMode((prev) => !prev)}>
                  {compactMode ? 'Desativar modo compacto' : 'Ativar modo compacto'}
                </button>
              </div>
              <div className="settings-row">
                <div>
                  <strong>Confirmacao de Acoes Criticas</strong>
                  <p>Exibe janela de confirmacao antes de excluir itens.</p>
                </div>
                <button onClick={() => setConfirmActions((prev) => !prev)}>
                  {confirmActions ? 'Desativar confirmacao' : 'Ativar confirmacao'}
                </button>
              </div>
              <div className="settings-row">
                <div>
                  <strong>Autoatualizacao</strong>
                  <p>Sincroniza os dados automaticamente.</p>
                </div>
                <select
                  value={autoRefreshSeconds}
                  onChange={(e) => setAutoRefreshSeconds(Number(e.target.value))}
                >
                  <option value={0}>Desativada</option>
                  <option value={30}>A cada 30 segundos</option>
                  <option value={60}>A cada 1 minuto</option>
                  <option value={120}>A cada 2 minutos</option>
                </select>
              </div>
              <div className="settings-row">
                <div>
                  <strong>Modulo Inicial</strong>
                  <p>Define qual tela abre por padrao.</p>
                </div>
                <select
                  value={activeSection}
                  onChange={(e) => setActiveSection(e.target.value)}
                >
                  {sections
                    .filter((section) => section.id !== 'configuracoes')
                    .map((section) => (
                      <option key={section.id} value={section.id}>{section.label}</option>
                    ))}
                </select>
              </div>
              <div className="settings-row">
                <div>
                  <strong>Exportacao de Dados (CSV)</strong>
                  <p>Baixe relatórios rápidos para acompanhamento.</p>
                </div>
                <div className="settings-actions">
                  <button type="button" onClick={() => exportarLivrosCsv(livros)}>Exportar Livros</button>
                  <button type="button" onClick={() => exportarUsuariosCsv(usuarios)}>Exportar Usuarios</button>
                  <button type="button" onClick={() => exportarEmprestimosCsv(historicoEmprestimos)}>Exportar Emprestimos</button>
                  <button type="button" onClick={() => exportarPendenciasCsv(pendenciasPorUsuario)}>Exportar Pendencias</button>
                </div>
              </div>
              <div className="settings-row">
                <div>
                  <strong>Multa por Dia de Atraso</strong>
                  <p>Valor usado no calculo estimado de multas.</p>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={multaPorDia}
                  onChange={(e) => setMultaPorDia(Number(e.target.value || 0))}
                />
              </div>
          </section>
        )}

        {livroSinopseSelecionado && (
          <div className="modal-backdrop" onClick={() => setLivroSinopseSelecionado(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h3>{livroSinopseSelecionado.titulo}</h3>
              <p><strong>Autor:</strong> {livroSinopseSelecionado.autor}</p>
              <p><strong>Categoria:</strong> {livroSinopseSelecionado.categoria || '-'}</p>
              <p className="sinopse-texto">{livroSinopseSelecionado.sinopse || 'Sem sinopse cadastrada para este livro.'}</p>
              <button type="button" onClick={() => setLivroSinopseSelecionado(null)}>Fechar</button>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

function StatusItem({ label, value, tone }) {
  return (
    <div className="status-item">
      <span>{label}</span>
      <strong className={`badge ${tone === 'ok' ? 'badge-ok' : tone === 'warn' ? 'badge-warn' : 'badge-info'}`}>
        {value}
      </strong>
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

function DataTable({ columns, rows, emptyMessage }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="empty-row">{emptyMessage}</td>
            </tr>
          )}
          {rows.map((row, rowIndex) => (
            <tr key={`${columns[0]}-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`${columns[cellIndex]}-${rowIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString('pt-BR');
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }

  return value.toLocaleString('pt-BR');
}

function getApiErrorMessage(error, fallback) {
  const apiMessage = error?.response?.data?.message;
  return typeof apiMessage === 'string' && apiMessage.trim() ? apiMessage : fallback;
}

function diffDaysFromToday(dateValue) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(dateValue);
  data.setHours(0, 0, 0, 0);
  const diffMs = hoje.getTime() - data.getTime();
  return diffMs > 0 ? Math.floor(diffMs / (1000 * 60 * 60 * 24)) : 0;
}

function exportarLivrosCsv(livros) {
  exportCsv('livros.csv', ['id', 'titulo', 'autor', 'isbn', 'sinopse', 'disponivel', 'total'],
    livros.map((livro) => [
      livro.id,
      livro.titulo,
      livro.autor,
      livro.isbn,
      livro.sinopse,
      livro.quantidadeDisponivel,
      livro.quantidadeTotal,
    ]));
}

function exportarUsuariosCsv(usuarios) {
  exportCsv('usuarios.csv', ['id', 'nome', 'email', 'documento', 'telefone'],
    usuarios.map((usuario) => [
      usuario.id,
      usuario.nome,
      usuario.email,
      usuario.documento,
      usuario.telefone,
    ]));
}

function exportarEmprestimosCsv(emprestimos) {
  exportCsv('emprestimos.csv', ['id', 'livro', 'usuario', 'status', 'emprestimo', 'prevista', 'devolucao'],
    emprestimos.map((emprestimo) => [
      emprestimo.id,
      emprestimo.livroTitulo,
      emprestimo.usuarioNome,
      emprestimo.status,
      emprestimo.dataEmprestimo,
      emprestimo.dataPrevistaDevolucao,
      emprestimo.dataDevolucao,
    ]));
}

function exportarPendenciasCsv(pendencias) {
  exportCsv('pendencias_multas.csv', ['usuario', 'livros_atrasados', 'dias_atraso', 'multa_estimada'],
    pendencias.map((item) => [
      item.usuarioNome,
      item.livrosAtrasados,
      item.diasAtrasoTotal,
      item.multaTotal.toFixed(2),
    ]));
}

function exportCsv(fileName, headers, rows) {
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const csv = [headers.join(','), ...rows.map((row) => row.map(escape).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}
