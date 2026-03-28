(function () {
  const script = document.currentScript
  const WIDGET_TOKEN = script?.getAttribute('data-token') || ''
  const API_URL = 'https://base-ai-beryl.vercel.app/api/query'

  const style = document.createElement('style')
  style.textContent = `
    #bai-bubble { position:fixed; bottom:24px; right:24px; width:52px; height:52px;
      border-radius:50%; background:#e91e63; color:#fff; border:none; font-size:24px;
      cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.2); z-index:9999; }
    #bai-panel { position:fixed; bottom:90px; right:24px; width:360px; height:480px;
      background:#fff; border-radius:16px; box-shadow:0 8px 32px rgba(0,0,0,0.15);
      display:none; flex-direction:column; z-index:9999; font-family:sans-serif; overflow:hidden; }
    #bai-panel.open { display:flex; }
    #bai-header { background:#e91e63; color:#fff; padding:16px; font-weight:600; font-size:15px; }
    #bai-messages { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; }
    .bai-msg { max-width:80%; padding:10px 14px; border-radius:12px; font-size:14px; line-height:1.5; }
    .bai-msg.user { align-self:flex-end; background:#e91e63; color:#fff; border-radius:12px 12px 2px 12px; }
    .bai-msg.bot { align-self:flex-start; background:#f5f5f5; color:#333; border-radius:12px 12px 12px 2px; }
    .bai-msg.ticket { background:#fff8e1; border-left:3px solid #ffc107; }
    #bai-input-row { display:flex; padding:12px; gap:8px; border-top:1px solid #eee; }
    #bai-input { flex:1; border:1px solid #ddd; border-radius:8px; padding:8px 12px;
      font-size:14px; outline:none; }
    #bai-send { background:#e91e63; color:#fff; border:none; border-radius:8px;
      padding:8px 16px; cursor:pointer; font-size:14px; }
  `
  document.head.appendChild(style)

  const bubble = document.createElement('button')
  bubble.id = 'bai-bubble'
  bubble.textContent = '💬'

  const panel = document.createElement('div')
  panel.id = 'bai-panel'
  panel.innerHTML = `
    <div id="bai-header">👋 How can we help?</div>
    <div id="bai-messages"></div>
    <div id="bai-input-row">
      <input id="bai-input" type="text" placeholder="Ask a question..." />
      <button id="bai-send">Send</button>
    </div>
  `

  document.body.appendChild(bubble)
  document.body.appendChild(panel)

  const messages = document.getElementById('bai-messages')
  const input = document.getElementById('bai-input')
  const sendBtn = document.getElementById('bai-send')

  bubble.addEventListener('click', () => panel.classList.toggle('open'))

  function addMessage(text, type) {
    const div = document.createElement('div')
    div.className = `bai-msg ${type}`
    div.textContent = text
    messages.appendChild(div)
    messages.scrollTop = messages.scrollHeight
  }

  async function sendMessage() {
    const query = input.value.trim()
    if (!query) return
    input.value = ''
    addMessage(query, 'user')
    addMessage('Thinking...', 'bot thinking')

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, widgetToken: WIDGET_TOKEN }),
      })
      const data = await res.json()
      messages.querySelector('.thinking')?.remove()
      if (data.type === 'answer') {
        addMessage(data.answer, 'bot')
      } else {
        addMessage(data.message, 'bot ticket')
      }
    } catch {
      messages.querySelector('.thinking')?.remove()
      addMessage('Something went wrong. Please try again.', 'bot')
    }
  }

  sendBtn.addEventListener('click', sendMessage)
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage() })
})()
