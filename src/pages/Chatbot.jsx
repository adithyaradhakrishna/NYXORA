import React, { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaRobot, FaUser, FaMoon, FaSpinner, FaSignOutAlt, FaChartLine, FaBed } from "react-icons/fa";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Welcome to Dream Interpreter! Share your dream, and I'll help interpret its meaning." }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  
  // Hardcoded Groq API key and configuration
  const GROQ_API_KEY = "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";
  const MODEL = "llama-3.3-70b-versatile";

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessage = { sender: "user", text: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input
    setInputMessage("");
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Call Groq API for dream interpretation
      const response = await interpretDream(inputMessage);
      
      // Add bot response
      const botMessage = { sender: "bot", text: response };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error interpreting dream:", error);
      
      // Add error message
      const errorMessage = { 
        sender: "bot", 
        text: "I encountered an issue interpreting your dream. Please try again later." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const interpretDream = async (dreamText) => {
    try {
      const prompt = `You are a mystical dream interpreter using psychological and symbolic analysis to interpret dreams. 
      
      Analyze this dream in a mystical yet insightful tone:
      "${dreamText}"
      
      Your interpretation should include:
      1. The key symbols and their potential meanings
      2. Emotional undertones and their significance
      3. Possible connections to the dreamer's waking life
      4. Psychological insights drawing from archetypes and the collective unconscious
      5. Potential messages or guidance the dream might be offering
      
      Keep your interpretation mystical, introspective, yet grounded in psychological understanding.`;
      
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: "You are a mystical dream interpreter with expertise in Jungian psychology, symbolism, and subconscious meaning." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorData}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("API error:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0526] via-[#1a0f33] to-[#2e124d] text-gray-100">
      {/* Background stars effect created with CSS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/5 via-transparent to-transparent bg-[length:4px_4px]"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navbar with glass effect */}
        <nav className="sticky top-0 backdrop-blur-md bg-purple-900/20 border-b border-purple-500/30 p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center">
            <FaMoon className="text-purple-300 mr-2 text-xl" />
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent tracking-widest">NYXORA</div>
          </div>
          <div className="flex space-x-6 items-center">
            <button 
              onClick={() => navigate("/home")} 
              className="flex items-center text-gray-300 hover:text-purple-300 transition group"
            >
              <FaMoon className="mr-2 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">Dream Journal</span>
            </button>
            
            <button 
              onClick={() => navigate("/sleepanalysis")} 
              className="flex items-center text-gray-300 hover:text-purple-300 transition group"
            >
              <FaChartLine className="mr-2 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">Sleep Analysis</span>
            </button>
            
            <button 
              onClick={() => navigate("/bed")} 
              className="flex items-center text-gray-300 hover:text-purple-300 transition group"
            >
              <FaBed className="mr-2 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">Bed</span>
            </button>

            <button 
              onClick={handleLogout} 
              className="flex items-center text-gray-300 hover:text-red-400 transition group"
            >
              <FaSignOutAlt className="mr-2 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-grow flex flex-col px-4 py-8 md:py-12 max-w-4xl mx-auto w-full">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent mb-8 text-center">Dream Interpreter</h2>
          
          {/* Chat Messages Container */}
          <div className="flex-grow bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-t-xl backdrop-blur-md border border-purple-500/30 p-4 overflow-y-auto max-h-[60vh]">
            <div className="flex flex-col space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === "user" 
                        ? "bg-purple-600/70 text-white" 
                        : "bg-blue-900/70 text-gray-100"
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      {message.sender === "bot" ? (
                        <FaRobot className="text-blue-300 mr-2" />
                      ) : (
                        <FaUser className="text-purple-300 mr-2" />
                      )}
                      <span className="text-xs opacity-70">
                        {message.sender === "bot" ? "Dream Interpreter" : "You"}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-lg bg-blue-900/70 text-gray-100">
                    <div className="flex items-center mb-1">
                      <FaRobot className="text-blue-300 mr-2" />
                      <span className="text-xs opacity-70">Dream Interpreter</span>
                    </div>
                    <div className="flex items-center">
                      <FaSpinner className="animate-spin text-blue-300 mr-2" />
                      <span className="text-sm">Interpreting your dream...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Input Form */}
          <form 
            onSubmit={handleSubmit}
            className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-b-xl border-t-0 border border-purple-500/30 p-4 flex items-center"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Share your dream..."
              className="flex-grow p-3 rounded-lg bg-blue-950/70 border border-blue-700/70 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-blue-400/70"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`ml-3 p-3 rounded-full ${
                isLoading || !inputMessage.trim()
                  ? "bg-purple-900/50 text-purple-300/50 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-500"
              }`}
              disabled={isLoading || !inputMessage.trim()}
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
        
        {/* Footer with aurora effect */}
        <footer className="relative p-6 text-center">
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 blur-xl"></div>
          <div className="relative z-10">
            <div className="text-purple-300 font-medium mb-1">Nyxora</div>
            <div className="text-gray-400 text-sm">Explore your dream consciousness © 2025</div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Chatbot;