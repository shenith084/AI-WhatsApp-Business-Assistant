'use client';

import { useEffect, useState } from 'react';
import { showToast } from '@/app/utils/swal';
import { getTickets, updateTicketStatus, getAuthSession } from '@/app/actions';

const STATUS_BADGE: Record<string, string> = {
  open: 'badge-danger', in_progress: 'badge-warning', resolved: 'badge-success'
};

const REASON_LABELS: Record<string, string> = {
  complaint: '⚠️ Complaint', customer_request: '👤 Requested Agent', low_confidence: '🤖 AI Confused'
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [user, setUser] = useState<any>(null);

  async function fetchTickets() {
    const { data } = await getTickets();
    if (data) setTickets(data);
  }

  useEffect(() => {
    async function init() {
      const session = await getAuthSession();
      setUser(session);
      fetchTickets();
    }
    init();
  }, []);

  const filtered = tickets.filter(t => filterStatus === 'all' || t.status === filterStatus);

  function openTicket(t: any) {
    setSelected(t);
    setReplyText(t.suggested_reply || '');
  }

  async function handleResolve() {
    if (!selected) return;
    await updateTicketStatus(selected.id, 'resolved');
    fetchTickets();
    setSelected(null);
    showToast('Ticket marked as resolved!', 'success');
  }

  async function handleTakeOver(t: any) {
    if (t.status === 'open') {
      await updateTicketStatus(t.id, 'in_progress', user?.name || 'Agent');
      showToast('You have taken over this ticket', 'info');
      fetchTickets();
    }
    openTicket(t);
  }

  async function handleSendReply() {
    if (!selected || !replyText) return;
    // In production: send to WAHA HTTP endpoint
    await updateTicketStatus(selected.id, 'in_progress', user?.name || 'Agent');
    showToast(`Message sent to ${selected.customer_number}!`, 'success', replyText);
    fetchTickets();
    setSelected(null);
  }

  let chatSnapshotArray = [];
  if (selected?.chat_snapshot) {
    if (typeof selected.chat_snapshot === 'string') {
      try { chatSnapshotArray = JSON.parse(selected.chat_snapshot); } catch (e) {}
    } else if (Array.isArray(selected.chat_snapshot)) {
      chatSnapshotArray = selected.chat_snapshot;
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">Support Tickets</h1>
          <p className="page-subtitle">Human handoff queue from the AI assistant</p>
        </div>
      </div>

      <div style={{ display:'flex', gap:'12px', marginBottom:'20px' }}>
        {['all','open','in_progress','resolved'].map(s => (
          <button key={s} id={`filter-${s}`} className={`btn ${filterStatus===s ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={()=>setFilterStatus(s)}>
            {s === 'all' ? 'All Tickets' : s.replace('_',' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding:0 }}>
        <div className="table-wrapper" style={{ border:'none' }}>
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Customer</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Agent</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign:'center', padding:'40px' }}>
                    <div className="empty-state">
                      <div className="empty-state-icon">🎉</div>
                      <div className="empty-state-title">No tickets found</div>
                      <div className="empty-state-desc">The AI is handling everything perfectly.</div>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map(t => (
                <tr key={t.id}>
                  <td className="strong" style={{ fontFamily:'var(--font-mono)' }}>{t.id.substring(0, 8).toUpperCase()}</td>
                  <td className="strong">{t.customer_number}</td>
                  <td>{REASON_LABELS[t.reason] ?? t.reason}</td>
                  <td><span className={`badge ${STATUS_BADGE[t.status]}`}>{t.status.replace('_',' ')}</span></td>
                  <td style={{ fontSize:'13px' }}>{t.assigned ?? <span style={{color:'var(--color-text-muted)'}}>Unassigned</span>}</td>
                  <td style={{ fontSize:'12px', color:'var(--color-text-muted)' }}>{new Date(t.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</td>
                  <td>
                    <button id={`open-ticket-${t.id}`} className={`btn ${t.status==='open' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={()=>handleTakeOver(t)}>
                      {t.status === 'open' ? 'Take Over' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Modal */}
      {selected && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="modal" style={{ maxWidth: '600px', padding: '32px', display:'flex', flexDirection: 'column', gap:'16px' }} onClick={e=>e.stopPropagation()}>
            
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px' }}>
                <div>
                  <h2 className="modal-title" style={{ marginBottom:'4px' }}>Ticket {selected.id.substring(0, 8).toUpperCase()}</h2>
                  <div style={{ fontSize:'13px', color:'var(--color-text-muted)' }}>{selected.customer_number}</div>
                </div>
                <div><span className={`badge ${STATUS_BADGE[selected.status]}`}>{selected.status.replace('_',' ')}</span></div>
              </div>
              
              {/* Reason */}
              <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'12px', padding:'12px 16px' }}>
                <div style={{ fontSize:'12px', color:'var(--color-text-muted)', marginBottom:'4px', textTransform:'uppercase', fontWeight:600 }}>Handoff Reason</div>
                <div style={{ fontSize:'14px', color:'var(--color-text-primary)' }}>{REASON_LABELS[selected.reason]}</div>
              </div>

              {/* Chat History */}
              <div style={{ background:'#efeae2', border:'1px solid var(--color-border)', borderRadius:'12px', padding:'16px', overflowY:'auto', maxHeight:'250px', display:'flex', flexDirection:'column', gap:'12px' }}>
                <div style={{ fontSize:'11px', textAlign:'center', color:'var(--color-text-muted)', marginBottom:'8px' }}>AI Context Snapshot</div>
                {chatSnapshotArray.map((msg: any, i: number) => (
                  <div key={i} style={{ alignSelf: msg.direction === 'inbound' ? 'flex-start' : 'flex-end', maxWidth:'80%' }}>
                    {msg.direction === 'inbound' && msg.intent && (
                      <div style={{ fontSize:'10px', color:'var(--color-text-muted)', marginBottom:'4px', marginLeft:'4px' }}>
                        Intent: {msg.intent} ({msg.confidence})
                      </div>
                    )}
                    <div style={{
                      background: msg.direction === 'inbound' ? '#ffffff' : '#dcf8c6',
                      color: '#111b21',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      padding:'8px 12px', borderRadius:'8px',
                      borderTopLeftRadius: msg.direction === 'inbound' ? '0px' : '8px',
                      borderTopRightRadius: msg.direction === 'outbound' ? '0px' : '8px',
                      fontSize:'14px',
                      wordBreak: 'break-word'
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              {/* Reply Area */}
              <div style={{ display:'flex', flexDirection:'column' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                  <label className="form-label">Draft WhatsApp Reply</label>
                  <span className="badge badge-accent">AI Suggested</span>
                </div>
                <textarea
                  id="ticket-reply-text"
                  className="form-textarea"
                  style={{ minHeight:'80px' }}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                />
              </div>

              <div style={{ display:'flex', gap:'12px', marginTop: '8px' }}>
                <button 
                  className="btn" 
                  style={{ flex: 2, background: '#25D366', color: 'white', justifyContent: 'center', border: 'none', fontSize: '15px', fontWeight: 600 }}
                  onClick={() => {
                    // Extract only the digits for wa.me link
                    const phone = selected.customer_number.replace(/\D/g, '');
                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(replyText)}`, '_blank');
                    handleSendReply();
                  }}
                >
                  💬 Connect on WhatsApp
                </button>
                {selected.status !== 'resolved' && (
                  <button id="resolve-ticket-btn" className="btn btn-secondary" onClick={handleResolve} style={{ flex: 1, justifyContent:'center' }}>
                    ✓ Resolve
                  </button>
                )}
                <button className="btn btn-secondary" onClick={()=>setSelected(null)} style={{ flex: 1, justifyContent:'center', background:'transparent', border:'none' }}>
                  Cancel
                </button>
              </div>

          </div>
        </div>
      )}
    </>
  );
}
