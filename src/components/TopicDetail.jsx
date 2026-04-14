import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Headphones, BookOpen, FileText, ChevronUp } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

const TopicDetail = ({ topics }) => {
  const { id } = useParams();
  const topic = topics.find(t => t.id === id);
  const [activeScriptIdx, setActiveScriptIdx] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = useRef(null);

  // Reset active script when topic changes
  useEffect(() => {
    setActiveScriptIdx(0);
    if (containerRef.current) {
      containerRef.current.scrollTo(0, 0);
    }
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!topic) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="text-center text-slate-500">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-10" />
          <h2 className="text-xl font-medium">Topic not found</h2>
          <p className="mt-2 text-sm">Please select a topic from the sidebar.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto py-8 px-4 sm:px-10 w-full animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out pb-32">
      {/* Header Card */}
      <header className="mb-10 p-8 sm:p-10 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] rounded-full mb-4">
             Learning Set
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">{topic.name}</h1>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2.5 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100/50 text-slate-600">
              <Headphones size={16} className="text-primary" />
              <span className="text-sm font-bold">{topic.audioFiles.length} <span className="text-slate-400 font-medium">Questions</span></span>
            </div>
            {topic.hasAnswer && (
              <div className="flex items-center gap-2.5 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100/50 text-slate-600">
                <FileText size={16} className="text-green-500" />
                <span className="text-sm font-bold">{topic.scripts.length} <span className="text-slate-400 font-medium">Scripts</span></span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Audio Section */}
      {topic.audioFiles.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 text-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-primary shadow-lg shadow-primary/30 flex items-center justify-center">
                <Headphones size={20} className="text-white" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Audio practice</h2>
            </div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Part 1</span>
          </div>
          <div className="grid gap-4">
            {topic.audioFiles.map((audio, idx) => (
              <AudioPlayer 
                key={idx} 
                src={audio.path} 
                title={audio.name}
              />
            ))}
          </div>
        </section>
      )}

      {/* Answer Script Section */}
      {topic.hasAnswer && topic.scripts && topic.scripts.length > 0 && (
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-green-500 shadow-lg shadow-green-200 flex items-center justify-center text-white">
                <FileText size={20} />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Refined Answers</h2>
            </div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Part 2</span>
          </div>

          {/* Tab Selector */}
          {topic.scripts.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-slate-100/50 rounded-[1.2rem] border border-slate-200/50 w-fit">
              {topic.scripts.map((script, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveScriptIdx(idx)}
                  className={`px-6 py-2.5 rounded-[0.9rem] text-sm font-bold transition-all duration-300 ${
                    activeScriptIdx === idx 
                      ? 'bg-white text-slate-900 shadow-md transform scale-[1.02]' 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-white/40'
                  }`}
                >
                  {script.name}
                </button>
              ))}
            </div>
          )}

          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-12 relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-500 opacity-50"></div>
            
            <div 
              className="docx-content min-w-full prose prose-slate selection:bg-green-100"
              dangerouslySetInnerHTML={{ __html: topic.scripts[activeScriptIdx].html }}
            />
            
            <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                 Source: {topic.scripts[activeScriptIdx].fileName}
              </div>
              <span className="px-3 py-1 bg-slate-50 rounded-lg">Study Mode Active</span>
            </div>
          </div>
        </section>
      )}

      {/* Floating Back to Top */}
      <button 
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 w-12 h-12 bg-slate-900 text-white rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center hover:scale-110 active:scale-95 z-50 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
      >
        <ChevronUp size={24} />
      </button>
    </div>
  );
};

export default TopicDetail;
