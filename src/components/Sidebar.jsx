import React, { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, FileText, Headphones, ArrowRight, ChevronDown, ChevronRight, Folder, Search, X } from 'lucide-react';

const Sidebar = ({ topics, isMobileOpen, setIsMobileOpen }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({ 'General': true });

  // Filter topics based on search term
  const filteredTopics = useMemo(() => {
    if (!searchTerm) return topics;
    const term = searchTerm.toLowerCase();
    return topics.filter(t => 
      t.name.toLowerCase().includes(term) || 
      (t.parent && t.parent.toLowerCase().includes(term))
    );
  }, [topics, searchTerm]);

  // Group filtered topics by parent
  const groups = useMemo(() => {
    return filteredTopics.reduce((acc, topic) => {
      const parent = topic.parent || 'General';
      if (!acc[parent]) acc[parent] = [];
      acc[parent].push(topic);
      return acc;
    }, {});
  }, [filteredTopics]);

  // Automatically expand groups that have search results
  useMemo(() => {
    if (searchTerm) {
      const newExpanded = { ...expandedGroups };
      Object.keys(groups).forEach(group => {
        newExpanded[group] = true;
      });
      setExpandedGroups(newExpanded);
    }
  }, [groups, searchTerm]);

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 xl:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed xl:sticky top-0 left-0 z-30 h-screen w-80 bg-white border-r border-slate-200 
        transition-transform duration-300 ease-in-out shrink-0 flex flex-col
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-6 pb-4 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <BookOpen size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">OPic Study</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">
              Learning Library
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative group">
            <Search 
              size={18} 
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${searchTerm ? 'text-primary' : 'text-slate-400 group-focus-within:text-primary'}`} 
            />
            <input 
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Topics List */}
        <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-4">
          {Object.keys(groups).length > 0 ? (
            Object.keys(groups).map((groupName) => (
              <div key={groupName} className="space-y-1">
                {groupName !== 'General' && (
                  <button 
                    onClick={() => toggleGroup(groupName)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-700 transition-colors"
                  >
                    {expandedGroups[groupName] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <Folder size={14} className={expandedGroups[groupName] ? 'text-primary/70' : 'text-slate-300'} />
                    <span className="truncate">{groupName}</span>
                    <span className="ml-auto bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-normal">
                      {groups[groupName].length}
                    </span>
                  </button>
                )}
                
                {(groupName === 'General' || expandedGroups[groupName]) && (
                  <div className="space-y-1 mt-1">
                    {groups[groupName].map((topic) => (
                      <NavLink
                        key={topic.id}
                        to={`/topic/${encodeURIComponent(topic.id)}`}
                        onClick={() => setIsMobileOpen(false)}
                        className={({ isActive }) => `
                          flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                          ${isActive 
                            ? 'bg-primary text-white shadow-lg shadow-primary/25 font-medium' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                          }
                        `}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-sm leading-tight">{topic.name}</div>
                          <div className={`flex items-center gap-2 mt-1 text-[9px] uppercase font-bold tracking-wider opacity-60`}>
                            {topic.audioFiles.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Headphones size={8} /> {topic.audioFiles.length}
                              </span>
                            )}
                            {topic.hasAnswer && (
                              <span className="flex items-center gap-1">
                                <FileText size={8} /> {topic.scripts.length}
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight 
                          size={14} 
                          className={`opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 ${isActive ? 'text-white' : 'text-primary'}`} 
                        />
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-slate-400 text-sm">No topics found for "{searchTerm}"</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
           <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Storage</span>
              <span className="text-[10px] font-bold text-slate-600">~220 MB Used</span>
           </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
