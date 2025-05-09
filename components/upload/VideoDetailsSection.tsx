"use client";

import React, { useState } from 'react';
import { CollapsibleSection } from '@/components/shared/CollapsibleSection';

// Reusable TagInput component (extracted for clarity)
interface TagInputProps {
  placeholder: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

const TagInput: React.FC<TagInputProps> = ({ placeholder, tags, onTagsChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault();
      const newTags = [...tags, inputValue.trim()];
      onTagsChange(newTags);
      setInputValue('');
    }
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    onTagsChange(newTags);
  };

  return (
    <div className="tag-input-container flex flex-wrap gap-2 p-2 min-h-[48px] rounded bg-slate-800 border border-slate-700 focus-within:ring-2 focus-within:ring-primary/50">
      {tags.map((tag, index) => (
        <div key={index} className="tag flex items-center px-2.5 py-1 bg-primary/10 text-primary rounded-full text-sm">
          <span>{tag}</span>
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="ml-1.5 text-primary/70 hover:text-primary"
          >
            <i className="ri-close-line text-xs"></i>
          </button>
        </div>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="tag-input flex-1 min-w-[80px] bg-transparent border-none text-slate-300 text-sm focus:outline-none p-1"
      />
    </div>
  );
};

// Main component for the Video Details section
export const VideoDetailsSection = () => {
  // TODO: Connect these states to a central form state/context later
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState('');

  return (
    <CollapsibleSection title="Manual Video Details" optional={true}>
       <div className="mb-4 p-4 bg-slate-800/50 rounded flex items-start">
        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-primary/20 text-primary rounded-full mr-3 mt-0.5">
          <i className="ri-information-line"></i>
        </div>
        <p className="text-sm text-slate-400">
          These fields will be automatically populated by AI after video processing.
          Only modify if you want to override the AI-generated content.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div>
          <div className="mb-4">
            <label htmlFor="videoTitle" className="block text-sm font-medium text-slate-300 mb-2">Title Override</label>
            <input
              type="text"
              id="videoTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="AI will generate a title"
              className="w-full bg-slate-800 text-sm text-slate-300 px-4 py-3 rounded border border-slate-700 focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Tags / Keywords Override</label>
             <TagInput
              placeholder="AI will generate tags (press Enter)"
              tags={tags}
              onTagsChange={setTags}
            />
          </div>
          <div> {/* Removed mb-4 from last item */}
            <label htmlFor="videoCategory" className="block text-sm font-medium text-slate-300 mb-2">Category Override</label>
            <div className="relative">
              <select
                id="videoCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none bg-slate-800 text-sm text-slate-300 px-4 py-3 rounded border border-slate-700 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 pr-8"
              >
                <option value="">AI will select category</option>
                <option value="education">Education</option>
                <option value="entertainment">Entertainment</option>
                <option value="howto">How-to & Style</option>
                <option value="tech">Science & Technology</option>
                <option value="travel">Travel & Events</option>
                {/* Add more categories as needed */}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                <i className="ri-arrow-down-s-line"></i>
              </div>
            </div>
          </div>
        </div>
        {/* Right Column */}
        <div>
          <div className="mb-4">
            <label htmlFor="videoDescription" className="block text-sm font-medium text-slate-300 mb-2">Description Override</label>
            <textarea
              id="videoDescription"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="AI will generate a description"
              className="w-full bg-slate-800 text-sm text-slate-300 px-4 py-3 rounded border border-slate-700 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 resize-none"
            ></textarea>
          </div>
          <div> {/* Removed mb-4 from last item */}
            <label htmlFor="videoLanguage" className="block text-sm font-medium text-slate-300 mb-2">Language Override</label>
            <div className="relative">
              <select
                id="videoLanguage"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full appearance-none bg-slate-800 text-sm text-slate-300 px-4 py-3 rounded border border-slate-700 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 pr-8"
              >
                <option value="">AI will detect language</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                {/* Add more languages as needed */}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                <i className="ri-arrow-down-s-line"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}; 