(() => {
  // گرفتن پارامترها از تگ اسکریپت
  const scriptTag = document.currentScript;
  const webhookUrl = scriptTag.dataset.webhook || 'YOUR_MAKE_WEBHOOK_URL';
  const logoUrl = scriptTag.dataset.logo || 'https://via.placeholder.com/40?text=Logo';
  const primaryColor = scriptTag.dataset.color || '#00f0ff';
  const welcomeMessage = scriptTag.dataset.welcome || 'سلام! آماده‌ام که بدرخشم! چطور کمکت کنم؟';

  // اضافه کردن استایل‌ها
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

    .chat-bubble {
      animation: pulse 2s ease-in-out infinite;
      background: linear-gradient(135deg, ${primaryColor}, #8b5cf6);
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.5);
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(0, 240, 255, 0.5); }
      50% { transform: scale(1.1); box-shadow: 0 0 30px rgba(0, 240, 255, 0.7); }
    }
    .chat-container {
      display: none;
      width: 420px;
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.5s ease;
      font-family: 'Inter', sans-serif;
    }
    .chat-container.active {
      display: block;
      transform: translateY(0);
      opacity: 1;
    }
    .chat-header {
      background: linear-gradient(135deg, ${primaryColor}, #8b5cf6);
      box-shadow: 0 4px 15px rgba(0, 240, 255, 0.3);
    }
    .chat-body {
      background: linear-gradient(180deg, #1a1a2e, #16213e);
      color: #e5e7eb;
    }
    .message {
      opacity: 0;
      transform: translateY(10px);
      animation: fadeIn 0.5s ease forwards;
    }
    @keyframes fadeIn {
      to { opacity: 1; transform: translateY(0); }
    }
    .bot-message {
      background: rgba(0, 240, 255, 0.15);
      border: 1px solid rgba(0, 240, 255, 0.3);
    }
    .user-message {
      background: rgba(139, 92, 246, 0.15);
      border: 1px solid rgba(139, 92, 246, 0.3);
    }
    .chat-input {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #e5e7eb;
    }
    .chat-input:focus {
      border-color: ${primaryColor};
      box-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
    }
    .send-button {
      background: linear-gradient(135deg, ${primaryColor}, #8b5cf6);
      transition: all 0.3s ease;
    }
    .send-button:hover {
      background: linear-gradient(135deg, ${primaryColor}, #a78bfa);
      box-shadow: 0 0 15px rgba(0, 240, 255, 0.5);
    }
  `;
  document.head.appendChild(style);

  // اضافه کردن Tailwind CSS
  const tailwind = document.createElement('script');
  tailwind.src = 'https://cdn.tailwindcss.com';
  document.head.appendChild(tailwind);

  // ایجاد ویجت
  const widget = document.createElement('div');
  widget.innerHTML = `
    <div id="chatBubble" class="fixed bottom-8 right-8 z-50">
      <button class="chat-bubble text-white rounded-full p-5 shadow-2xl">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
        </svg>
      </button>
    </div>
    <div id="chatContainer" class="chat-container fixed bottom-28 right-8 bg-transparent rounded-3xl shadow-2xl z-50">
      <div class="chat-header text-white p-5 rounded-t-3xl flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <img src="${logoUrl}" alt="Logo" class="w-10 h-10 rounded-full">
          <h3 class="font-semibold text-lg">چت‌بات خیره‌کننده</h3>
        </div>
        <button id="closeChat" class="text-white hover:text-gray-200">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div id="chatBody" class="chat-body h-96 overflow-y-auto p-6 rounded-b-3xl">
        <div class="bot-message message p-4 rounded-xl mb-4 text-right">${welcomeMessage}</div>
      </div>
      <div class="p-6">
        <input id="userInput" type="text" placeholder="پیامتو بنویس..." class="chat-input w-full p-4 rounded-xl focus:outline-none">
        <button id="sendMessage" class="send-button mt-4 w-full text-white p-4 rounded-xl font-semibold">ارسال</button>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  // منطق JavaScript
  const chatBubble = document.getElementById('chatBubble');
  const chatContainer = document.getElementById('chatContainer');
  const closeChat = document.getElementById('closeChat');
  const sendMessage = document.getElementById('sendMessage');
  const userInput = document.getElementById('userInput');
  const chatBody = document.getElementById('chatBody');

  chatBubble.addEventListener('click', () => {
    chatContainer.classList.toggle('active');
  });

  closeChat.addEventListener('click', () => {
    chatContainer.classList.remove('active');
  });

  sendMessage.addEventListener('click', sendMessageHandler);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessageHandler();
  });

  async function sendMessageHandler() {
    const message = userInput.value.trim();
    if (!message) return;

    const userMessage = document.createElement('div');
    userMessage.className = 'user-message message p-4 rounded-xl mb-4 text-left';
    userMessage.textContent = message;
    chatBody.appendChild(userMessage);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      const botResponse = data.response || 'اوه، یه مشکلی پیش اومد! دوباره امتحان کن.';

      const botMessage = document.createElement('div');
      botMessage.className = 'bot-message message p-4 rounded-xl mb-4 text-right';
      botMessage.textContent = botResponse;
      chatBody.appendChild(botMessage);
    } catch (error) {
      console.error('Error:', error);
      const botMessage = document.createElement('div');
      botMessage.className = 'bot-message message p-4 rounded-xl mb-4 text-right bg-red-500/20';
      botMessage.textContent = 'خطا تو اتصال! یه لحظه صبر کن.';
      chatBody.appendChild(botMessage);
    }

    userInput.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;
  }
})();