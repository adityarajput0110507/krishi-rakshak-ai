import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mic, MicOff, Send, X, Volume2, VolumeX, MessageSquare, ArrowRight, Bot } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  links?: { label: string; path: string }[];
}

export const KisanVoiceAssistant: React.FC = () => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text:
        language === 'mr'
          ? 'नमस्कार शेतकरी बंधूंनो! तुम्ही कोणत्याही पिकाचा रोग, कीड, सरकारी योजना किंवा बाजारभावाबद्दल विचारू शकता.'
          : language === 'en'
          ? 'Namaste! Ask me anything about crop diseases, pests, Govt schemes (PM-KISAN / PMFBY), or Mandi prices.'
          : 'नमस्ते किसान भाई! आप किसी भी फसल के रोग, कीट, मौसम, मंडी भाव या सरकारी योजना के बारे में बोलकर या लिखकर पूछ सकते हैं।',
      links: [
        { label: 'रोग जांचें', path: '/detect' },
        { label: 'योजनाएं व मंडी भाव', path: '/schemes' }
      ]
    }
  ]);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = language === 'mr' ? 'mr-IN' : language === 'en' ? 'en-IN' : 'hi-IN';
    utter.rate = 0.95;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  };

  const sendQuery = async (queryText: string, autoSpeak = false) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { sender: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askKisanSahayak(trimmed, language);
      const botMsg: ChatMessage = {
        sender: 'bot',
        text: res.answer,
        links: res.links || []
      };
      setMessages((prev) => [...prev, botMsg]);
      if (autoSpeak) {
        speakText(res.answer);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'संपर्क में समस्या आई। कृपया किसान कॉल सेंटर 1800-180-1551 पर कॉल करें या रोग जांच पेज खोलें।'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('आपका ब्राउज़र सीधे माइक वॉइस टाइपिंग सपोर्ट नहीं करता। कृपया नीचे अपना सवाल लिखें।');
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'mr' ? 'mr-IN' : language === 'en' ? 'en-IN' : 'hi-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      sendQuery(transcript, true);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const quickChips = [
    'टमाटर के रोग व दवा बताएं',
    'PM-KISAN योजना क्या है?',
    'कपास और प्याज का मंडी भाव',
    'मौसम और बारिश की जानकारी'
  ];

  return (
    <div className="fixed bottom-5 right-5 z-50 no-print">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2.5 bg-[#0F2942] hover:bg-[#14532D] text-white px-4 py-3 rounded-full shadow-xl border-2 border-[#FF9933] transition-all group"
          title="बोलकर पूछें - किसान सहायक"
        >
          <div className="w-8 h-8 rounded-full bg-[#FF9933] text-[#0F2942] flex items-center justify-center shrink-0">
            <Mic className="w-4 h-4" />
          </div>
          <div className="text-left leading-tight pr-1">
            <div className="text-xs font-extrabold">किसान सहायक</div>
            <div className="text-[10px] text-amber-300 font-semibold">बोलकर या लिखकर पूछें</div>
          </div>
        </button>
      ) : (
        <div className="w-[340px] sm:w-[390px] bg-white rounded-2xl border-2 border-[#0F2942] shadow-2xl overflow-hidden flex flex-col max-h-[82vh]">
          {/* Header */}
          <div className="bg-[#0F2942] text-white px-4 py-3 flex items-center justify-between border-b-2 border-[#FF9933]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#14532D] border border-amber-300 flex items-center justify-center">
                <Bot className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="font-extrabold text-sm leading-tight">किसान सहायक (Voice Help)</div>
                <div className="text-[10px] text-green-300">हिंदी • मराठी • English</div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {speaking && (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="p-1.5 bg-red-600 text-white rounded-lg text-xs"
                  title="Stop voice"
                >
                  <VolumeX className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="p-3.5 space-y-3 overflow-y-auto flex-1 bg-[#F4F6F4] max-h-[340px]">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] rounded-xl p-3 text-xs leading-relaxed shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-[#14532D] text-white font-semibold'
                      : 'bg-white text-slate-800 border border-slate-300 font-medium'
                  }`}
                >
                  <div>{m.text}</div>
                  {m.sender === 'bot' && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => speakText(m.text)}
                        className="inline-flex items-center space-x-1 text-[10px] font-bold text-[#0F2942] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded"
                      >
                        <Volume2 className="w-3 h-3 text-[#14532D]" />
                        <span>सुनें</span>
                      </button>
                      {m.links &&
                        m.links.map((lk, lIdx) => (
                          <Link
                            key={lIdx}
                            to={lk.path}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center space-x-1 text-[10px] font-bold text-white bg-[#14532D] hover:bg-[#0f3f22] px-2 py-0.5 rounded"
                          >
                            <span>{lk.label}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-slate-500 font-semibold italic px-2">
                जवाब ढूंढा जा रहा है...
              </div>
            )}
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-200 flex gap-1.5 overflow-x-auto">
            {quickChips.map((chip, cIdx) => (
              <button
                key={cIdx}
                type="button"
                onClick={() => sendQuery(chip)}
                className="shrink-0 text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 px-2.5 py-1 rounded-full transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input + Mic Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendQuery(input);
            }}
            className="p-2.5 bg-white border-t border-slate-300 flex items-center space-x-2"
          >
            <button
              type="button"
              onClick={startVoiceInput}
              className={`p-2.5 rounded-full transition-all shrink-0 ${
                listening
                  ? 'bg-red-600 text-white animate-pulse shadow'
                  : 'bg-[#FF9933] hover:bg-amber-500 text-[#0F2942]'
              }`}
              title="माइक से बोलें"
            >
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? 'बोलिए, मैं सुन रहा हूं...' : 'सवाल लिखें या माइक दबाएं...'}
              className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#14532D] font-semibold"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-lg bg-[#14532D] hover:bg-[#0f3f22] disabled:opacity-40 text-white shrink-0"
              title="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

