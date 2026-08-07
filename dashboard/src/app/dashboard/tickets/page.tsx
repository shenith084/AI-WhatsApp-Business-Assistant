'use client';

import { useState } from 'react';

const DEMO_TICKETS = [
  {
    id: 'TKT-001', customer: '+94771234560', reason: 'complaint', status: 'open',
    created_at: '2026-08-05T06:10:00Z',
    suggested_reply: 'I am so sorry to hear about the delay. I am checking the status of your order right now and will get back to you in a few minutes with an update.',
    chat_snapshot: [
      { direction: 'inbound', text: 'Where is my order? It was supposed to be here yesterday.', intent: 'DELIVERY_QUESTION', confidence: 0.9, at: '2026-08-05T06:05:00Z' },
      { direction: 'outbound', text: 'Our records show it is out for delivery today. Would you like me to connect you with the driver?', at: '2026-08-05T06:05:05Z' },
      { direction: 'inbound', text: 'This is the second time my order arrived late, I am really unhappy.', intent: 'COMPLAINT', confidence: 0.95, at: '2026-08-05T06:10:00Z' },
      { direction: 'outbound', text: 'I am really sorry to hear that! 🙏 I am connecting you with our team right now — they will reply to you shortly and make sure this is sorted out.', at: '2026-08-05T06:10:05Z' }
    ]
  },
  {
    id: 'TKT-002', customer: '+94769876500', reason: 'customer_request', status: 'in_progress',
    created_at: '2026-08-05T05:30:00Z', assigned: 'Ashan Perera',
    suggested_reply: 'Hi! Yes, we can do a mix of colors for your bulk order. How many of each color would you like?',
    chat_snapshot: [
      { direction: 'inbound', text: 'Can I talk to someone please?', intent: 'HUMAN_HANDOFF_REQUEST', confidence: 0.98, at: '2026-08-05T05:30:00Z' }
    ]
  },
  {
    id: 'TKT-003', customer: '+94712345600', reason: 'low_confidence', status: 'open',
    created_at: '2026-08-05T04:15:00Z',
    suggested_reply: 'Hello! It looks like you have a question. Could you provide a bit more detail so I can help you best?',
    chat_snapshot: [
      { direction: 'inbound', text: 'uuuhh idk maybe some blue thing?', intent: 'GENERAL_QUESTION', confidence: 0.3, at: '2026-08-05T04:15:00Z' }
    ]
  }
];

const STATUS_BADGE: Record<string, string> = {
  open: 'badge-danger', in_progress: 'badge-warning', resolved: 'badge-success'
};

const REASON_LABELS: Record<string, string> = {
  complaint: '⚠️ Complaint', customer_request: '👤 Requested Agent', low_confidence: '🤖 AI Confused'
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState(DEMO_TICKETS);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<typeof DEMO_TICKETS[0] | null>(null);
  const [replyText, setReplyText] = useState('');

  const filtered = tickets.filter(t => filterStatus === 'all' || t.status === filterStatus);

  function openTicket(t: typeof DEMO_TICKETS[0]) {
    setSelected(t);
    setReplyText(t.suggested_reply);
  }

  function handleResolve() {
    if (!selected) return;
    setTickets(prev => prev.map(t => t.id === selected.id ? { ...t, status: 'resolved' } : t));
    setSelected(null);
  }

  function handleSendReply() {
    if (!selected || !replyText) return;
    // In production: send to WAHA HTTP endpoint
    alert(`Message sent to ${selected.customer}:\n\n${replyText}`);
    setTickets(prev => prev.map(t => t.id === selected.id ? { ...t, status: 'in_progress', assigned: 'Ashan Perera' } : t));
    setSelected(null);
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
                  <td className="strong" style={{ fontFamily:'var(--font-mono)' }}>{t.id}</td>
                  <td className="strong">{t.customer}</td>
                  <td>{REASON_LABELS[t.reason] ?? t.reason}</td>
                  <td><span className={`badge ${STATUS_BADGE[t.status]}`}>{t.status.replace('_',' ')}</span></td>
                  <td style={{ fontSize:'13px' }}>{t.assigned ?? <span style={{color:'var(--color-text-muted)'}}>Unassigned</span>}</td>
                  <td style={{ fontSize:'12px', color:'var(--color-text-muted)' }}>{new Date(t.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</td>
                  <td>
                    <button id={`open-ticket-${t.id}`} className={`btn ${t.status==='open' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={()=>openTicket(t)}>
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
          <div className="modal" style={{ maxWidth: '800px', display:'flex', gap:'24px' }} onClick={e=>e.stopPropagation()}>
            
            {/* Left: Chat History */}
            <div style={{ flex: 1, display:'flex', flexDirection:'column' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px' }}>
                <div>
                  <h2 className="modal-title" style={{ marginBottom:'4px' }}>Ticket {selected.id}</h2>
                  <div style={{ fontSize:'13px', color:'var(--color-text-muted)' }}>{selected.customer}</div>
                </div>
                <div><span className={`badge ${STATUS_BADGE[selected.status]}`}>{selected.status.replace('_',' ')}</span></div>
              </div>

              <div style={{ background:'rgba(0,0,0,0.2)', border:'1px solid var(--color-border)', borderRadius:'12px', padding:'16px', flex:1, overflowY:'auto', maxHeight:'400px', display:'flex', flexDirection:'column', gap:'12px' }}>
                <div style={{ fontSize:'11px', textAlign:'center', color:'var(--color-text-muted)', marginBottom:'8px' }}>AI Context Snapshot</div>
                {selected.chat_snapshot.map((msg, i) => (
                  <div key={i} style={{ alignSelf: msg.direction === 'inbound' ? 'flex-start' : 'flex-end', maxWidth:'80%' }}>
                    {msg.direction === 'inbound' && msg.intent && (
                      <div style={{ fontSize:'10px', color:'var(--color-text-muted)', marginBottom:'4px', marginLeft:'4px' }}>
                        Intent: {msg.intent} ({msg.confidence})
                      </div>
                    )}
                    <div style={{
                      background: msg.direction === 'inbound' ? 'var(--color-bg-card)' : 'var(--color-accent-dark)',
                      color: '#fff', padding:'10px 14px', borderRadius:'14px',
                      borderBottomLeftRadius: msg.direction === 'inbound' ? '4px' : '14px',
                      borderBottomRightRadius: msg.direction === 'outbound' ? '4px' : '14px',
                      fontSize:'14px'
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Actions & Reply */}
            <div style={{ width: '320px', display:'flex', flexDirection:'column', gap:'16px' }}>
              <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'12px', padding:'16px' }}>
                <div style={{ fontSize:'12px', color:'var(--color-text-muted)', marginBottom:'4px', textTransform:'uppercase', fontWeight:600 }}>Handoff Reason</div>
                <div style={{ fontSize:'14px', color:'var(--color-text-primary)' }}>{REASON_LABELS[selected.reason]}</div>
              </div>

              <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                  <label className="form-label">Send Reply to Customer</label>
                  <span className="badge badge-accent">AI Suggested</span>
                </div>
                <textarea
                  id="ticket-reply-text"
                  className="form-textarea"
                  style={{ flex:1, minHeight:'150px' }}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                />
              </div>

              <div style={{ display:'flex', gap:'8px', flexDirection:'column' }}>
                <button id="send-reply-btn" className="btn btn-primary" onClick={handleSendReply} style={{ justifyContent:'center' }}>
                  Send & Mark In Progress
                </button>
                {selected.status !== 'resolved' && (
                  <button id="resolve-ticket-btn" className="btn btn-secondary" onClick={handleResolve} style={{ justifyContent:'center' }}>
                    ✓ Mark as Resolved
                  </button>
                )}
                <button className="btn btn-secondary" onClick={()=>setSelected(null)} style={{ justifyContent:'center', background:'transparent', border:'none' }}>
                  Cancel
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
