import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../api/chatbotApi';
import { useAuth } from '../context/AuthContext';

export default function ChatBot() {
  const { user }                      = useAuth();
  const [open, setOpen]               = useState(false);
  const [input, setInput]             = useState('');
  const [messages, setMessages]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const messagesEndRef                = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message when first opened
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm SmartBot, your campus assistant. How can I help you today?`,
        time: now(),
      }]);
    }
  }, [open, messages.length, user?.name]);

  const now = () => new Date().toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit'
  });

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text, time: now() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      // Send history (exclude the welcome message, only real exchanges)
      const history = updated
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-10)  // last 10 messages for context window
        .map(m => ({ role: m.role, content: m.content }));

      const res = await sendMessage(text, history.slice(0, -1));

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.reply,
        time: now(),
        responseTime: res.data.responseTimeMs,
      }]);
    } catch (err) {
      console.error("Chatbot API Error:", err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I am having trouble connecting right now. Please try again in a moment.',
        time: now(),
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `Chat cleared! How can I help you, ${user?.name?.split(' ')[0]}?`,
      time: now(),
    }]);
  };

  // Suggested questions
  const suggestions = [
    'How do I make a booking?',
    'How do I report a fault?',
    'What are the user roles?',
    'How does 2FA work?',
  ];

  return (
    <>
      {/* Floating toggle button */}
      <button
        style={s.fab}
        onClick={() => setOpen(!open)}
        title="Smart Campus Assistant"
      >
        {open ? '✕' : '💬'}
        {!open && messages.length > 1 && (
          <span style={s.unreadDot} />
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div style={s.window}>

          {/* Header */}
          <div style={s.header}>
            <div style={s.headerLeft}>
              <div style={s.botAvatar}>🤖</div>
              <div>
                <div style={s.botName}>SmartBot</div>
                <div style={s.botStatus}>
                  <span style={s.onlineDot}/>
                  Powered by Llama 3.1
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button style={s.iconBtn} onClick={clearChat} title="Clear chat">
                🗑
              </button>
              <button style={s.iconBtn} onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={s.messages}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                ...s.msgRow,
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                {msg.role === 'assistant' && (
                  <div style={s.miniAvatar}>🤖</div>
                )}
                <div style={{
                  ...s.bubble,
                  ...(msg.role === 'user' ? s.userBubble : s.botBubble),
                  ...(msg.isError ? s.errorBubble : {}),
                }}>
                  <p style={s.msgText}>{msg.content}</p>
                  <div style={s.msgMeta}>
                    <span style={s.msgTime}>{msg.time}</span>
                    {msg.responseTime && (
                      <span style={s.msgTime}> · {msg.responseTime}ms</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ ...s.msgRow, justifyContent:'flex-start' }}>
                <div style={s.miniAvatar}>🤖</div>
                <div style={{ ...s.bubble, ...s.botBubble }}>
                  <div style={s.typing}>
                    <span style={s.dot}/>
                    <span style={{ ...s.dot, animationDelay:'.2s' }}/>
                    <span style={{ ...s.dot, animationDelay:'.4s' }}/>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>

          {/* Suggestions (only when few messages) */}
          {messages.length <= 1 && (
            <div style={s.suggestions}>
              {suggestions.map((s_) => (
                <button
                  key={s_}
                  style={s.suggBtn}
                  onClick={() => {
                    setInput(s_);
                    setTimeout(handleSend, 0);
                  }}
                >
                  {s_}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div style={s.inputArea}>
            <textarea
              style={s.input}
              placeholder="Ask me anything about the campus system..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              style={{
                ...s.sendBtn,
                opacity: !input.trim() || loading ? 0.5 : 1,
              }}
              onClick={handleSend}
              disabled={!input.trim() || loading}
            >
              ➤
            </button>
          </div>
          <p style={s.hint}>Press Enter to send · Shift+Enter for new line</p>

        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%,80%,100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────
const s = {
  fab:         { position:'fixed', bottom:24, right:24, width:56, height:56, borderRadius:'50%', background:'#6366f1', color:'#fff', border:'none', fontSize:24, cursor:'pointer', boxShadow:'0 4px 16px rgba(99,102,241,0.4)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' },
  unreadDot:   { position:'absolute', top:6, right:6, width:10, height:10, background:'#ef4444', borderRadius:'50%', border:'2px solid #fff' },
  window:      { position:'fixed', bottom:90, right:24, width:370, height:560, background:'#fff', borderRadius:16, boxShadow:'0 8px 40px rgba(0,0,0,0.15)', display:'flex', flexDirection:'column', zIndex:1000, overflow:'hidden' },
  header:      { background:'#6366f1', padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' },
  headerLeft:  { display:'flex', alignItems:'center', gap:10 },
  botAvatar:   { width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 },
  botName:     { color:'#fff', fontWeight:600, fontSize:15 },
  botStatus:   { color:'rgba(255,255,255,0.8)', fontSize:11, display:'flex', alignItems:'center', gap:4, marginTop:2 },
  onlineDot:   { width:6, height:6, background:'#4ade80', borderRadius:'50%', display:'inline-block' },
  iconBtn:     { background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', width:28, height:28, borderRadius:6, cursor:'pointer', fontSize:13 },
  messages:    { flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 },
  msgRow:      { display:'flex', alignItems:'flex-end', gap:6 },
  miniAvatar:  { width:26, height:26, borderRadius:'50%', background:'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 },
  bubble:      { maxWidth:'80%', padding:'10px 13px', borderRadius:14, wordBreak:'break-word' },
  userBubble:  { background:'#6366f1', color:'#fff', borderBottomRightRadius:4 },
  botBubble:   { background:'#f1f5f9', color:'#1e293b', borderBottomLeftRadius:4 },
  errorBubble: { background:'#fef2f2', color:'#dc2626' },
  msgText:     { margin:0, fontSize:13, lineHeight:1.5 },
  msgMeta:     { marginTop:4, display:'flex', gap:4 },
  msgTime:     { fontSize:10, opacity:.6 },
  typing:      { display:'flex', gap:4, padding:'2px 0' },
  dot:         { width:7, height:7, borderRadius:'50%', background:'#94a3b8', animation:'bounce 1.2s infinite' },
  suggestions: { padding:'0 12px 8px', display:'flex', flexWrap:'wrap', gap:6 },
  suggBtn:     { background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:20, padding:'5px 12px', fontSize:11, cursor:'pointer', color:'#475569', whiteSpace:'nowrap' },
  inputArea:   { display:'flex', gap:8, padding:'10px 12px', borderTop:'1px solid #f1f5f9', alignItems:'flex-end' },
  input:       { flex:1, padding:'9px 12px', border:'1px solid #e2e8f0', borderRadius:10, fontSize:13, resize:'none', outline:'none', fontFamily:'inherit', maxHeight:80, overflowY:'auto' },
  sendBtn:     { width:38, height:38, borderRadius:10, background:'#6366f1', color:'#fff', border:'none', fontSize:16, cursor:'pointer', flexShrink:0 },
  hint:        { textAlign:'center', fontSize:10, color:'#94a3b8', margin:'0 0 6px' },
};