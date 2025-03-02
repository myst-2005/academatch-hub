
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar = ({ onSearch, placeholder = "Search..." }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center w-full">
        <div className="absolute left-3 text-gray-400">
          <Search size={20} />
        </div>
        
        <input
          type="text"
          className="pl-10 pr-20 py-3 w-full bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-haca-500/30 focus:border-haca-500 transition-all"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        
        <Button 
          type="submit"
          className="absolute right-2 bg-haca-500 hover:bg-haca-600 text-white px-4 py-1 h-auto rounded-lg transition-all"
          disabled={!query.trim()}
        >
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
