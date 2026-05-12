const { useState, useEffect, useRef } = React;
const h = React.createElement;

const API_BASE = `${window.location.origin}/api`;

const buttonBase = 'inline-flex min-h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60';
const primaryButton = `${buttonBase} bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 focus:ring-blue-100`;
const successButton = `${buttonBase} bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 focus:ring-emerald-100`;
const dangerButton = `${buttonBase} border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 focus:ring-rose-100`;
const fieldClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100';

function App() {
  const [tab, setTab] = useState('chat');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    setSuccess('Logged out');
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        throw new Error('Login failed');
      }

      const data = await res.json();
      setToken(data.token);
      localStorage.setItem('token', data.token);
      setEmail('');
      setPassword('');
      setSuccess('Logged in successfully');
      setTab('chat');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return h('main', { className: 'min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8' },
      h('section', { className: 'mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]' },
        h('div', { className: 'space-y-6' },
          h('div', { className: 'inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700' },
            h('span', { className: 'h-2 w-2 rounded-full bg-blue-600' }),
            'Controlled RAG workspace'
          ),
          h('div', { className: 'space-y-4' },
            h('h1', { className: 'max-w-2xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl' }, 'RAG Company Assistant'),
            h('p', { className: 'max-w-xl text-base leading-7 text-slate-600 sm:text-lg' },
              'Upload company documents, retrieve trusted context, and answer only from approved knowledge.'
            )
          ),
          h('div', { className: 'grid max-w-xl gap-3 sm:grid-cols-3' },
            h(Metric, { label: 'Pipeline', value: 'RAG' }),
            h(Metric, { label: 'Access', value: 'JWT' }),
            h(Metric, { label: 'Scope', value: 'Tenant' })
          )
        ),
        h('div', { className: 'rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8' },
          h('div', { className: 'mb-6' },
            h('h2', { className: 'text-2xl font-bold text-slate-950' }, 'Sign in'),
            h('p', { className: 'mt-1 text-sm text-slate-500' }, 'Use the demo account to open the assistant.')
          ),
          error && h(Alert, { type: 'error', message: error }),
          success && h(Alert, { type: 'success', message: success }),
          h('form', { onSubmit: handleLogin, className: 'space-y-4' },
            h(Field, { label: 'Email' },
              h('input', {
                className: fieldClass,
                type: 'email',
                value: email,
                onChange: (event) => setEmail(event.target.value),
                placeholder: 'admin@acme.com',
                required: true
              })
            ),
            h(Field, { label: 'Password' },
              h('input', {
                className: fieldClass,
                type: 'password',
                value: password,
                onChange: (event) => setPassword(event.target.value),
                placeholder: 'admin123',
                required: true
              })
            ),
            h('button', { type: 'submit', className: `${primaryButton} w-full`, disabled: loading },
              loading ? 'Signing in...' : 'Sign in'
            )
          ),
          h('div', { className: 'mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600' },
            h('span', { className: 'font-semibold text-slate-800' }, 'Demo: '),
            'admin@acme.com / admin123'
          )
        )
      )
    );
  }

  return h('div', { className: 'min-h-screen bg-slate-50 text-slate-950' },
    h('header', { className: 'sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl' },
      h('div', { className: 'mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8' },
        h('div', null,
          h('h1', { className: 'text-xl font-bold tracking-tight text-slate-950' }, 'RAG Company Assistant'),
          h('p', { className: 'mt-1 text-sm text-slate-500' }, 'Secure document retrieval, grounded answers, citation-aware chat')
        ),
        h('nav', { className: 'flex flex-wrap gap-2' },
          h(NavButton, { active: tab === 'chat', onClick: () => setTab('chat') }, 'Chat'),
          h(NavButton, { active: tab === 'documents', onClick: () => setTab('documents') }, 'Documents'),
          h(NavButton, { active: tab === 'admin', onClick: () => setTab('admin') }, 'Admin'),
          h('button', { className: dangerButton, onClick: handleLogout }, 'Logout')
        )
      )
    ),
    h('main', { className: 'mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8' },
      tab === 'chat' && h(ChatTab, { token }),
      tab === 'documents' && h(DocumentsTab, { token }),
      tab === 'admin' && h(AdminTab, { token })
    )
  );
}

function Metric({ label, value }) {
  return h('div', { className: 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm' },
    h('div', { className: 'text-lg font-bold text-slate-950' }, value),
    h('div', { className: 'mt-1 text-xs font-medium uppercase tracking-wide text-slate-500' }, label)
  );
}

function NavButton({ active, onClick, children }) {
  return h('button', {
    className: active
      ? 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/20'
      : 'rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950',
    onClick
  }, children);
}

function Alert({ type, message }) {
  const styles = type === 'error'
    ? 'border-rose-200 bg-rose-50 text-rose-800'
    : 'border-emerald-200 bg-emerald-50 text-emerald-800';

  return h('div', { className: `mb-4 rounded-lg border px-3 py-2 text-sm ${styles}` }, message);
}

function Field({ label, children }) {
  return h('label', { className: 'block' },
    h('span', { className: 'mb-1.5 block text-sm font-semibold text-slate-700' }, label),
    children
  );
}

function Panel({ title, subtitle, children, className = '' }) {
  return h('section', { className: `rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70 sm:p-6 ${className}` },
    h('div', { className: 'mb-5' },
      h('h2', { className: 'text-lg font-bold text-slate-950' }, title),
      subtitle && h('p', { className: 'mt-1 text-sm text-slate-500' }, subtitle)
    ),
    children
  );
}

function EmptyState({ title, description }) {
  return h('div', { className: 'grid min-h-48 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center' },
    h('div', null,
      h('div', { className: 'mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600' }, 'i'),
      h('strong', { className: 'block text-sm font-bold text-slate-900' }, title),
      h('p', { className: 'mt-1 max-w-sm text-sm leading-6 text-slate-500' }, description)
    )
  );
}

function ChatTab({ token }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEnd = useRef(null);

  useEffect(() => {
    if (messagesEnd.current) {
      messagesEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!message.trim()) {
      return;
    }

    const userMsg = message;
    setMessage('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: userMsg, conversationId })
      });

      if (!res.ok) {
        throw new Error('Chat failed');
      }

      const data = await res.json();
      setConversationId(data.conversationId);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer, sources: data.sources || [] }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return h('div', { className: 'grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]' },
    h(Panel, {
      title: 'Company Knowledge Chat',
      subtitle: 'Ask questions that can be answered from indexed company documents.',
      className: 'min-w-0'
    },
      error && h(Alert, { type: 'error', message: error }),
      h('div', { className: 'flex h-[70vh] min-h-[520px] flex-col' },
        h('div', { className: 'min-h-0 flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4' },
          messages.length === 0 && h(EmptyState, {
            title: 'Ask from approved company documents',
            description: 'The assistant retrieves matching chunks first and refuses answers when document context is insufficient.'
          }),
          messages.map((msg, index) => h(ChatMessage, { key: index, message: msg })),
          loading && h('div', { className: 'mt-3 flex items-center gap-2 text-sm text-slate-500' },
            h('span', { className: 'h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600' }),
            'Retrieving context...'
          ),
          h('div', { ref: messagesEnd })
        ),
        h('form', { onSubmit: sendMessage, className: 'mt-4 flex flex-col gap-3 sm:flex-row' },
          h('input', {
            type: 'text',
            value: message,
            onChange: (event) => setMessage(event.target.value),
            placeholder: 'Ask a company policy, process, or document question...',
            disabled: loading,
            className: `${fieldClass} min-h-11 flex-1`
          }),
          h('button', { type: 'submit', className: `${primaryButton} sm:w-28`, disabled: loading }, 'Send')
        )
      )
    ),
    h('aside', { className: 'grid gap-4' },
      h('div', { className: 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm' },
        h('h3', { className: 'text-sm font-bold text-slate-900' }, 'RAG pipeline'),
        h('ol', { className: 'mt-4 space-y-3 text-sm text-slate-600' },
          ['Embed query', 'Search vectors', 'Retrieve chunks', 'Inject context', 'Generate answer'].map((step, index) =>
            h('li', { key: step, className: 'flex items-center gap-3' },
              h('span', { className: 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700' }, index + 1),
              step
            )
          )
        )
      ),
      h('div', { className: 'rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900' },
        h('strong', { className: 'block text-amber-950' }, 'Controlled behavior'),
        'The assistant should answer only when retrieved company context is strong enough.'
      )
    )
  );
}

function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return h('div', { className: `mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}` },
    h('div', {
      className: isUser
        ? 'max-w-[92%] rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 text-sm leading-6 text-white shadow-sm sm:max-w-[78%]'
        : 'max-w-[96%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 shadow-sm sm:max-w-[84%]'
    },
      h('div', { className: 'whitespace-pre-wrap break-words' }, message.content),
      !isUser && message.sources && message.sources.length > 0 && h('div', { className: 'mt-4 space-y-2 border-t border-slate-200 pt-3' },
        message.sources.map((source) => h('div', {
          key: `${source.documentId}-${source.chunkIndex}`,
          className: 'rounded-xl border border-blue-100 bg-blue-50/60 p-3'
        },
          h('div', { className: 'flex flex-wrap items-center gap-2 text-xs' },
            h('span', { className: 'rounded-full bg-blue-600 px-2 py-0.5 font-bold text-white' }, `Source ${source.sourceId}`),
            h('strong', { className: 'font-semibold text-slate-900' }, source.fileName),
            h('span', { className: 'text-slate-500' }, `chunk ${source.chunkIndex + 1} - score ${source.score}`)
          ),
          h('p', { className: 'mt-2 text-xs leading-5 text-slate-600' }, source.snippet)
        ))
      )
    )
  );
}

function DocumentsTab({ token }) {
  const [documents, setDocuments] = useState([]);
  const [files, setFiles] = useState([]);
  const [department, setDepartment] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_BASE}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (files.length === 0) {
      setError('Please select files');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    if (department) formData.append('department', department);
    if (tags) formData.append('tags', tags);

    try {
      const res = await fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      setSuccess('Documents uploaded and indexed');
      setFiles([]);
      setDepartment('');
      setTags('');
      fetchDocuments();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (docId) => {
    if (!confirm('Delete this document?')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/documents/${docId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Delete failed');
      }

      setSuccess('Document deleted');
      fetchDocuments();
    } catch (err) {
      setError(err.message);
    }
  };

  return h('div', { className: 'grid gap-6 lg:grid-cols-[0.85fr_1.15fr]' },
    h(Panel, { title: 'Upload Documents', subtitle: 'Index PDF, TXT, DOCX, or Markdown company knowledge.' },
      error && h(Alert, { type: 'error', message: error }),
      success && h(Alert, { type: 'success', message: success }),
      h('form', { onSubmit: handleUpload, className: 'space-y-4' },
        h(Field, { label: 'Files' },
          h('input', {
            className: `${fieldClass} border-dashed bg-slate-50`,
            type: 'file',
            multiple: true,
            onChange: (event) => setFiles(Array.from(event.target.files)),
            accept: '.pdf,.txt,.docx,.md'
          })
        ),
        h('p', { className: 'text-sm text-slate-500' }, files.length ? `${files.length} file(s) selected` : 'Supported: PDF, TXT, DOCX, MD'),
        h('div', { className: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2' },
          h(Field, { label: 'Department' },
            h('input', {
              className: fieldClass,
              type: 'text',
              value: department,
              onChange: (event) => setDepartment(event.target.value),
              placeholder: 'e.g., HR'
            })
          ),
          h(Field, { label: 'Tags' },
            h('input', {
              className: fieldClass,
              type: 'text',
              value: tags,
              onChange: (event) => setTags(event.target.value),
              placeholder: 'policy, leave'
            })
          )
        ),
        h('button', { type: 'submit', className: `${successButton} w-full`, disabled: loading },
          loading ? 'Indexing...' : 'Upload and Index'
        )
      )
    ),
    h(Panel, { title: `Documents (${documents.length})`, subtitle: 'Tenant-scoped files available for retrieval.' },
      documents.length === 0
        ? h(EmptyState, { title: 'No indexed documents', description: 'Upload company files to make them searchable in chat.' })
        : h('div', { className: 'grid max-h-[620px] gap-3 overflow-y-auto pr-1' },
          documents.map((doc) => h('article', {
            key: doc.documentId,
            className: 'flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between'
          },
            h('div', { className: 'min-w-0' },
              h('h3', { className: 'break-words text-sm font-bold text-slate-950' }, doc.fileName),
              h('div', { className: 'mt-2 flex flex-wrap gap-2 text-xs text-slate-600' },
                h('span', { className: 'rounded-full bg-white px-2 py-1 ring-1 ring-slate-200' }, `${doc.chunkCount} chunks`),
                h('span', { className: 'rounded-full bg-white px-2 py-1 ring-1 ring-slate-200' }, doc.department || 'No department'),
                doc.tags && doc.tags.map((tag) => h('span', {
                  key: tag,
                  className: 'rounded-full bg-blue-50 px-2 py-1 text-blue-700 ring-1 ring-blue-100'
                }, tag))
              )
            ),
            h('button', { className: `${dangerButton} shrink-0`, onClick: () => deleteDocument(doc.documentId) }, 'Delete')
          ))
        )
    )
  );
}

function AdminTab({ token }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await res.json();
      setAnalytics(data.analytics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return h(Panel, { title: 'Admin Analytics', subtitle: 'Usage events and recent activity for this tenant.' },
    error && h(Alert, { type: 'error', message: error }),
    loading && h('div', { className: 'flex items-center gap-2 text-sm text-slate-500' },
      h('span', { className: 'h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600' }),
      'Loading analytics...'
    ),
    analytics && h('div', { className: 'space-y-6' },
      h('div', { className: 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4' },
        h(StatCard, { label: 'Total Events', value: analytics.totalEvents }),
        h(StatCard, { label: 'Event Types', value: Object.keys(analytics.countsByType).length }),
        h(StatCard, { label: 'Recent Events', value: analytics.recentEvents.length }),
        h(StatCard, { label: 'Tenant Scope', value: 'On' })
      ),
      h('div', { className: 'grid gap-6 lg:grid-cols-2' },
        h('section', null,
          h('h3', { className: 'mb-3 text-sm font-bold text-slate-900' }, 'Event Breakdown'),
          h('div', { className: 'space-y-2' },
            Object.entries(analytics.countsByType).map(([type, count]) =>
              h('div', { key: type, className: 'flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm' },
                h('span', { className: 'font-medium text-slate-700' }, type),
                h('span', { className: 'font-bold text-slate-950' }, count)
              )
            )
          )
        ),
        h('section', null,
          h('h3', { className: 'mb-3 text-sm font-bold text-slate-900' }, 'Recent Events'),
          h('div', { className: 'max-h-80 space-y-2 overflow-y-auto pr-1' },
            analytics.recentEvents.map((event, index) =>
              h('div', { key: index, className: 'rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm' },
                h('div', { className: 'font-semibold text-slate-900' }, event.type),
                h('div', { className: 'mt-1 text-xs text-slate-500' }, new Date(event.timestamp).toLocaleString())
              )
            )
          )
        )
      )
    )
  );
}

function StatCard({ label, value }) {
  return h('div', { className: 'rounded-xl border border-slate-200 bg-slate-50 p-4' },
    h('div', { className: 'text-2xl font-bold text-blue-700' }, value),
    h('div', { className: 'mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500' }, label)
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(h(App));
