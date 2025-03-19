import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config"; // Adjust the path if necessary
import { useNavigate } from "react-router-dom"; // For redirecting after sign-up

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const sleepTips = [
    "A good night's sleep helps with memory consolidation and learning.",
    "Avoid screens before bed; blue light disrupts melatonin production.",
    "Establish a bedtime routine to signal your body when it's time to sleep.",
    "Keep your bedroom cool, dark, and quiet for optimal sleep quality.",
    "Chamomile tea before bed may promote relaxation and better sleep."
  ];
  const randomTip = sleepTips[Math.floor(Math.random() * sleepTips.length)];

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("User registered successfully");
      navigate("/"); // Redirect user to login after successful sign-up
    } catch (err) {
      setError("Failed to create an account. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#000224] text-gray-100">
      <div className="min-h-screen bg-gradient-to-b from-[#00010f] to-[#00021e] flex flex-col">
        <nav className="p-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-purple-400 tracking-widest">NYXORA</div>
          <div className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-300 hover:text-purple-400 transition">About</a>
            <a href="#" className="text-gray-300 hover:text-purple-400 transition">Features</a>
            <a href="#" className="text-gray-300 hover:text-purple-400 transition">Contact</a>
          </div>
        </nav>

        <div className="flex-grow flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-blue-900 bg-opacity-40 rounded-lg p-8 backdrop-blur-sm border border-purple-900 shadow-lg shadow-purple-900/20">
              <h2 className="text-2xl font-bold text-center mb-6 text-purple-300">Sign Up for Nyxora</h2>

              {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

              <form onSubmit={handleSignUp} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-blue-950 border border-blue-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-blue-950 border border-blue-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-blue-950 border border-blue-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <button 
                    type="submit" 
                    className="w-full py-2 px-4 bg-purple-700 hover:bg-purple-600 rounded font-medium transition duration-200 text-white"
                  >
                    Sign Up
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <span className="text-gray-400 text-sm">Already have an account? </span>
                <a href="/" className="text-sm text-purple-400 hover:text-purple-300">Log in</a>
              </div>
            </div>

            <div className="mt-6 bg-blue-900 bg-opacity-40 rounded-lg p-6 backdrop-blur-sm border border-blue-700">
              <h3 className="text-lg font-medium text-blue-300 mb-2">Sleep Wisdom</h3>
              <p className="text-gray-300 italic">{randomTip}</p>
            </div>
          </div>
        </div>

        <footer className="p-4 text-center text-gray-500 text-sm">
          Nyxora — Explore your dream consciousness © 2025
        </footer>
      </div>
    </div>
  );
};

export default SignUp;
