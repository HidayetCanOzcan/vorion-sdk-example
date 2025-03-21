"use client"
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { VorionRAGSDK } from "vorion-sdk";
import { GetHistoryTypes, PredictTypes, VorionEnums, VorionLLMSDK } from "vorion-sdk";
import useAction from "./_hooks/UseAction";
import { Ingest } from "./_actions/Ingest";

export default function Home() {
  const llmSdk = new VorionLLMSDK('https://llm-api.rise-consulting.net');
  
  type MessageType = {
    conversation_state_key?: string;
    prompt?: {
      text: string;
      sensitive_info: boolean | undefined;
      rag_content: any;
      save_prompt_with_rag_content?: boolean;
      create_image?: boolean;
      analyse_image?: boolean;
      image_size?: string;
      image_style?: string;
      image_quality?: string;
    };
    answer?: string;
    user_id?: string | null;
    llm_name?: string;
    llm_group_name?: string;
    memory_type?: string;
    system_message?: string;
    created_at?: string;
  };

  
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [message, setMessage] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  async function sendMessageHandler(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!message.trim() || isPending) return;
    
    setIsPending(true);
    const ask: PredictTypes.PredictRequest = {
      llm_name: VorionEnums.LLMOptions.Claude,
      llm_group_name: VorionEnums.LLMGroupNameOptions['claude-3-5-sonnet'],
      conversation_state_key: 'vorion_sdk_test_15',
      load_balancer_strategy_name: VorionEnums.LoadBalanceStrategyOptions.RoundRobin,
      memory_type: VorionEnums.MemoryOptions.Redis,
      memory_strategy_name: VorionEnums.MemoryStrategyOptions.FullSummarize,
      user_id: 'vorion_sdk_user_01',
      prompt: {
        text: message,
        sensitive_info: false,
      },
      language: 'english',
      system_message: ``,
    };

    // Add user message to the chat
    const userMessage: MessageType = {
      prompt: {
        text: message,
        sensitive_info: false,
        rag_content: null,
      },
      created_at: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    
    try {
      const response = await llmSdk.predict(ask);
      
      // Add AI response to the chat
      if (response && response.response) {
        // Convert the response to our MessageType format
        const aiMessage: MessageType = {
          answer: response.response.answer,
          conversation_state_key: response.response.conversation_state_key,
          user_id: response.response.user_id,
          llm_name: response.response.llm_name,
          llm_group_name: response.response.llm_group_name,
          memory_type: response.response.memory_type,
          system_message: response.response.system_message,
          created_at: new Date().toISOString()
        };
        
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally add an error message to the chat
    } finally {
      setIsPending(false);
    }
  }
  
  function clearConversation() {
    setMessages([]);
    setIsMenuOpen(false);
  }
  
  const formatDate = (timestamp: string | undefined) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // async function ingest(){
  //   const res = await Ingest()
  //   console.log(res)
  // }


  // useEffect(()=>{
  //   ingest()
  // },[])
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-semibold text-gray-800">Vorion AI Asistanı</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              {isMenuOpen && (
                <div className="origin-top-right absolute right-4 mt-32 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <button
                      onClick={clearConversation}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Konuşmayı Temizle
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="bg-blue-50 rounded-full p-3 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-medium text-gray-800 mb-2">Bugün size nasıl yardımcı olabilirim?</h2>
                <p className="text-gray-500 max-w-md">
                  Bana istediğinizi sorun, size mümkün olan en doğru ve yardımcı cevabı vereceğim.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, index) => {
                  const isUser = 'prompt' in msg;
                  const content = isUser ? msg.prompt?.text : msg.answer || '';
                  // Handle timestamp safely with type checking
                  const timestamp = msg.created_at ? String(msg.created_at) : undefined;
                  
                  return (
                    <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg px-4 py-3 ${isUser ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 shadow-sm'}`}>
                        <div className="flex items-start">
                          {!isUser && (
                            <div className="flex-shrink-0 mr-3">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="text-sm mb-1">
                              <span className="font-medium">{isUser ? 'Siz' : 'AI Asistanı'}</span>
                              <span className="text-xs ml-2 opacity-70">{formatDate(timestamp)}</span>
                            </div>
                            <div className={`text-sm ${isUser ? 'text-white' : 'text-gray-800'}`}>
                              {content}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-4">
            <form onSubmit={sendMessageHandler} className="flex items-end gap-2">
              <div className="relative flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mesajınızı buraya yazın..."
                  className="w-full border border-gray-300 text-black placeholder-gray-500 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessageHandler();
                    }
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={isPending || !message.trim()}
                className={`inline-flex items-center justify-center rounded-lg px-4 py-3 transition-colors ${isPending || !message.trim() ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {isPending ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </form>
            <p className="mt-2 text-xs text-gray-500 text-center">
              Vorion AI tarafından desteklenmektedir | Claude 3.5 Sonnet
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
