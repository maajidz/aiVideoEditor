'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function ProfileSettingsPage() {
  const [name, setName] = useState('James Wilson');
  const [email, setEmail] = useState('james@example.com');
  const [bio, setBio] = useState('Content creator specializing in tech and travel videos.');
  const [website, setWebsite] = useState('https://jameswilson.com');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');

    try {
      // This would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-950">
        <Header />
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-white mb-4">Profile Settings</h1>
          
          {successMessage && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}
          
          <div className="bg-slate-900 rounded-lg p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Photo */}
              <div className="w-full md:w-1/3">
                <h2 className="text-lg font-medium text-white mb-4">Profile Photo</h2>
                <div className="bg-slate-800 p-6 rounded-lg flex flex-col items-center">
                  <div className="w-32 h-32 bg-slate-700 rounded-full overflow-hidden mb-4">
                    <div className="w-full h-full flex items-center justify-center text-4xl font-medium text-white">
                      J
                    </div>
                  </div>
                  <div className="space-y-3 w-full">
                    <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm">
                      Upload New Photo
                    </button>
                    <button className="w-full py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded text-sm">
                      Remove Photo
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Profile Information */}
              <div className="w-full md:w-2/3">
                <h2 className="text-lg font-medium text-white mb-4">Profile Information</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-slate-300 mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-slate-300 mb-1">
                      Website
                    </label>
                    <input
                      id="website"
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-md flex items-center"
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 