import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { FaMoon, FaLock, FaEnvelope } from "react-icons/fa";

const SleepAnalysisLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const sleepTips = [
    "Dreams occur primarily during REM sleep, which makes up about 25% of your total sleep time.",
    "Keeping a dream journal by your bed can help improve dream recall over time.",
    "Lucid dreaming—becoming aware you're dreaming while in the dream—can be learned through practice.",
    "Most people have between 3-5 dreams per night, though we often forget them upon waking.",
    "The position you sleep in may influence the type of dreams you have.",
    "Recurring dreams often reflect unresolved conflicts in your waking life.",
    "Some cultures believe dreams are messages from ancestors or spiritual realms.",
    "Eating certain foods like cheese before bed may increase dream vividness.",
    "Sleep paralysis occurs when your mind wakes before your body, often accompanied by vivid hallucinations."
  ];

  const randomTip = sleepTips[Math.floor(Math.random() * sleepTips.length)];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (err) {
      setError("Failed to log in. Check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0526] via-[#1a0f33] to-[#2e124d] text-gray-100">
      {/* Background stars and nebula effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://api.placeholder/1920/1080')] bg-cover opacity-20"></div>
        {/* We use placeholder here as per instructions, in real app you'd use actual star field image */}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navbar with glass effect */}
        <nav className="backdrop-blur-md bg-purple-900/20 border-b border-purple-500/30 p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center">
            <FaMoon className="text-purple-300 mr-2 text-xl" />
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent tracking-widest">NYXORA</div>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-300 hover:text-purple-300 transition">About</a>
            <a href="#" className="text-gray-300 hover:text-purple-300 transition">Features</a>
            <a href="#" className="text-gray-300 hover:text-purple-300 transition">Contact</a>
          </div>
        </nav>

        <div className="flex-grow flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full">
            {/* Login Card */}
            <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-xl p-8 backdrop-blur-md border border-purple-500/30 shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300">
              <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">Journey Into Your Dreams</h2>

              {error && (
                <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-3 mb-6">
                  <p className="text-red-300 text-sm text-center">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-blue-300 mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-purple-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-blue-950/70 border border-blue-700/70 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-300 mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-purple-400" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-blue-950/70 border border-blue-700/70 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <button 
                    type="submit" 
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg font-medium transition-all duration-300 text-white shadow-lg hover:shadow-purple-500/50 transform hover:translate-y-0.5"
                  >
                    Enter Dreamscape
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <a href="#" className="text-purple-400 hover:text-purple-300 transition">Forgot password?</a>
                <div className="mt-3">
                  <span className="text-gray-400">New dreamer? </span>
                  <a href="/signup" className="text-purple-400 hover:text-purple-300 transition">Sign up</a>
                </div>
              </div>
            </div>

            {/* Dream Insight Card */}
            <div className="mt-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-6 backdrop-blur-md border border-blue-500/30 shadow-lg hover:shadow-[0_0_15px_rgba(96,165,250,0.3)] transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="h-4 w-4 rounded-full bg-blue-400 mr-2"></div>
                <h3 className="text-lg font-medium text-blue-300">Dream Insight</h3>
              </div>
              <p className="text-gray-200 italic">{randomTip}</p>
            </div>
          </div>
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

export default SleepAnalysisLogin;