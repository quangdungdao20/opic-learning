import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Menu, BookOpen } from 'lucide-react';
import Sidebar from './components/Sidebar';
import TopicDetail from './components/TopicDetail';

function App() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    // Determine base URL dynamically based on environment / github Pages
    const baseUrl = import.meta.env.BASE_URL;
    fetch(`${baseUrl}data/manifest.json`)
      .then(res => res.json())
      .then(data => {
        setTopics(data.topics || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load manifest", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <BookOpen size={48} className="text-primary" />
          <p className="text-slate-500 font-medium tracking-wide">Loading OPic Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden relative font-sans text-slate-800 selection:bg-primary/20">
      <Sidebar topics={topics} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      
      <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full relative">
        <div className="xl:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 w-full">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <BookOpen size={20} className="text-primary" />
            <span>OPic Study</span>
          </div>
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg outline-none"
          >
            <Menu size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-x-hidden">
          <Routes>
            <Route path="/" element={
              topics.length > 0 ? (
                <Navigate to={`/topic/${encodeURIComponent(topics[0].id)}`} replace />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <p>No topics found in manifest.</p>
                </div>
              )
            } />
            <Route path="/topic/:id" element={<TopicDetail topics={topics} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
