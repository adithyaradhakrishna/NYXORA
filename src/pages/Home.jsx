import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase/config";
import { collection, addDoc, query, where, getDocs, orderBy } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaPlus,FaRobot, FaMoon, FaSignOutAlt, FaChartLine, FaBed, FaEye, FaMicrophone, FaStop, FaPlay, FaPause, FaTrash } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

const Home = () => {
  const [dream, setDream] = useState("");
  const [dreamTitle, setDreamTitle] = useState("");
  const [dreams, setDreams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDreamDetail, setShowDreamDetail] = useState(false);
  const [selectedDream, setSelectedDream] = useState(null);
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingMode, setRecordingMode] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);
  
  const navigate = useNavigate();
  const userEmail = auth.currentUser?.email || "";
  const location = useLocation();

  useEffect(() => {
    fetchDreams();
  }, [location, userEmail]);
  
  // Fetch user's dreams from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchDreams(user.email);
      } else {
        setDreams([]); // Clear dreams when user logs out
      }
    });
    return () => unsubscribe(); // Cleanup listener
  }, [location]);
  
  const fetchDreams = async (email) => {
    if (!email) return;
    try {
      const q = query(
        collection(db, "dreams"),
        where("email", "==", email),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      const dreamsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDreams(dreamsData);
    } catch (error) {
      console.error("Error fetching dreams:", error);
    }
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Setup timer for recording duration
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not access microphone. Please ensure you've granted microphone permissions.");
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop and clear the timer
      clearInterval(timerRef.current);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // Format recording time (mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Toggle audio playback
  const togglePlayback = () => {
    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
      } else {
        audioPlayerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle audio player events
  useEffect(() => {
    const audioPlayer = audioPlayerRef.current;
    
    if (audioPlayer) {
      const handleEnded = () => setIsPlaying(false);
      audioPlayer.addEventListener('ended', handleEnded);
      
      return () => {
        audioPlayer.removeEventListener('ended', handleEnded);
      };
    }
  }, [audioUrl]);

  // Clear recorded audio
  const clearRecording = () => {
    setAudioBlob(null);
    setAudioUrl("");
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Upload audio to Vercel Blob
  // Upload audio to server
const uploadAudioToVercelBlob = async (blob) => {
  try {
    const reader = new FileReader();
    reader.readAsDataURL(blob);

    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        const base64Data = reader.result.split(",")[1];

        try {
          const response = await fetch("https://nyxora.vercel.app/api/upload-voice", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ file: base64Data }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Server responded with status: ${response.status}, message: ${errorText}`);
            throw new Error(`Upload failed: ${response.status} - ${errorText || 'No error message provided'}`);
          }

          const data = await response.json();
          resolve(data.url);
        } catch (fetchError) {
          console.error("Fetch error:", fetchError);
          reject(fetchError);
        }
      };

      reader.onerror = (error) => reject(error);
    });
  } catch (error) {
    console.error("Error uploading to server:", error);
    throw error;
  }
};
  // Submit a new dream
  const handleAddDream = async () => {
    if (recordingMode && !audioBlob) {
      alert("Please record your dream first");
      return;
    }
  
    if (!recordingMode && (!dream || !dreamTitle)) {
      alert("Please add a title and description for your dream");
      return;
    }
  
    if (!dreamTitle) {
      alert("Please add a title for your dream");
      return;
    }
  
    try {
      let dreamData = {
        email: userEmail,
        title: dreamTitle,
        timestamp: new Date(),
      };
  
      // Handle text dream
      if (!recordingMode) {
        dreamData.dream = dream;
        dreamData.type = "text";
      } 
      // Handle audio dream
      else if (audioBlob) {
        // Upload audio to Vercel Blob
        const audioUrl = await uploadAudioToVercelBlob(audioBlob);
        dreamData.audioUrl = audioUrl;
        dreamData.type = "audio";
        dreamData.duration = recordingTime;
      }
  
      await addDoc(collection(db, "dreams"), dreamData);
  
      // Reset all fields
      setDream("");
      setDreamTitle("");
      setAudioBlob(null);
      setAudioUrl("");
      setRecordingTime(0);
      setShowModal(false);
  
      // Refresh dream list
      await fetchDreams(userEmail);
    } catch (error) {
      console.error("Error saving dream:", error);
      alert("Failed to save your dream. Please try again.");
    }
  };
  

  // Toggle between text and voice recording modes
  const toggleRecordingMode = () => {
    if (isRecording) {
      stopRecording();
    }
    
    if (recordingMode) {
      clearRecording();
    }
    
    setRecordingMode(!recordingMode);
  };

  // Logout function
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // Format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: "numeric" 
    });
  };

  // Open dream detail modal
  const openDreamDetail = (dreamData) => {
    setSelectedDream(dreamData);
    setShowDreamDetail(true);
  };

  // Truncate text function
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
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
        <nav className="sticky top-0 backdrop-blur-md bg-purple-900/20 border-b border-purple-500/30 p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center">
            <FaMoon className="text-purple-300 mr-2 text-xl" />
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent tracking-widest">NYXORA</div>
          </div>
          <div className="flex space-x-6 items-center">
            <button 
              onClick={() => navigate("/sleepanalysis")} 
              className="flex items-center text-gray-300 hover:text-purple-300 transition group"
            >
              <FaChartLine className="mr-2 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">Sleep Analysis</span>
            </button>
            
            <button 
              onClick={() => navigate("/chatbot")} 
              className="flex items-center text-gray-300 hover:text-purple-300 transition group"
            >
              <FaRobot className="mr-2 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">chatbot</span>
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
        <div className="flex-grow flex flex-col items-center px-4 py-8 md:py-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent mb-8">Dream Journal</h2>

          {/* Dream List (Cards) */}
          <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add New Dream Card - Positioned first for prominence */}
            <div 
              className="flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-xl p-6 backdrop-blur-md border border-purple-500/30 cursor-pointer hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all duration-300 min-h-64 group"
              onClick={() => setShowModal(true)}
            >
              <div className="bg-purple-500/30 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaPlus className="text-purple-300 text-3xl" />
              </div>
              <p className="text-purple-300 text-lg font-medium">Record New Dream</p>
            </div>

            {/* Dream entries */}
            {dreams.map((d) => (
              <div 
                key={d.id} 
                className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-5 backdrop-blur-md border border-blue-500/30 shadow-lg hover:shadow-[0_0_15px_rgba(96,165,250,0.4)] transition-all duration-300 flex flex-col min-h-64 cursor-pointer"
                onClick={() => openDreamDetail(d)}
              >
                <div className="text-xs text-blue-300 mb-2">{formatDate(d.timestamp)}</div>
                <h3 className="text-xl font-semibold text-purple-200 mb-3">{d.title || "Untitled Dream"}</h3>
                
                {/* Display appropriate content based on dream type */}
                {d.type === "audio" ? (
                  <div className="flex items-center justify-center flex-grow">
                    <div className="bg-blue-500/20 p-3 rounded-full">
                      <FaMicrophone className="text-purple-300 text-xl" />
                    </div>
                    <span className="ml-3 text-sm text-gray-300">Voice Recording ({formatTime(d.duration || 0)})</span>
                  </div>
                ) : (
                  <p className="text-gray-200 flex-grow">{truncateText(d.dream, 200)}</p>
                )}
                
                <div className="mt-4 pt-3 border-t border-blue-800/50 flex justify-between items-center">
                  <span className="text-blue-400 text-sm">
                    Dream #{dreams.indexOf(d) + 1}
                  </span>
                  <button 
                  className="flex items-center text-sm text-purple-300 hover:text-purple-200 transition"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click event
                    openDreamDetail(d);
                  }}
                >
                  <FaEye className="mr-1" /> View
                </button>
              </div>
            </div>
          ))}
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

      {/* Dream Input Modal with glass effect */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-900/80 to-blue-900/80 rounded-xl p-6 border border-purple-500/50 shadow-xl w-full max-w-md animate-fadeIn">
            <h3 className="text-2xl font-bold text-purple-200 mb-4">Capture Your Dream</h3>
            
            {/* Toggle between text and voice recording */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() => !recordingMode || toggleRecordingMode()}
                  className={`px-4 py-2 text-sm font-medium border rounded-l-lg ${
                    !recordingMode 
                      ? "bg-purple-600 text-white border-purple-700" 
                      : "bg-purple-900/50 text-purple-300 border-purple-800/50 hover:bg-purple-700/50"
                  }`}
                >
                  Write Dream
                </button>
                <button
                  type="button"
                  onClick={() => recordingMode || toggleRecordingMode()}
                  className={`px-4 py-2 text-sm font-medium border rounded-r-lg ${
                    recordingMode 
                      ? "bg-purple-600 text-white border-purple-700" 
                      : "bg-purple-900/50 text-purple-300 border-purple-800/50 hover:bg-purple-700/50"
                  }`}
                >
                  Record Voice
                </button>
              </div>
            </div>
            
            {/* Dream Title Input */}
            <input
              type="text"
              className="w-full p-4 rounded-lg bg-blue-950/70 border border-blue-700/70 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 placeholder-blue-400/70"
              placeholder="Enter a title for your dream..."
              value={dreamTitle}
              onChange={(e) => setDreamTitle(e.target.value)}
              autoFocus
            />
            
            {/* Text Input Mode */}
            {!recordingMode && (
              <textarea
                className="w-full p-4 rounded-lg bg-blue-950/70 border border-blue-700/70 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-48 placeholder-blue-400/70"
                placeholder="Describe what you remember from your dreamscape..."
                value={dream}
                onChange={(e) => setDream(e.target.value)}
              />
            )}
            
            {/* Voice Recording Mode */}
            {recordingMode && (
              <div className="w-full bg-blue-950/70 border border-blue-700/70 rounded-lg p-6 h-48 flex flex-col items-center justify-center">
                {!audioBlob ? (
                  <div className="flex flex-col items-center">
                    {/* Recording button */}
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all ${
                        isRecording 
                          ? "bg-red-600 animate-pulse" 
                          : "bg-purple-600 hover:bg-purple-500"
                      }`}
                    >
                      {isRecording 
                        ? <FaStop className="text-white text-xl" /> 
                        : <FaMicrophone className="text-white text-xl" />
                      }
                    </button>
                    
                    {/* Recording status text */}
                    {isRecording ? (
                      <div className="text-red-400 font-medium animate-pulse">
                        Recording... {formatTime(recordingTime)}
                      </div>
                    ) : (
                      <div className="text-purple-300">
                        Tap to start recording
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    {/* Audio player */}
                    <audio ref={audioPlayerRef} src={audioUrl} className="hidden" />
                    
                    <div className="flex items-center space-x-4 mb-4">
                      {/* Play/Pause button */}
                      <button
                        onClick={togglePlayback}
                        className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center"
                      >
                        {isPlaying 
                          ? <FaPause className="text-white" /> 
                          : <FaPlay className="text-white ml-1" />
                        }
                      </button>
                      
                      {/* Duration */}
                      <div className="text-blue-300 font-medium">
                        {formatTime(recordingTime)}
                      </div>
                      
                      {/* Delete button */}
                      <button
                        onClick={clearRecording}
                        className="w-10 h-10 rounded-full bg-red-600/30 hover:bg-red-600/50 flex items-center justify-center"
                      >
                        <FaTrash className="text-red-300" />
                      </button>
                    </div>
                    
                    <div className="text-purple-300 text-sm">
                      Recording ready
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-gray-700/80 hover:bg-gray-600 rounded-lg text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDream}
                disabled={recordingMode ? !audioBlob || !dreamTitle : !dream || !dreamTitle}
                className={`px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white shadow-lg transition ${
                  (recordingMode ? !audioBlob || !dreamTitle : !dream || !dreamTitle)
                    ? "opacity-50 cursor-not-allowed" 
                    : "hover:from-purple-500 hover:to-blue-500 hover:shadow-purple-500/50"
                }`}
              >
                Save Dream
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dream Detail Modal */}
      {showDreamDetail && selectedDream && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-900/80 to-blue-900/80 rounded-xl p-6 border border-purple-500/50 shadow-xl w-full max-w-lg animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <div className="text-xs text-blue-300">{formatDate(selectedDream.timestamp)}</div>
              <div className="text-xs text-purple-300">Dream #{dreams.indexOf(selectedDream) + 1}</div>
            </div>
            
            <h3 className="text-2xl font-bold text-purple-200 mb-4">{selectedDream.title || "Untitled Dream"}</h3>
            
            {/* Display content based on dream type */}
            {selectedDream.type === "audio" ? (
              <div className="bg-blue-900/30 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-purple-500/30 p-3 rounded-full mr-3">
                    <FaMicrophone className="text-purple-300 text-xl" />
                  </div>
                  <span className="text-blue-300">Voice Recording ({formatTime(selectedDream.duration || 0)})</span>
                </div>
                
                {/* Audio player for the stored recording */}
                <div className="w-full bg-blue-950/50 rounded-lg p-3 flex items-center justify-center">
                  <audio 
                    controls 
                    src={selectedDream.audioUrl} 
                    className="w-full h-10"
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto pr-2 mb-6">
                <p className="text-gray-200 whitespace-pre-line">{selectedDream.dream}</p>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowDreamDetail(false)}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white shadow-lg hover:from-blue-500 hover:to-purple-500 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default Home;