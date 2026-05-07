import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const role = localStorage.getItem("role") || "Warga";
  const name = localStorage.getItem("name") || "Pengguna";

  useEffect(() => {
    // Initial greeting when opened for the first time
    if (isOpen && messages.length === 0) {
      setMessages([
        { id: 1, text: `Halo ${name}! Saya SipentarBot, asisten virtual Desa Lamaran Tarung. Ada yang bisa saya bantu terkait infrastruktur desa atau pelayanan Sipentar hari ini?`, isUser: false }
      ]);
    }
  }, [isOpen, messages.length, name]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message to state
    const newMessages = [...messages, { id: Date.now(), text: userMessage, isUser: true }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await api.post('/ai/chat', { 
        message: userMessage,
        userNameScript: `Pengguna yang bertanya bernama ${name} dengan peran ${role}.`,
        // Note: we can send history here if we want the AI to remember, but for now we keep it simple
      });

      setMessages([
        ...newMessages,
        { id: Date.now() + 1, text: response.data.reply, isUser: false }
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([
        ...newMessages,
        { id: Date.now() + 1, text: 'Maaf, sistem AI sedang sibuk atau ada gangguan jaringan. Silakan coba lagi nanti.', isUser: false, isError: true }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => setIsOpen(!isOpen);

  // Parse simple markdown-like bold text **text** from AI
  const formatText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="fixed bottom-28 right-4 md:bottom-6 md:right-6 z-[60] font-sans">
      {/* Widget Button */}
      <div className={`transition-all duration-300 transform ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}>
        <button 
          onClick={toggleChat}
          className="bg-white hover:bg-slate-50 text-emerald-600 rounded-full p-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 flex items-center justify-center transition-all duration-300 hover:shadow-[0_8px_30px_rgb(26,86,219,0.2)] hover:-translate-y-1 group relative w-16 h-16"
          title="Tanya SipentarBot AI"
        >
          <img src="/logosipentar.png" alt="SipentarBot" className="w-12 h-12 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
          {/* Sparkles */}
          <svg className="absolute -top-1 -right-1 w-5 h-5 text-sipentar-blue animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      </div>

      {/* Chat Window */}
      <div className={`absolute bottom-0 right-0 w-80 sm:w-96 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl shadow-sipentar-blue/10 flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 pointer-events-none translate-y-4'}`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sipentar-blue to-sipentar-blue-dark p-4 border-b border-sipentar-blue-dark/50 flex justify-between items-center text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center border-2 border-white/20 shadow-inner overflow-hidden p-1">
                <img src="/logosipentar.png" alt="Sipentar Logo" className="w-full h-full object-contain" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-sipentar-blue-dark rounded-full"></span>
            </div>
            <div>
              <h3 className="font-outfit font-bold text-base leading-tight">SipentarBot AI</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                <p className="text-[10px] text-blue-100 uppercase tracking-wider font-medium opacity-90">Online</p>
              </div>
            </div>
          </div>
          <button 
            onClick={toggleChat}
            className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all hover:rotate-90"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto min-h-[320px] max-h-[420px] bg-[#f8fafc] space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${msg.isUser ? 'bg-sipentar-blue text-white rounded-br-sm' : msg.isError ? 'bg-red-50 text-red-700 border border-red-100 rounded-bl-sm' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-soft-sm'}`}>
                {msg.isUser ? msg.text : formatText(msg.text)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-in fade-in">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-soft-sm flex items-center gap-1.5">
                <span className="w-2 h-2 bg-sipentar-blue rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-sipentar-blue rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-sipentar-blue rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-slate-100">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tanya SipentarBot..." 
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-sipentar-blue/30 focus:border-sipentar-blue/50 focus:bg-white transition-all disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-1.5 p-2 text-white bg-sipentar-blue rounded-lg hover:bg-sipentar-blue-dark disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-sm group"
            >
              <svg className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIChatWidget;
