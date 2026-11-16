import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToStylist } from '../services/geminiService';

const StylistChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "Hey there! I'm your personal UrbanStylist. Looking for a specific vibe or need help pairing an outfit? Ask away! ✨",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToStylist(input);
      const botMsg: ChatMessage = {
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none">
      
      <div 
        className={`pointer-events-auto bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 sm:w-96 mb-4 overflow-hidden transition-all duration-300 origin-bottom-right transform ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 h-0'}`}
      >
        <div className="bg-gradient-to-r from-urban-900 to-gray-800 p-4 flex justify-between items-center">
          <div className="flex items-center text-white">
            <div className="bg-white/20 p-1.5 rounded-full mr-2">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">UrbanStylist AI</h3>
              <p className="text-xs text-gray-300">Online</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="h-80 overflow-y-auto p-4 bg-gray-50 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                  ? 'bg-urban-accent text-white rounded-br-none' 
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-500 border border-gray-200 rounded-2xl rounded-bl-none p-3 shadow-sm text-xs flex items-center">
                <span className="animate-bounce mr-1">●</span>
                <span className="animate-bounce mr-1 delay-100">●</span>
                <span className="animate-bounce delay-200">●</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 bg-white border-t border-gray-100 flex">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask for outfit advice..." 
            className="flex-1 bg-gray-100 text-gray-900 placeholder-gray-400 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-urban-accent/50"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="ml-2 p-2 bg-urban-900 text-white rounded-full hover:bg-urban-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto group flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${isOpen ? 'bg-gray-200 text-gray-600 rotate-90' : 'bg-urban-900 text-white hover:bg-urban-accent'}`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};

export default StylistChat;