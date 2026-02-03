import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Camera, Edit3, Eye, EyeOff, Plus, Star, Award, MapPin, Phone, Mail, Globe, Instagram, Twitter, Linkedin, Save, Upload, X, Mic, Clock, Play, BookOpen, Trash2, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePortfolioViewTracking } from '../hooks/usePortfolioViewTracking';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { uploadToB2 } from '../lib/b2Upload';
import AddSkillModal from '../components/AddSkillModal';
import EditContentModal from '../components/EditContentModal';
import ContentCountdownTimer from '../components/ContentCountdownTimer';

export default function Portfolio() {
  const { user } = useAuth();
  const { trackView } = usePortfolioViewTracking();
  const portfolioData = usePortfolioData(user?.id);

  const [isEditing, setIsEditing] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const [profilePhotoError, setProfilePhotoError] = useState<string | null>(null);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [savingContentId, setSavingContentId] = useState<string | null>(null);
  const [deletingContentId, setDeletingContentId] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editable fields for profile
  const [profileEdits, setProfileEdits] = useState({
    bio: '',
    location: '',
    phone: '',
    website: '',
  });

  // Initialize profile edits when data loads
  useEffect(() => {
    if (portfolioData.profile) {
      setProfileEdits({
        bio: portfolioData.profile.bio || '',
        location: portfolioData.profile.location || '',
        phone: portfolioData.profile.phone || '',
        website: portfolioData.profile.website || '',
      });
    }
  }, [portfolioData.profile]);

  // Track portfolio view on mount
  useEffect(() => {
    if (user?.id) {
      trackView();
    }
  }, [user?.id, trackView]);

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) {
      setProfilePhotoError('Please select a valid file');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setProfilePhotoError('Please upload a valid image (JPEG, PNG, GIF, or WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfilePhotoError('File size must be less than 5MB');
      return;
    }

    setUploadingProfilePhoto(true);
    setProfilePhotoError(null);

    try {
      const { publicUrl, error } = await uploadToB2(file, 'portfolio_profile_photos');

      if (error) {
        setProfilePhotoError(error);
        setUploadingProfilePhoto(false);
        return;
      }

      const result = await portfolioData.updateProfile({ avatar_url: publicUrl });
      if (result.error) {
        setProfilePhotoError(result.error);
      } else {
        setProfilePhotoError(null);
      }
    } catch (err) {
      setProfilePhotoError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setUploadingProfilePhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfileChanges = async () => {
    setIsSaving(true);
    const result = await portfolioData.updateProfile(profileEdits);
    if (result.error) {
      setEditError(result.error);
    } else {
      setEditError(undefined);
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleDeleteSkill = async (skillId: string) => {
    const result = await portfolioData.deleteSkill(skillId);
    if (result.error) {
      setEditError(result.error);
    }
  };

  const handleDeleteCertification = async (certId: string) => {
    const result = await portfolioData.deleteCertification(certId);
    if (result.error) {
      setEditError(result.error);
    }
  };

  const handleDeleteAward = async (awardId: string) => {
    const result = await portfolioData.deleteAward(awardId);
    if (result.error) {
      setEditError(result.error);
    }
  };

  const handleDeleteInterview = async (interviewId: string) => {
    const result = await portfolioData.deleteInterview(interviewId);
    if (result.error) {
      setEditError(result.error);
    }
  };

  const handleDeleteExperience = async (expId: string) => {
    const result = await portfolioData.deleteExperience(expId);
    if (result.error) {
      setEditError(result.error);
    }
  };

  const handleDeleteTestimonial = async (testId: string) => {
    const result = await portfolioData.deleteTestimonial(testId);
    if (result.error) {
      setEditError(result.error);
    }
  };

  const handleSendToMedia = (content: any) => {
    setSelectedContent(content);
    setShowMediaModal(true);
  };

  const confirmSendToMedia = () => {
    alert('Content sent for admin review. You will be notified once it\'s approved!');
    setShowMediaModal(false);
    setSelectedContent(null);
  };

  const handleDeleteContent = async (contentId: string) => {
    setDeletingContentId(contentId);
    const result = await portfolioData.deletePortfolioContent(contentId);
    if (result.error) {
      setEditError(result.error);
    }
    setDeletingContentId(null);
  };

  const handleEditContent = (content: any) => {
    setEditingContent(content);
    setEditError(undefined);
  };

  const handleSaveContent = async (payload: any) => {
    if (!editingContent) return;
    setIsSaving(true);
    setEditError(undefined);

    const result = await portfolioData.updatePortfolioContent(editingContent.id, payload);
    if (result.error) {
      setEditError(result.error);
    } else {
      setEditingContent(null);
    }
    setIsSaving(false);
  };

  if (portfolioData.loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-rose-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-playfair font-bold text-white mb-2">Portfolio</h1>
            <p className="text-gray-300">Professional record of your work</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-gray-300">Public</span>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPublic ? 'bg-rose-500' : 'bg-gray-600'
                }`}
                disabled={user?.tier === 'free'}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              {user?.tier === 'free' && (
                <span className="text-yellow-400 text-sm">Premium required</span>
              )}
            </div>

            <button
              onClick={() => {
                if (isEditing) {
                  handleSaveProfileChanges();
                } else {
                  setIsEditing(true);
                }
              }}
              disabled={isSaving}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 flex items-center gap-2 ${
                isEditing
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gradient-to-r from-rose-500 to-purple-600 hover:shadow-xl text-white'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  Edit Portfolio
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {editError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300">{editError}</p>
          </div>
        )}

        {/* Cover Image */}
        <div className="relative mb-8">
          <div className="h-64 bg-gradient-to-r from-rose-400 via-purple-500 to-pink-500 rounded-2xl overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="opacity-75">Portfolio cover image</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="space-y-6">
            {/* Profile Image & Basic Info */}
            <div className="glass-effect p-6 rounded-2xl">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-rose-400 to-purple-500 p-1">
                    <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                      {portfolioData.profile?.avatar_url ? (
                        <img src={portfolioData.profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingProfilePhoto}
                      className="absolute bottom-0 right-0 p-2 bg-rose-500 rounded-full text-white hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {uploadingProfilePhoto ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoUpload}
                    className="hidden"
                  />
                </div>
                {profilePhotoError && (
                  <div className="mt-3 flex items-start gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-300">{profilePhotoError}</p>
                  </div>
                )}

                <h2 className="text-2xl font-bold text-white mt-4">{user?.name}</h2>
                <div className="flex items-center justify-center space-x-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-gray-300 ml-2">
                    {portfolioData.stats?.average_rating ? `${portfolioData.stats.average_rating}` : '4.9'} (
                    {portfolioData.stats?.testimonials_count || 0} reviews)
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-300">
                  <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileEdits.location}
                      onChange={(e) => setProfileEdits({ ...profileEdits, location: e.target.value })}
                      className="bg-transparent border-b border-gray-600 focus:border-rose-400 outline-none flex-1 text-white"
                      placeholder="Your location"
                    />
                  ) : (
                    <span>{profileEdits.location || 'Location not set'}</span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-gray-300">
                  <Phone className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileEdits.phone}
                      onChange={(e) => setProfileEdits({ ...profileEdits, phone: e.target.value })}
                      className="bg-transparent border-b border-gray-600 focus:border-rose-400 outline-none flex-1 text-white"
                      placeholder="Your phone"
                    />
                  ) : (
                    <span>{profileEdits.phone || 'Phone not set'}</span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-gray-300">
                  <Mail className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{user?.email}</span>
                </div>

                <div className="flex items-center space-x-3 text-gray-300">
                  <Globe className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileEdits.website}
                      onChange={(e) => setProfileEdits({ ...profileEdits, website: e.target.value })}
                      className="bg-transparent border-b border-gray-600 focus:border-rose-400 outline-none flex-1 text-white"
                      placeholder="Your website"
                    />
                  ) : (
                    <span>{profileEdits.website || 'Website not set'}</span>
                  )}
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-white font-semibold mb-3">Social Media</h3>
                <div className="flex space-x-3">
                  <Instagram className="w-5 h-5 text-pink-400 hover:text-pink-300 cursor-pointer" />
                  <Twitter className="w-5 h-5 text-blue-400 hover:text-blue-300 cursor-pointer" />
                  <Linkedin className="w-5 h-5 text-blue-600 hover:text-blue-500 cursor-pointer" />
                </div>
              </div>
            </div>

            {/* Awards & Recognitions */}
            {portfolioData.awards.length > 0 && (
              <div className="glass-effect p-6 rounded-2xl">
                <h3 className="text-xl font-semibold text-white mb-4">Awards & Recognitions</h3>
                <div className="space-y-3">
                  {portfolioData.awards.map((award) => (
                    <div key={award.id} className="flex items-start justify-between group">
                      <div className="flex items-start space-x-3 flex-1">
                        <Award className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="text-white font-medium">{award.name}</div>
                          <div className="text-gray-400 text-sm">
                            {award.issuer} • {award.year}
                          </div>
                        </div>
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => handleDeleteAward(award.id!)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interviews & Features */}
            {portfolioData.interviews.length > 0 && (
              <div className="glass-effect p-6 rounded-2xl">
                <h3 className="text-xl font-semibold text-white mb-4">Interviews & Features</h3>
                <div className="space-y-3">
                  {portfolioData.interviews.map((interview) => (
                    <div key={interview.id} className="flex items-start justify-between group">
                      <div className="flex items-start space-x-3 flex-1">
                        <Mic className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="text-white font-medium">{interview.title}</div>
                          <div className="text-gray-400 text-sm">
                            {interview.platform} •{' '}
                            {new Date(interview.interview_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => handleDeleteInterview(interview.id!)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            <div className="glass-effect p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Skills</h3>
                {isEditing && (
                  <button
                    onClick={() => setShowAddSkillModal(true)}
                    className="p-1 text-rose-400 hover:text-rose-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {portfolioData.skills.map((skill) => (
                  <div key={skill.id} className="relative group">
                    <span className="px-3 py-1 bg-gradient-to-r from-rose-400/20 to-purple-500/20 text-rose-300 rounded-full text-sm border border-rose-400/30">
                      {skill.skill_name}
                    </span>
                    {isEditing && (
                      <button
                        onClick={() => handleDeleteSkill(skill.id!)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-2 h-2 text-white" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            {portfolioData.certifications.length > 0 && (
              <div className="glass-effect p-6 rounded-2xl">
                <h3 className="text-xl font-semibold text-white mb-4">Certifications</h3>
                <div className="space-y-3">
                  {portfolioData.certifications.map((cert) => (
                    <div key={cert.id} className="flex items-start justify-between group">
                      <div className="flex items-start space-x-3 flex-1">
                        <Award className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="text-white font-medium">{cert.name}</div>
                          <div className="text-gray-400 text-sm">
                            {cert.issuer} • {cert.year}
                          </div>
                        </div>
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => handleDeleteCertification(cert.id!)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Portfolio Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="glass-effect p-6 rounded-2xl">
              <h3 className="text-xl font-semibold text-white mb-4">About Me</h3>
              {isEditing ? (
                <textarea
                  value={profileEdits.bio}
                  onChange={(e) => setProfileEdits({ ...profileEdits, bio: e.target.value })}
                  className="w-full h-24 bg-transparent border border-gray-600 rounded-lg p-3 text-white resize-none focus:border-rose-400 outline-none"
                  placeholder="Tell your story..."
                />
              ) : (
                <p className="text-gray-300 leading-relaxed">
                  {profileEdits.bio || 'No bio added yet.'}
                </p>
              )}
            </div>

            {/* Highlights */}
            <div className="glass-effect p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Highlights</h3>
                {isEditing && (
                  <button className="px-4 py-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Work
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div key="sample-1" className="group relative">
                  <div className="aspect-video bg-gray-800 rounded-xl overflow-hidden">
                    <img
                      src="https://images.pexels.com/photos/5257578/pexels-photo-5257578.jpeg?auto=compress&cs=tinysrgb&w=400"
                      alt="Brand Campaign 2025"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handleSendToMedia({ title: 'Brand Campaign 2025' })}
                        className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                      >
                        Send to Media
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h4 className="text-white font-medium">Brand Campaign 2025</h4>
                    <p className="text-gray-400 text-sm">Complete brand identity redesign for tech startup</p>
                  </div>
                </div>

                <div key="sample-2" className="group relative">
                  <div className="aspect-video bg-gray-800 rounded-xl overflow-hidden">
                    <img
                      src="https://images.pexels.com/photos/8000646/pexels-photo-8000646.jpeg?auto=compress&cs=tinysrgb&w=400"
                      alt="Product Launch Video"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handleSendToMedia({ title: 'Product Launch Video' })}
                        className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                      >
                        Send to Media
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h4 className="text-white font-medium">Product Launch Video</h4>
                    <p className="text-gray-400 text-sm">Creative direction for product launch campaign</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Experience */}
            {portfolioData.experience.length > 0 && (
              <div className="glass-effect p-6 rounded-2xl">
                <h3 className="text-xl font-semibold text-white mb-4">Experience</h3>
                <div className="space-y-4">
                  {portfolioData.experience.map((exp) => (
                    <div key={exp.id} className="border-l-2 border-rose-400 pl-4 group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{exp.title}</h4>
                          <div className="text-rose-400 text-sm">
                            {exp.company} • {exp.start_date} {exp.end_date ? `to ${exp.end_date}` : '(Current)'}
                          </div>
                          {exp.description && (
                            <p className="text-gray-300 text-sm mt-2">{exp.description}</p>
                          )}
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => handleDeleteExperience(exp.id!)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Testimonials */}
            {portfolioData.testimonials.length > 0 && (
              <div className="glass-effect p-6 rounded-2xl">
                <h3 className="text-xl font-semibold text-white mb-4">Client Testimonials</h3>
                <div className="space-y-4">
                  {portfolioData.testimonials.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className="bg-white/5 p-4 rounded-lg border border-white/10 group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => handleDeleteTestimonial(testimonial.id!)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-300 italic mb-2">"{testimonial.comment}"</p>
                      <div className="text-sm">
                        <span className="text-white font-medium">{testimonial.client_name}</span>
                        <span className="text-gray-400"> - {testimonial.client_company}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Content */}
            <div className="glass-effect p-6 rounded-2xl">
              <h3 className="text-xl font-semibold text-white mb-6">Portfolio Content</h3>

              {portfolioData.portfolioContent.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {portfolioData.portfolioContent.map((item) => (
                    <div key={item.id} className="group relative">
                      <div className="aspect-video bg-gray-800 rounded-xl overflow-hidden relative">
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEditContent(item)}
                            className="p-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteContent(item.id!)}
                            disabled={deletingContentId === item.id}
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all disabled:opacity-50"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3">
                        <h4 className="text-white font-medium">{item.title}</h4>
                        <p className="text-gray-400 text-sm">{item.creator}</p>
                        {item.description && (
                          <p className="text-gray-400 text-sm mt-1 line-clamp-2">{item.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                          {item.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{item.duration}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{(item.views_count || 0).toLocaleString()} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">
                    No portfolio content yet. Upload content from the Content page and publish to Portfolio
                    to display it here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        <AddSkillModal
          isOpen={showAddSkillModal}
          onClose={() => setShowAddSkillModal(false)}
          onAdd={portfolioData.addSkill}
        />

        {editingContent && (
          <EditContentModal
            isOpen={!!editingContent}
            title={editingContent.title}
            description={editingContent.description}
            category={editingContent.category}
            isPremium={editingContent.is_premium}
            publishedTo={(editingContent.published_to || []) as string[]}
            status={editingContent.status}
            onSave={handleSaveContent}
            onDelete={() => handleDeleteContent(editingContent.id)}
            onClose={() => setEditingContent(null)}
            isSaving={isSaving}
            isDeleting={isDeleting}
            error={editError}
          />
        )}

        {/* Send to Media Modal */}
        {showMediaModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-effect p-6 rounded-2xl max-w-md w-full">
              <h3 className="text-xl font-semibold text-white mb-4">Send to Media</h3>
              <p className="text-gray-300 mb-4">
                Send "{selectedContent?.title}" to the Media section for admin review?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={confirmSendToMedia}
                  className="flex-1 py-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Send for Review
                </button>
                <button
                  onClick={() => setShowMediaModal(false)}
                  className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
