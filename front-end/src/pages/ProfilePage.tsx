// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, MessageCircle, Quote,
  Edit, Settings, LogOut, Camera, ArrowLeft, AlertCircle, Trash2,
  Instagram, Send, Twitter, Linkedin, MessageCircleMore
} from 'lucide-react';
import { profileService } from '../services/profileService';
import { API_BASE_URL } from '@/lib/config';

interface UserProfile {
  firstName: string;
  dateOfBirth: Date | null;
  gender: string;
  showGender: boolean;
  interestedIn: string[];
  distance: number;
  strictDistance: boolean;
  drinking: string;
  smoking: string;
  workout: string;
  pets: string;
  communicationStyle: string[];
  responsePace: string;
  interests: string[];
  location: string;
  useCurrentLocation: boolean;
  photos: string[];
  bio: string;
  conversationStarter: string;
  socialAccounts?: {
    instagram: string;
    whatsapp: string;
    snapchat: string;
    twitter: string;
    linkedin: string;
  };
}

const calculateAge = (dateOfBirth: Date | null): number | null => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'photos' | 'preferences' | 'social'>('about');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    console.log("=== FETCHING PROFILE ===");
    console.log("Access Token:", localStorage.getItem('access_token') ? 'Present' : 'Missing');
    
    try {
      setLoading(true);
      setError(null);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = await profileService.getProfile();
      console.log("Profile Service Result:", result);
      
      if (!result.exists) {
        console.log("Profile does not exist, redirecting to onboarding");
        navigate('/onboarding');
        return;
      }
      
      if (!result.data) {
        console.log("Profile exists but data is null");
        setError("Profile data is missing");
        return;
      }
      
      console.log("✅ Profile data loaded successfully");
      setProfile(result.data);
    } catch (err: any) {
      console.error('=== PROFILE FETCH ERROR ===', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    console.log("🚪 Logging out from ProfilePage...");
    
    // Clear all auth data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Force a hard navigation to root (this will cause App.tsx to re-check auth)
    window.location.href = '/';
  };

  const handleEditProfile = () => {
    console.log("Navigating to edit profile...");
    navigate('/onboarding');
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/account/delete/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete account');

      localStorage.clear();
      window.location.href = '/';
    } catch (err) {
      console.error('Failed to delete account', err);
      setDeleting(false);
      setError('Failed to delete your account. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-xl font-bold">Error Loading Profile</h2>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchProfile}
              className="w-full bg-teal-500 text-white py-3 rounded-xl font-semibold hover:bg-teal-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/onboarding')}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Complete Onboarding
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Profile not found</p>
          <button
            onClick={() => navigate('/onboarding')}
            className="bg-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-600 transition-colors"
          >
            Complete Profile Setup
          </button>
        </div>
      </div>
    );
  }

  const age = calculateAge(profile.dateOfBirth);
  const firstInitial = profile.firstName.charAt(0).toUpperCase();

  const getLifestyleEmoji = (category: string, value: string) => {
    const map: Record<string, Record<string, string>> = {
      drinking: { "Never": "🚫", "Socially": "🍷", "Regularly": "🍻" },
      smoking: { "Never": "🚭", "Sometimes": "💨", "Regularly": "🚬" },
      workout: { "Never": "🛋️", "Sometimes": "🚶", "Often": "💪", "Daily": "✨" },
      pets: { "Own pets": "🐾", "Love pets": "❤️", "Allergic": "🤧", "None": "🚫" }
    };
    return map[category]?.[value] || "✨";
  };

  const lifestyleTags = [
    { label: profile.drinking, emoji: getLifestyleEmoji('drinking', profile.drinking), visible: !!profile.drinking },
    { label: profile.smoking, emoji: getLifestyleEmoji('smoking', profile.smoking), visible: !!profile.smoking },
    { label: profile.workout, emoji: getLifestyleEmoji('workout', profile.workout), visible: !!profile.workout },
    { label: profile.pets, emoji: getLifestyleEmoji('pets', profile.pets), visible: !!profile.pets },
  ].filter(item => item.visible);

  // Check if any social accounts are filled
  const hasSocialAccounts = profile.socialAccounts && (
    profile.socialAccounts.instagram ||
    profile.socialAccounts.whatsapp ||
    profile.socialAccounts.snapchat ||
    profile.socialAccounts.twitter ||
    profile.socialAccounts.linkedin
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/home')}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">My Profile</h1>
          <button 
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-br from-teal-400 to-teal-600"></div>

          {/* Profile Content */}
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              {profile.photos.length > 0 ? (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                  <img 
                    src={profile.photos[0]} 
                    alt={profile.firstName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-teal-500 flex items-center justify-center text-5xl font-bold text-white">
                  {firstInitial}
                </div>
              )}
              <button 
                onClick={handleEditProfile}
                className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <Camera className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Name & Edit Button */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {profile.firstName}{age && `, ${age}`}
                </h2>
                {profile.showGender && profile.gender && (
                  <p className="text-gray-500 font-medium mt-1">{profile.gender}</p>
                )}
              </div>
              <button 
                onClick={handleEditProfile}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mb-6 bg-gray-50 p-5 rounded-2xl border border-gray-100 relative">
                <Quote className="absolute top-3 left-3 w-4 h-4 text-gray-300 transform scale-x-[-1]" />
                <p className="text-gray-700 leading-relaxed text-center px-4">
                  {profile.bio}
                </p>
                <Quote className="absolute bottom-3 right-3 w-4 h-4 text-gray-300" />
              </div>
            )}

            {/* Conversation Starter */}
            {profile.conversationStarter && (
              <div className="mb-6">
                <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                  <h3 className="flex items-center gap-2 text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">
                    <MessageCircle className="w-4 h-4" />
                    Conversation Starter
                  </h3>
                  <p className="text-teal-900 font-semibold leading-snug">
                    "{profile.conversationStarter}"
                  </p>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <MapPin className="w-5 h-5 text-teal-500" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Location</p>
                  <p className="text-sm font-bold text-gray-900">
                    {profile.location || 'Not set'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <MapPin className="w-5 h-5 text-teal-500" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Max Distance</p>
                  <p className="text-sm font-bold text-gray-900">
                    {profile.distance} km
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-100 overflow-x-auto">
              {['about', 'photos', hasSocialAccounts && 'social', 'preferences'].filter(Boolean).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 font-semibold text-sm capitalize transition-colors relative whitespace-nowrap ${
                    activeTab === tab ? 'text-teal-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                {lifestyleTags.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Lifestyle
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {lifestyleTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 text-gray-700 text-sm font-semibold border border-gray-100"
                        >
                          <span>{tag.emoji}</span>
                          <span>{tag.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.interests.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest) => (
                        <span
                          key={interest}
                          className="px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-bold"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.communicationStyle.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Communication
                    </h3>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {profile.communicationStyle.map((style) => (
                          <span
                            key={style}
                            className="px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold"
                          >
                            {style}
                          </span>
                        ))}
                      </div>
                      {profile.responsePace && (
                        <p className="text-sm text-gray-600">
                          Response pace: <span className="font-semibold">{profile.responsePace}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="grid grid-cols-2 gap-4">
                {profile.photos.map((photo, idx) => (
                  <div key={idx} className="aspect-square rounded-2xl overflow-hidden bg-gray-100 relative">
                    <img 
                      src={photo} 
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {idx === 0 && (
                      <div className="absolute top-2 left-2 bg-teal-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        Main
                      </div>
                    )}
                  </div>
                ))}
                {profile.photos.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-gray-500">
                    No photos yet
                  </div>
                )}
              </div>
            )}

            {activeTab === 'social' && hasSocialAccounts && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Note:</span> These social accounts will only be visible to people you match with.
                  </p>
                </div>

                {profile.socialAccounts?.instagram && (
                  <a
                    href={`https://instagram.com/${profile.socialAccounts.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-pink-100 rounded-xl hover:shadow-md transition-shadow"
                  >
                    <Instagram className="w-6 h-6 text-pink-500" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">Instagram</p>
                      <p className="font-semibold text-gray-900">@{profile.socialAccounts.instagram}</p>
                    </div>
                  </a>
                )}

                {profile.socialAccounts?.whatsapp && (
                  <a
                    href={`https://wa.me/${profile.socialAccounts.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-green-50 border border-green-100 rounded-xl hover:shadow-md transition-shadow"
                  >
                    <MessageCircleMore className="w-6 h-6 text-green-500" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">WhatsApp</p>
                      <p className="font-semibold text-gray-900">{profile.socialAccounts.whatsapp}</p>
                    </div>
                  </a>
                )}

                {profile.socialAccounts?.snapchat && (
                  <a
                    href={`https://snapchat.com/add/${profile.socialAccounts.snapchat}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-100 rounded-xl hover:shadow-md transition-shadow"
                  >
                    <Send className="w-6 h-6 text-yellow-500" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">Snapchat</p>
                      <p className="font-semibold text-gray-900">{profile.socialAccounts.snapchat}</p>
                    </div>
                  </a>
                )}

                {profile.socialAccounts?.twitter && (
                  <a
                    href={`https://twitter.com/${profile.socialAccounts.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl hover:shadow-md transition-shadow"
                  >
                    <Twitter className="w-6 h-6 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">Twitter / X</p>
                      <p className="font-semibold text-gray-900">@{profile.socialAccounts.twitter}</p>
                    </div>
                  </a>
                )}

                {profile.socialAccounts?.linkedin && (
                  <a
                    href={profile.socialAccounts.linkedin.startsWith('http') 
                      ? profile.socialAccounts.linkedin 
                      : `https://linkedin.com/in/${profile.socialAccounts.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:shadow-md transition-shadow"
                  >
                    <Linkedin className="w-6 h-6 text-blue-700" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">LinkedIn</p>
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {profile.socialAccounts.linkedin}
                      </p>
                    </div>
                  </a>
                )}
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-2">Distance</h4>
                  <p className="text-sm text-gray-600">
                    Max: <span className="font-bold">{profile.distance} km</span>
                    {profile.strictDistance && (
                      <span className="ml-2 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                        Strict
                      </span>
                    )}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-2">Interested In</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.interestedIn.map((item) => (
                      <span key={item} className="px-3 py-1 rounded-full bg-white border text-sm font-medium">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/settings')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border rounded-xl font-semibold hover:bg-gray-50"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border rounded-xl font-semibold text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 border border-red-100 rounded-2xl p-5 bg-red-50/50">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Delete my account
            </button>
          ) : (
            <div>
              <p className="text-sm font-semibold text-red-800 mb-1">
                This permanently deletes your account, profile, matches, chats, and bookings.
              </p>
              <p className="text-xs text-red-600 mb-4">This cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Yes, delete everything'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-5 py-2.5 bg-white border rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;