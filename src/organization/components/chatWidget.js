import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, LoaderIcon } from 'lucide-react';
import axios from 'axios';
import { RiSendPlane2Fill, RiRobot2Fill } from "react-icons/ri";
import { FcCustomerSupport } from "react-icons/fc";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! 👋 Welcome to Optimus AI Assistant, How can I help you today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
  
    // Add user message to chat
    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
  
    try {
      // Call your backend API that connects to Cohere
      const response = await axios.post('http://localhost:5011/api/chat', {
        messages: [...messages, userMessage]
      });
  
      // Add assistant response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      console.error('Error calling Cohere API:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatMessage = (content) => {
    // Check if content is a string
    if (typeof content !== 'string') return content;

    // Split content into sections based on markdown-like syntax
    const sections = content.split(/(?=#{1,6}\s|```|`|\*{1,2}|_{1,2}|\[|\n-|\n\d+\.)/);

    return sections.map((section, index) => {
      // Handle headings
      if (section.match(/^#{1,6}\s/)) {
        const level = section.match(/^#+/)[0].length;
        const text = section.replace(/^#+\s/, '');
        return React.createElement(`h${level}`, { 
          key: index,
          className: `text-${7-level}xl font-bold mb-2 mt-4 text-gray-800`
        }, text);
      }

      // Handle code blocks
      if (section.startsWith('```')) {
        const code = section.replace(/^```\w*\n?|\n?```$/g, '');
        return (
          <pre key={index} className="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4">
            <code className="text-sm font-mono">{code}</code>
          </pre>
        );
      }

      // Handle inline code
      if (section.startsWith('`')) {
        const code = section.replace(/^`|`$/g, '');
        return (
          <code key={index} className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
            {code}
          </code>
        );
      }

      // Handle lists
      if (section.startsWith('\n-') || section.startsWith('\n*')) {
        const items = section.split('\n').filter(item => item.trim());
        return (
          <ul key={index} className="list-disc pl-6 my-2 space-y-1">
            {items.map((item, i) => (
              <li key={i} className="text-gray-700">{item.replace(/^[-*]\s/, '')}</li>
            ))}
          </ul>
        );
      }

      // Handle numbered lists
      if (section.match(/^\n\d+\./)) {
        const items = section.split('\n').filter(item => item.trim());
        return (
          <ol key={index} className="list-decimal pl-6 my-2 space-y-1">
            {items.map((item, i) => (
              <li key={i} className="text-gray-700">{item.replace(/^\d+\.\s/, '')}</li>
            ))}
          </ol>
        );
      }

      // Handle bold and italic text
      let formattedText = section;
      formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
      formattedText = formattedText.replace(/_(.*?)_/g, '<em>$1</em>');

      // Handle links
      formattedText = formattedText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

      return (
        <p 
          key={index} 
          className="text-gray-700 mb-2"
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />
      );
    });
  };

  return (
    <div className="font-sans ">
    {/* Floating Chat Button */}
    <div
      className="fixed bottom-6 right-6 z-50 cursor-pointer transition-transform hover:scale-110"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div
        className="w-16 h-16 rounded-full shadow-xl flex items-center justify-center text-white text-2xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #2D1E3E, #2c61b7)',
          boxShadow: '0 4px 15px rgba(44, 97, 183, 0.3)'
        }}
      >
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-full "></div>
        {isOpen ? '✕' : (
       <RiRobot2Fill />
        )}
      </div>
    </div>
  
    {/* Chat Box */}
    {isOpen && (
      <div style={{maxWidth: '500px',}} className=" fixed bottom-24 right-6 w-90 z-50">
        {/* Gradient border wrapper */}
        <div className="relative p-0.5 rounded-xl bg-gradient-to-r from-[#2D1E3E] via-[#3a3a8f] to-[#2c61b7] animate-gradient-rotate">
          <div style={{ maxHeight: '500px',}} className="border border-transparent animate-gradient-border bg-white rounded-xl shadow-xl h-[500px] flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div
              className="p-4 rounded-t-xl flex justify-between items-center text-white"
              style={{
               
                background: 'linear-gradient(135deg, #2D1E3E, #2c61b7)'
              }}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-2">
                <FcCustomerSupport  className='h-5 w-5'/>
                </div>
                <h4 className="text-lg font-semibold">Optimus AI Assistant</h4>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 text-xl font-bold"
              >
                ×
              </button>
            </div>
  
            {/* Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-200 to-blue-300 text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none">
                          {formatMessage(message.content)}
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-xl rounded-bl-none">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
  
            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-3 bg-white">
            <div className="flex items-center gap-2 w-full px-3 pb-3">
  <input
    type="text"
    value={inputMessage}
    onChange={(e) => setInputMessage(e.target.value)}
    placeholder="Type your message..."
    className="flex-grow p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
    disabled={isLoading}
  />
  <button
    type="submit"
    disabled={isLoading || !inputMessage.trim()}
    className={`w-12 h-12 rounded-full transition-all text-white flex items-center justify-center ${
      !inputMessage.trim() || isLoading ? 'bg-gray-400 cursor-not-allowed' : ''
    }`}
    style={
      inputMessage.trim() && !isLoading
        ? {
            background: 'linear-gradient(to right, #2D1E3E, #2c61b7)'
          }
        : {}
    }
  >
    {isLoading ? (
      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    ) : (
      // Send icon pointing RIGHT
      <RiSendPlane2Fill className="w-5 h-5 transform " />
    )}
  </button>
</div>

</form>

          </div>
        </div>
      </div>
    )}
  
    {/* Add to your global CSS */}
    <style jsx>{`
      @keyframes gradient-rotate {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        75% { background-position: 0% 50%; }
        100% { background-position: 0% 100%; }
      }
      .animate-gradient-rotate {
        background-size: 200% 200%;
        animation: gradient-rotate 3s ease infinite;
      }
      @keyframes gradient-border {
        0% { border-color: #2c61b7; }
        50% { border-color: #2D1E3E; }
        75% { border-color: #fff; }
        100% { border-color: #2c61b7; }
      }
      .animate-gradient-border {
        animation: gradient-border 3s ease infinite;
      }
    `}</style>
  </div>
  );
};

export default ChatWidget;