import React, { useState, useEffect } from 'react';
import { Search, X, Briefcase, Sparkles, MapPin, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: string, city?: string) => void;
  onSelectSkill: (skill: string) => void;
  onSelectCity: (city: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectRole,
  onSelectSkill,
  onSelectCity,
}) => {
  const [query, setQuery] = useState('');

  const handleCompoundSearch = () => {
    const raw = query.trim();
    if (!raw) return;

    let role = raw;
    let city = '';
    if (raw.toLowerCase().includes(' in ')) {
      const parts = raw.split(/\s+in\s+/i);
      role = parts[0].trim();
      city = parts[1].trim();
    }
    onSelectRole(role, city);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickRoles = ['Data Analyst', 'Data Scientist', 'Machine Learning Engineer', 'Python Developer', 'Frontend Developer', 'Data Engineer'];
  const quickSkills = ['Python', 'SQL', 'PyTorch', 'Power BI', 'AWS', 'Docker', 'React'];
  const quickCities = ['Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Mumbai', 'Delhi NCR'];

  const filteredRoles = quickRoles.filter(r => r.toLowerCase().includes(query.toLowerCase()));
  const filteredSkills = quickSkills.filter(s => s.toLowerCase().includes(query.toLowerCase()));
  const filteredCities = quickCities.filter(c => c.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg border border-[#E3E7E3] shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleCompoundSearch(); }}
          className="p-3 border-b border-[#E3E7E3] flex items-center space-x-2"
        >
          <Search className="w-4 h-4 text-[#6B756F]" />
          <input
            type="text"
            placeholder="Search e.g. 'Data Analyst in Chennai' or 'Python Developer'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm outline-none text-[#202723] placeholder-[#8E9991]"
            autoFocus
          />
          <button type="button" onClick={onClose} className="p-1 hover:bg-[#F6F7F5] rounded text-[#6B756F]">
            <X className="w-4 h-4" />
          </button>
        </form>

        <div className="p-4 max-h-96 overflow-y-auto space-y-4 text-xs">
          {query.trim().length > 0 && (
            <button
              onClick={handleCompoundSearch}
              className="w-full p-2.5 rounded bg-[#EBF3EF] hover:bg-[#DEECE5] text-[#286B59] font-medium flex items-center justify-between border border-[#CCD4CF] transition text-left"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-[#286B59] shrink-0" />
                <span>Search all records for <strong>"{query.trim()}"</strong></span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#286B59] shrink-0" />
            </button>
          )}
          <div>
            <div className="text-[11px] font-semibold text-[#6B756F] uppercase tracking-wider mb-2 flex items-center">
              <Briefcase className="w-3 h-3 mr-1 text-[#286B59]" /> Standardized Job Roles
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {filteredRoles.map((r) => (
                <button
                  key={r}
                  onClick={() => { onSelectRole(r); onClose(); }}
                  className="flex items-center justify-between p-2 rounded bg-[#F8FAF9] hover:bg-[#EBF3EF] text-[#202723] border border-[#E8ECE9] text-left transition"
                >
                  <span>{r}</span>
                  <ArrowRight className="w-3 h-3 text-[#6B756F]" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-[#6B756F] uppercase tracking-wider mb-2 flex items-center">
              <Sparkles className="w-3 h-3 mr-1 text-[#286B59]" /> Core Technical Skills
            </div>
            <div className="flex flex-wrap gap-1.5">
              {filteredSkills.map((s) => (
                <button
                  key={s}
                  onClick={() => { onSelectSkill(s); onClose(); }}
                  className="px-2.5 py-1 rounded bg-[#F8FAF9] hover:bg-[#EBF3EF] text-[#202723] border border-[#E8ECE9] transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-[#6B756F] uppercase tracking-wider mb-2 flex items-center">
              <MapPin className="w-3 h-3 mr-1 text-[#286B59]" /> Technology Hubs
            </div>
            <div className="flex flex-wrap gap-1.5">
              {filteredCities.map((c) => (
                <button
                  key={c}
                  onClick={() => { onSelectCity(c); onClose(); }}
                  className="px-2.5 py-1 rounded bg-[#F8FAF9] hover:bg-[#EBF3EF] text-[#202723] border border-[#E8ECE9] transition"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-2 bg-[#F6F7F5] border-t border-[#E3E7E3] text-[11px] text-[#6B756F] text-center">
          Tip: Press <kbd className="bg-white px-1 py-0.5 rounded border border-[#CBD5CD]">ESC</kbd> to close search
        </div>
      </div>
    </div>
  );
};
