import { useState, useEffect } from 'react'
import axios from 'axios'

const COLORS = {
  sidebarBg: '#1e293b', sidebarText: '#f1f5f9', sidebarTextMuted: '#94a3b8', sidebarActive: '#334155',
  contentBg: '#f1f5f9', cardBg: '#ffffff', textMain: '#0f172a', textSubtle: '#475569', textMuted: '#64748b',
  primary: '#0ea5e9', primaryHover: '#0284c7', danger: '#ef4444', success: '#10b981', warning: '#f59e0b', border: '#e2e8f0',
  kanbanCol: '#f8fafc'
};

const STYLES = {
  card: { background: COLORS.cardBg, padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: `1px solid ${COLORS.border}` },
  input: { padding: '10px 14px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, fontSize: '14px', background: '#f8fafc', color: COLORS.textMain, width: '100%', boxSizing: 'border-box' },
  btnPrimary: { padding: '10px 15px', background: COLORS.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  btnDanger: { padding: '8px 12px', background: COLORS.danger, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  btnEdit: { padding: '8px 12px', background: COLORS.warning, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginLeft: '10px' },
  kpiCard: { flex: 1, background: 'white', padding: '20px', borderRadius: '12px', borderLeft: `5px solid ${COLORS.primary}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
};

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  
  // NOU: Am adăugat admin_code în starea inițială
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', role: 'Angajat', admin_code: '' })
  
  const [activeTab, setActiveTab] = useState('HR')
  
  // --- STATE-URI BAZE DE DATE ---
  const [usersList, setUsersList] = useState([])
  const [timeLogsList, setTimeLogsList] = useState([])
  const [clientsList, setClientsList] = useState([])
  const [projectsList, setProjectsList] = useState([])
  const [transactionsList, setTransactionsList] = useState([]) 

  // --- STATE-URI FORMULARE ---
  const [timeData, setTimeData] = useState({ date: '', hours: '', description: '' })
  const [editLogId, setEditLogId] = useState(null)
  const [clientData, setClientData] = useState({ name: '', contact_email: '', industry: 'IT' })
  const [projectData, setProjectData] = useState({ client_id: '', name: '', budget: '', status: 'Planificare' })
  const [transactionData, setTransactionData] = useState({ project_id: '', type: 'Incasare', amount: '', date: '', description: '' }) 
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [selectedUserForCalendar, setSelectedUserForCalendar] = useState('')

  // ==========================================
  // API FETCH FUNCTIONS
  // ==========================================
  const fetchUsers = () => axios.get('http://20.240.193.135:8000/users/').then(res => setUsersList(res.data)).catch(console.error)
  const fetchTimeLogs = () => axios.get('http://20.240.193.135:8000/time_logs/').then(res => setTimeLogsList(res.data)).catch(console.error)
  const fetchClients = () => axios.get('http://20.240.193.135:8000/clients/').then(res => setClientsList(res.data)).catch(console.error)
  const fetchProjects = () => axios.get('http://20.240.193.135:8000/projects/').then(res => setProjectsList(res.data)).catch(console.error)
  const fetchTransactions = () => axios.get('http://20.240.193.135:8000/transactions/').then(res => setTransactionsList(res.data)).catch(console.error) 

  const handleLogin = (e) => {
    e.preventDefault()
    axios.post('http://20.240.193.135:8000/login/', loginData)
      .then(res => {
        setCurrentUser(res.data)
        setSelectedUserForCalendar(res.data.id)
        fetchUsers(); fetchTimeLogs(); fetchClients(); fetchProjects(); fetchTransactions();
      }).catch(err => alert("Eroare la logare! Verifica email si parola."))
  }

  const handleRegister = (e) => {
    e.preventDefault()
    // Trimitem datele catre backend, inclusiv admin_code
    axios.post('http://20.240.193.135:8000/users/', registerData)
      .then(() => { 
        alert("Cont creat cu succes!"); 
        setIsLoginMode(true);
        // Resetam datele după inregistrare, mai putin codul de admin care il curatam manual
        setRegisterData({ name: '', email: '', password: '', role: 'Angajat', admin_code: '' });
      })
      .catch((error) => {
          // Prindem mesajul de eroare din backend (daca e cod invalid, ex: 403)
          if (error.response && error.response.status === 403) {
              alert(error.response.data.detail || "Eroare: Cod de admin invalid!");
          } else {
             alert("Eroare la crearea contului!");
          }
      })
  }

  const handleLogout = () => { setCurrentUser(null); setLoginData({ email: '', password: '' }); setActiveTab('HR'); }

  // ==========================================
  // HANDLERS (SUBMITS & DELETES)
  // ==========================================
  const handleDeleteUser = (id) => { if (window.confirm("Ștergi angajatul?")) axios.delete(`http://20.240.193.135:8000/users/${id}`).then(fetchUsers) }
  
  const handleTimeSubmit = (e) => {
    e.preventDefault()
    const payload = { user_id: currentUser.id, date: timeData.date, hours: parseFloat(timeData.hours), description: timeData.description }

    if (editLogId) {
      axios.put(`http://20.240.193.135:8000/time_logs/${editLogId}`, payload)
        .then(() => { alert("Modificat!"); setTimeData({ date: '', hours: '', description: '' }); setEditLogId(null); fetchTimeLogs() })
        .catch(() => alert("Eroare la modificare!"))
    } else {
      axios.post('http://20.240.193.135:8000/time_logs/', payload)
        .then(() => { alert("Salvat!"); setTimeData({ date: '', hours: '', description: '' }); fetchTimeLogs() })
        .catch(() => alert("Eroare la salvare!"))
    }
  }

  const startEditingTimeLog = (log) => {
    setTimeData({ date: log.date, hours: log.hours, description: log.description })
    setEditLogId(log.id)
  }

  const handleDeleteTimeLog = (logId) => {
    if (window.confirm("Sigur vrei să ștergi acest pontaj?")) {
      axios.delete(`http://20.240.193.135:8000/time_logs/${logId}`)
        .then(() => fetchTimeLogs())
        .catch(() => alert("Eroare la ștergerea pontajului!"));
    }
  }

  const handleClientSubmit = (e) => {
    e.preventDefault()
    axios.post('http://20.240.193.135:8000/clients/', clientData)
      .then(() => { alert("Client adăugat!"); setClientData({ name: '', contact_email: '', industry: 'IT' }); fetchClients() })
  }

  const handleProjectSubmit = (e) => {
    e.preventDefault()
    axios.post('http://20.240.193.135:8000/projects/', { client_id: parseInt(projectData.client_id), name: projectData.name, budget: parseFloat(projectData.budget), status: projectData.status })
      .then(() => { alert("Proiect creat!"); setProjectData({ client_id: '', name: '', budget: '', status: 'Planificare' }); fetchProjects() })
  }

  const handleStatusChange = (projectId, newStatus) => {
    axios.put(`http://20.240.193.135:8000/projects/${projectId}/status?status=${newStatus}`)
      .then(() => fetchProjects())
  }

  const handleTransactionSubmit = (e) => {
    e.preventDefault()
    axios.post('http://20.240.193.135:8000/transactions/', { project_id: parseInt(transactionData.project_id), type: transactionData.type, amount: parseFloat(transactionData.amount), date: transactionData.date, description: transactionData.description })
      .then(() => { alert("Tranzacție salvată!"); setTransactionData({ project_id: '', type: 'Incasare', amount: '', date: '', description: '' }); fetchTransactions() })
  }

  // ==========================================
  // LOGICA ECRANE & CALCULE
  // ==========================================
  const filteredLogsForCalendar = timeLogsList.filter(log => log.user_id === parseInt(selectedUserForCalendar) && log.date.startsWith(selectedMonth));
  const daysInMonth = selectedMonth ? new Date(selectedMonth.split('-')[0], selectedMonth.split('-')[1], 0).getDate() : 0;
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const totalBudget = projectsList.reduce((sum, p) => sum + p.budget, 0);
  const activeProjectsCount = projectsList.filter(p => p.status === 'În Lucru').length;

  const totalIncasari = transactionsList.filter(t => t.type === 'Incasare').reduce((sum, t) => sum + t.amount, 0);
  const totalCheltuieli = transactionsList.filter(t => t.type === 'Cheltuiala').reduce((sum, t) => sum + t.amount, 0);
  const profitNet = totalIncasari - totalCheltuieli;

  // ECRAN VIZITATOR
  if (!currentUser) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#e2e8f0', fontFamily: 'Arial' }}>
        <div style={{ ...STYLES.card, width: '400px' }}>
          <h2 style={{ textAlign: 'center', color: COLORS.textMain, marginBottom: '20px' }}>IT Management System</h2>
          {isLoginMode ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input placeholder="Email" type="email" value={loginData.email} onChange={e => setLoginData({...loginData, email: e.target.value})} required style={STYLES.input} />
              <input placeholder="Parolă" type="password" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} required style={STYLES.input} />
              <button type="submit" style={STYLES.btnPrimary}>Intră în cont</button>
              <p style={{ textAlign: 'center', fontSize: '14px', cursor: 'pointer', color: COLORS.primary }} onClick={() => setIsLoginMode(false)}>Creare cont nou</p>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input placeholder="Nume" value={registerData.name} onChange={e => setRegisterData({...registerData, name: e.target.value})} required style={STYLES.input} />
              <input placeholder="Email" type="email" value={registerData.email} onChange={e => setRegisterData({...registerData, email: e.target.value})} required style={STYLES.input} />
              <input placeholder="Parolă" type="password" value={registerData.password} onChange={e => setRegisterData({...registerData, password: e.target.value})} required style={STYLES.input} />
              
              <select value={registerData.role} onChange={e => setRegisterData({...registerData, role: e.target.value})} style={STYLES.input}>
                <option value="Angajat">Angajat</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>

              {/* NOU: Input-ul pentru cod secret care apare doar cand rolul este Admin */}
              {registerData.role === "Admin" && (
                  <input 
                      placeholder="Cod Secret Admin (obligatoriu)" 
                      type="password" 
                      value={registerData.admin_code} 
                      onChange={e => setRegisterData({...registerData, admin_code: e.target.value})} 
                      required 
                      style={{...STYLES.input, borderColor: COLORS.danger, borderWidth: '2px'}} 
                  />
              )}

              <button type="submit" style={STYLES.btnPrimary}>Înregistrare</button>
              <p style={{ textAlign: 'center', fontSize: '14px', cursor: 'pointer', color: COLORS.primary }} onClick={() => setIsLoginMode(true)}>Înapoi la login</p>
            </form>
          )}
        </div>
      </div>
    )
  }

  // ECRAN PRINCIPAL
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial', backgroundColor: COLORS.contentBg }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '280px', background: COLORS.sidebarBg, color: COLORS.sidebarText, padding: '30px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ color: 'white', marginBottom: '10px' }}>IT System</h2>
        <div style={{ paddingBottom: '30px', borderBottom: `1px solid ${COLORS.sidebarActive}`, marginBottom: '30px' }}>
          <p style={{ color: 'white', fontWeight: 'bold', fontSize: '16px', margin: 0 }}>{currentUser.name}</p>
          <p style={{ color: COLORS.sidebarTextMuted, fontSize: '14px', margin: '5px 0 0' }}>Rol: {currentUser.role}</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
          <button onClick={() => setActiveTab('HR')} style={{ padding: '12px', textAlign: 'left', background: activeTab === 'HR' ? COLORS.sidebarActive : 'transparent', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px' }}>👥 Resurse Umane</button>
          <button onClick={() => setActiveTab('PONTAJ')} style={{ padding: '12px', textAlign: 'left', background: activeTab === 'PONTAJ' ? COLORS.sidebarActive : 'transparent', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px' }}>⏱️ Pontaj Angajați</button>
          <button onClick={() => setActiveTab('PROIECTE')} style={{ padding: '12px', textAlign: 'left', background: activeTab === 'PROIECTE' ? COLORS.sidebarActive : 'transparent', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px' }}>📁 Proiecte & Clienți</button>
          
          {(currentUser.role === 'Admin' || currentUser.role === 'Manager') && (
            <button onClick={() => setActiveTab('FINANCIAR')} style={{ padding: '12px', textAlign: 'left', background: activeTab === 'FINANCIAR' ? COLORS.sidebarActive : 'transparent', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px' }}>💰 Analiză Financiară</button>
          )}
        </div>
        <button onClick={handleLogout} style={STYLES.btnDanger}>Ieșire din cont</button>
      </div>

      {/* CONTINUT PRINCIPAL */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {/* --- MODUL HR --- */}
        {activeTab === 'HR' && (
          <div>
            <h1 style={{ color: COLORS.textMain, marginBottom: '30px' }}>Modul Resurse Umane</h1>
            <div style={STYLES.card}>
              <h3 style={{ color: COLORS.textSubtle, marginBottom: '20px' }}>Echipa Companiei</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {usersList.map(u => (
                  <li key={u.id} style={{ padding: '15px 10px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><strong style={{ display: 'block', color: COLORS.textMain }}>{u.name}</strong><span style={{ fontSize: '14px', color: COLORS.textMuted }}>{u.email}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontSize: '14px', background: COLORS.contentBg, padding: '4px 10px', borderRadius: '4px' }}>{u.role}</span>
                      {(currentUser.role === 'Admin' || currentUser.role === 'Manager') && <button onClick={() => handleDeleteUser(u.id)} style={STYLES.btnDanger}>Șterge</button>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* --- MODUL PONTAJ --- */}
        {activeTab === 'PONTAJ' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <h1 style={{ color: COLORS.textMain, margin: 0 }}>Management Pontaj</h1>
            
            {/* Calendar */}
            <div style={STYLES.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: COLORS.textSubtle, margin: 0 }}>Foaie de Prezență</h3>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${COLORS.border}` }} />
                  <select value={selectedUserForCalendar} onChange={e => setSelectedUserForCalendar(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${COLORS.border}` }} disabled={currentUser.role === 'Angajat'}>
                    {usersList.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(45px, 1fr))', gap: '8px' }}>
                {calendarDays.map(day => {
                  const dateStr = `${selectedMonth}-${day.toString().padStart(2, '0')}`;
                  const logsInDay = filteredLogsForCalendar.filter(log => log.date === dateStr);
                  const totalHoursInDay = logsInDay.reduce((sum, log) => sum + log.hours, 0);
                  const hasWorked = totalHoursInDay > 0;
                  return (
                    <div key={day} style={{ aspectRatio: '1', borderRadius: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: hasWorked ? '#dbeafe' : '#f8fafc', border: `1px solid ${hasWorked ? '#bfdbfe' : COLORS.border}`, color: hasWorked ? '#1d4ed8' : COLORS.textMuted }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{day}</span>
                      {hasWorked && <span style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '2px' }}>{totalHoursInDay}h</span>}
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
              <div style={STYLES.card}>
                <h3 style={{ color: COLORS.textSubtle, marginBottom: '20px' }}>{editLogId ? 'Editează Pontaj' : 'Adaugă Ore'}</h3>
                <form onSubmit={handleTimeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div><label style={{ fontSize: '14px' }}>Data</label><input type="date" value={timeData.date} onChange={e => setTimeData({...timeData, date: e.target.value})} required style={STYLES.input} /></div>
                  <div><label style={{ fontSize: '14px' }}>Ore</label><input type="number" step="0.5" value={timeData.hours} onChange={e => setTimeData({...timeData, hours: e.target.value})} required style={STYLES.input} /></div>
                  <div><label style={{ fontSize: '14px' }}>Descriere</label><textarea value={timeData.description} onChange={e => setTimeData({...timeData, description: e.target.value})} required style={{ ...STYLES.input, minHeight: '80px' }} /></div>
                  <div style={{ display: 'flex', gap: '10px' }}><button type="submit" style={{ ...STYLES.btnPrimary, flex: 1 }}>Salvează</button>{editLogId && <button type="button" onClick={() => {setEditLogId(null); setTimeData({ date: '', hours: '', description: '' })}} style={STYLES.btnDanger}>Anulează</button>}</div>
                </form>
              </div>
              
              <div style={STYLES.card}>
                <h3 style={{ color: COLORS.textSubtle, marginBottom: '20px' }}>Istoric Activități</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {timeLogsList.slice().reverse().map(log => {
                    const author = usersList.find(u => u.id === log.user_id);
                    const canEdit = (log.user_id === currentUser.id) || (currentUser.role === 'Admin');
                    return (
                      <li key={log.id} style={{ padding: '15px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{author?.name || 'Necunoscut'}</strong><span style={{ fontSize: '14px', color: COLORS.textMuted }}>{log.date}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: COLORS.textSubtle }}>{log.description}</span>
                          <div><span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px' }}>{log.hours} ore</span>{canEdit && (
  <div style={{ display: 'inline-block' }}>
    <button onClick={() => startEditingTimeLog(log)} style={STYLES.btnEdit}>Editează</button>
    <button onClick={() => handleDeleteTimeLog(log.id)} style={{...STYLES.btnDanger, marginLeft: '10px'}}>Șterge</button>
  </div>
)}</div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* --- MODUL PROIECTE --- */}
        {activeTab === 'PROIECTE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <h1 style={{ color: COLORS.textMain, margin: 0 }}>Proiecte & Management Clienți</h1>
            
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={STYLES.kpiCard}><p style={{ margin: 0, color: COLORS.textMuted, fontSize: '14px' }}>Clienți Înregistrați</p><h2 style={{ margin: '5px 0 0', color: COLORS.textMain }}>{clientsList.length}</h2></div>
              <div style={{ ...STYLES.kpiCard, borderLeftColor: COLORS.warning }}><p style={{ margin: 0, color: COLORS.textMuted, fontSize: '14px' }}>Proiecte Active</p><h2 style={{ margin: '5px 0 0', color: COLORS.textMain }}>{activeProjectsCount}</h2></div>
              <div style={{ ...STYLES.kpiCard, borderLeftColor: COLORS.success }}><p style={{ margin: 0, color: COLORS.textMuted, fontSize: '14px' }}>Buget Total Estimat</p><h2 style={{ margin: '5px 0 0', color: COLORS.textMain }}>{totalBudget.toLocaleString()} EUR</h2></div>
            </div>

            {(currentUser.role === 'Admin' || currentUser.role === 'Manager') && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={STYLES.card}>
                  <h3 style={{ marginTop: 0, color: COLORS.textSubtle }}>Adaugă Client Nou</h3>
                  <form onSubmit={handleClientSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input placeholder="Nume Companie" value={clientData.name} onChange={e => setClientData({...clientData, name: e.target.value})} required style={STYLES.input}/>
                    <input placeholder="Email Contact" type="email" value={clientData.contact_email} onChange={e => setClientData({...clientData, contact_email: e.target.value})} required style={STYLES.input}/>
                    <select value={clientData.industry} onChange={e => setClientData({...clientData, industry: e.target.value})} style={STYLES.input}>
                      <option value="IT">IT & Software</option><option value="Banking">Banking</option><option value="Retail">Retail</option>
                    </select>
                    <button type="submit" style={STYLES.btnPrimary}>Salvează Client</button>
                  </form>
                </div>
                
                <div style={STYLES.card}>
                  <h3 style={{ marginTop: 0, color: COLORS.textSubtle }}>Deschide Proiect Nou</h3>
                  <form onSubmit={handleProjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <select value={projectData.client_id} onChange={e => setProjectData({...projectData, client_id: e.target.value})} required style={STYLES.input}>
                      <option value="">-- Selectează Clientul --</option>
                      {clientsList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input placeholder="Nume Proiect" value={projectData.name} onChange={e => setProjectData({...projectData, name: e.target.value})} required style={STYLES.input}/>
                    <input placeholder="Buget (EUR)" type="number" value={projectData.budget} onChange={e => setProjectData({...projectData, budget: e.target.value})} required style={STYLES.input}/>
                    <button type="submit" style={STYLES.btnPrimary}>Creează Proiect</button>
                  </form>
                </div>
              </div>
            )}

            <h3 style={{ color: COLORS.textSubtle, marginTop: '10px', marginBottom: '0' }}>Status Proiecte (Panou Kanban)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              
              <div style={{ background: COLORS.kanbanCol, padding: '15px', borderRadius: '12px', border: `1px solid ${COLORS.border}` }}>
                <h4 style={{ margin: '0 0 15px', color: COLORS.textMuted, textTransform: 'uppercase', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>Planificare <span style={{ background: '#cbd5e1', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{projectsList.filter(p => p.status === 'Planificare').length}</span></h4>
                {projectsList.filter(p => p.status === 'Planificare').map(p => (
                  <div key={p.id} style={{ background: 'white', padding: '15px', borderRadius: '8px', marginBottom: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: `4px solid ${COLORS.textMuted}` }}>
                    <strong style={{ display: 'block', marginBottom: '5px' }}>{p.name}</strong><p style={{ fontSize: '12px', color: COLORS.textMuted, margin: '0 0 10px' }}>Client: {clientsList.find(c => c.id === p.client_id)?.name}</p><p style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 10px', color: COLORS.success }}>{p.budget} EUR</p>
                    <select value={p.status} onChange={(e) => handleStatusChange(p.id, e.target.value)} style={{ ...STYLES.input, padding: '5px', fontSize: '12px' }}><option value="Planificare">📍 Planificare</option><option value="În Lucru">🚀 Muta: În Lucru</option><option value="Finalizat">✅ Muta: Finalizat</option></select>
                  </div>
                ))}
              </div>

              <div style={{ background: COLORS.kanbanCol, padding: '15px', borderRadius: '12px', border: `1px solid ${COLORS.border}` }}>
                <h4 style={{ margin: '0 0 15px', color: COLORS.warning, textTransform: 'uppercase', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>În Lucru <span style={{ background: COLORS.warning, color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{projectsList.filter(p => p.status === 'În Lucru').length}</span></h4>
                {projectsList.filter(p => p.status === 'În Lucru').map(p => (
                  <div key={p.id} style={{ background: 'white', padding: '15px', borderRadius: '8px', marginBottom: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: `4px solid ${COLORS.warning}` }}>
                    <strong style={{ display: 'block', marginBottom: '5px' }}>{p.name}</strong><p style={{ fontSize: '12px', color: COLORS.textMuted, margin: '0 0 10px' }}>Client: {clientsList.find(c => c.id === p.client_id)?.name}</p><p style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 10px', color: COLORS.success }}>{p.budget} EUR</p>
                    <select value={p.status} onChange={(e) => handleStatusChange(p.id, e.target.value)} style={{ ...STYLES.input, padding: '5px', fontSize: '12px' }}><option value="Planificare">📍 Muta: Planificare</option><option value="În Lucru">🚀 În Lucru</option><option value="Finalizat">✅ Muta: Finalizat</option></select>
                  </div>
                ))}
              </div>

              <div style={{ background: COLORS.kanbanCol, padding: '15px', borderRadius: '12px', border: `1px solid ${COLORS.border}` }}>
                <h4 style={{ margin: '0 0 15px', color: COLORS.success, textTransform: 'uppercase', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>Finalizat <span style={{ background: COLORS.success, color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{projectsList.filter(p => p.status === 'Finalizat').length}</span></h4>
                {projectsList.filter(p => p.status === 'Finalizat').map(p => (
                  <div key={p.id} style={{ background: 'white', padding: '15px', borderRadius: '8px', marginBottom: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: `4px solid ${COLORS.success}` }}>
                    <strong style={{ display: 'block', marginBottom: '5px' }}>{p.name}</strong><p style={{ fontSize: '12px', color: COLORS.textMuted, margin: '0 0 10px' }}>Client: {clientsList.find(c => c.id === p.client_id)?.name}</p><p style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 10px', color: COLORS.success }}>{p.budget} EUR</p>
                    <select value={p.status} onChange={(e) => handleStatusChange(p.id, e.target.value)} style={{ ...STYLES.input, padding: '5px', fontSize: '12px', background: '#ecfdf5', color: COLORS.success }}><option value="Planificare">📍 Muta: Planificare</option><option value="În Lucru">🚀 Muta: În Lucru</option><option value="Finalizat">✅ Finalizat</option></select>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* --- MODUL FINANCIAR (NOU) --- */}
        {activeTab === 'FINANCIAR' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <h1 style={{ color: COLORS.textMain, margin: 0 }}>Analiză Financiar-Contabilă</h1>
            
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{...STYLES.kpiCard, borderLeftColor: COLORS.success}}>
                <p style={{ margin: 0, color: COLORS.textMuted, fontSize: '14px' }}>Total Încasări</p>
                <h2 style={{ margin: '5px 0 0', color: COLORS.success }}>+ {totalIncasari.toLocaleString()} EUR</h2>
              </div>
              <div style={{...STYLES.kpiCard, borderLeftColor: COLORS.danger}}>
                <p style={{ margin: 0, color: COLORS.textMuted, fontSize: '14px' }}>Total Cheltuieli (Hardware, Salarii)</p>
                <h2 style={{ margin: '5px 0 0', color: COLORS.danger }}>- {totalCheltuieli.toLocaleString()} EUR</h2>
              </div>
              <div style={{...STYLES.kpiCard, borderLeftColor: profitNet >= 0 ? COLORS.primary : COLORS.danger, background: profitNet >= 0 ? '#f0f9ff' : '#fef2f2'}}>
                <p style={{ margin: 0, color: COLORS.textMuted, fontSize: '14px' }}>Profit Net Companie</p>
                <h2 style={{ margin: '5px 0 0', color: profitNet >= 0 ? COLORS.primary : COLORS.danger }}>{profitNet >= 0 ? '+' : ''}{profitNet.toLocaleString()} EUR</h2>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
              <div style={STYLES.card}>
                <h3 style={{ marginTop: 0, color: COLORS.textSubtle }}>Înregistrează Tranzacție</h3>
                <form onSubmit={handleTransactionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <select value={transactionData.type} onChange={e => setTransactionData({...transactionData, type: e.target.value})} required style={{...STYLES.input, fontWeight: 'bold', color: transactionData.type === 'Incasare' ? COLORS.success : COLORS.danger}}>
                    <option value="Incasare">💰 Încasare (Factură client)</option>
                    <option value="Cheltuiala">📉 Cheltuială (Echipamente, Salarii)</option>
                  </select>
                  
                  <div><label style={{ fontSize: '12px' }}>Alege Proiectul</label>
                  <select value={transactionData.project_id} onChange={e => setTransactionData({...transactionData, project_id: e.target.value})} required style={STYLES.input}>
                    <option value="">-- Selectează Proiectul --</option>
                    {projectsList.map(p => <option key={p.id} value={p.id}>{p.name} ({clientsList.find(c => c.id === p.client_id)?.name})</option>)}
                  </select>
                  </div>

                  <div><label style={{ fontSize: '12px' }}>Suma (EUR)</label>
                  <input type="number" step="0.01" value={transactionData.amount} onChange={e => setTransactionData({...transactionData, amount: e.target.value})} required style={STYLES.input}/></div>
                  
                  <div><label style={{ fontSize: '12px' }}>Data tranzacției</label>
                  <input type="date" value={transactionData.date} onChange={e => setTransactionData({...transactionData, date: e.target.value})} required style={STYLES.input}/></div>
                  
                  <div><label style={{ fontSize: '12px' }}>Descriere (ex: Factură avans, Laptop Dev)</label>
                  <input type="text" value={transactionData.description} onChange={e => setTransactionData({...transactionData, description: e.target.value})} required style={STYLES.input}/></div>

                  <button type="submit" style={{...STYLES.btnPrimary, background: transactionData.type === 'Incasare' ? COLORS.success : COLORS.danger}}>
                    Salvează în Registru
                  </button>
                </form>
              </div>

              <div style={STYLES.card}>
                <h3 style={{ marginTop: 0, color: COLORS.textSubtle }}>Registru Tranzacții</h3>
                
                {(totalIncasari > 0 || totalCheltuieli > 0) && (
                  <div style={{ marginBottom: '20px', background: '#f1f5f9', borderRadius: '8px', padding: '15px' }}>
                    <p style={{ margin: '0 0 5px', fontSize: '13px', color: COLORS.textMuted }}>Balanță: Încasări vs Cheltuieli</p>
                    <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${(totalIncasari / (totalIncasari + totalCheltuieli)) * 100}%`, background: COLORS.success }} title={`Încasări: ${totalIncasari}`}></div>
                      <div style={{ width: `${(totalCheltuieli / (totalIncasari + totalCheltuieli)) * 100}%`, background: COLORS.danger }} title={`Cheltuieli: ${totalCheltuieli}`}></div>
                    </div>
                  </div>
                )}

                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {transactionsList.slice().reverse().map(t => {
                    const project = projectsList.find(p => p.id === t.project_id);
                    const isIncome = t.type === 'Incasare';
                    return (
                      <li key={t.id} style={{ padding: '15px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${isIncome ? COLORS.success : COLORS.danger}` }}>
                        <div>
                          <strong style={{ display: 'block', color: COLORS.textMain }}>{t.description}</strong>
                          <span style={{ fontSize: '13px', color: COLORS.textMuted }}>{t.date} • Proiect: {project?.name || 'Necunoscut'}</span>
                        </div>
                        <span style={{ fontWeight: 'bold', fontSize: '16px', color: isIncome ? COLORS.success : COLORS.danger }}>
                          {isIncome ? '+' : '-'}{t.amount} €
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default App