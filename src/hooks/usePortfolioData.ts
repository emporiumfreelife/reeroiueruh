import { useState, useCallback, useEffect } from 'react';
import * as portfolioService from '../lib/portfolioService';
import type {
  PortfolioProfile,
  PortfolioCertification,
  PortfolioAward,
  PortfolioInterview,
  PortfolioExperience,
  PortfolioTestimonial,
  PortfolioSkill,
  PortfolioContent,
} from '../lib/portfolioService';

interface PortfolioState {
  profile: PortfolioProfile | null;
  certifications: PortfolioCertification[];
  awards: PortfolioAward[];
  interviews: PortfolioInterview[];
  experience: PortfolioExperience[];
  testimonials: PortfolioTestimonial[];
  skills: PortfolioSkill[];
  portfolioContent: PortfolioContent[];
  stats: any | null;
  loading: boolean;
  error: string | null;
}

export function usePortfolioData(userId: string | undefined) {
  const [state, setState] = useState<PortfolioState>({
    profile: null,
    certifications: [],
    awards: [],
    interviews: [],
    experience: [],
    testimonials: [],
    skills: [],
    portfolioContent: [],
    stats: null,
    loading: true,
    error: null,
  });

  // Fetch all portfolio data
  const fetchAllData = useCallback(async () => {
    if (!userId) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [
        profileResult,
        certificationsResult,
        awardsResult,
        interviewsResult,
        experienceResult,
        testimonialsResult,
        skillsResult,
        contentResult,
        statsResult,
      ] = await Promise.all([
        portfolioService.getPortfolioProfile(userId),
        portfolioService.getCertifications(userId),
        portfolioService.getAwards(userId),
        portfolioService.getInterviews(userId),
        portfolioService.getExperience(userId),
        portfolioService.getTestimonials(userId),
        portfolioService.getSkills(userId),
        portfolioService.getPortfolioContent(userId),
        portfolioService.getPortfolioStats(userId),
      ]);

      if (
        profileResult.error ||
        certificationsResult.error ||
        awardsResult.error ||
        interviewsResult.error ||
        experienceResult.error ||
        testimonialsResult.error ||
        skillsResult.error ||
        contentResult.error
      ) {
        throw new Error('Failed to fetch portfolio data');
      }

      setState({
        profile: profileResult.data,
        certifications: certificationsResult.data,
        awards: awardsResult.data,
        interviews: interviewsResult.data,
        experience: experienceResult.data,
        testimonials: testimonialsResult.data,
        skills: skillsResult.data,
        portfolioContent: contentResult.data,
        stats: statsResult.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load portfolio data',
      }));
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Profile operations
  const updateProfile = useCallback(
    async (updates: Partial<PortfolioProfile>) => {
      if (!userId) return { error: 'No user ID' };

      const result = await portfolioService.updatePortfolioProfile(userId, updates);
      if (!result.error) {
        setState((prev) => ({
          ...prev,
          profile: { ...prev.profile, ...result.data } as PortfolioProfile,
        }));
      }
      return result;
    },
    [userId]
  );

  // Certifications operations
  const addCertification = useCallback(
    async (certification: PortfolioCertification) => {
      if (!userId) return { data: null, error: 'No user ID' };

      const result = await portfolioService.addCertification(userId, certification);
      if (!result.error) {
        setState((prev) => ({
          ...prev,
          certifications: [result.data, ...prev.certifications],
        }));
      }
      return result;
    },
    [userId]
  );

  const updateCertification = useCallback(
    async (id: string, updates: Partial<PortfolioCertification>) => {
      const result = await portfolioService.updateCertification(id, updates);
      if (!result.error) {
        setState((prev) => ({
          ...prev,
          certifications: prev.certifications.map((c) =>
            c.id === id ? { ...c, ...result.data } : c
          ),
        }));
      }
      return result;
    },
    []
  );

  const deleteCertification = useCallback(async (id: string) => {
    const result = await portfolioService.deleteCertification(id);
    if (!result.error) {
      setState((prev) => ({
        ...prev,
        certifications: prev.certifications.filter((c) => c.id !== id),
      }));
    }
    return result;
  }, []);

  // Awards operations
  const addAward = useCallback(
    async (award: PortfolioAward) => {
      if (!userId) return { data: null, error: 'No user ID' };

      const result = await portfolioService.addAward(userId, award);
      if (!result.error) {
        setState((prev) => ({
          ...prev,
          awards: [result.data, ...prev.awards],
        }));
      }
      return result;
    },
    [userId]
  );

  const updateAward = useCallback(async (id: string, updates: Partial<PortfolioAward>) => {
    const result = await portfolioService.updateAward(id, updates);
    if (!result.error) {
      setState((prev) => ({
        ...prev,
        awards: prev.awards.map((a) => (a.id === id ? { ...a, ...result.data } : a)),
      }));
    }
    return result;
  }, []);

  const deleteAward = useCallback(async (id: string) => {
    const result = await portfolioService.deleteAward(id);
    if (!result.error) {
      setState((prev) => ({
        ...prev,
        awards: prev.awards.filter((a) => a.id !== id),
      }));
    }
    return result;
  }, []);

  // Interviews operations
  const addInterview = useCallback(
    async (interview: PortfolioInterview) => {
      if (!userId) return { data: null, error: 'No user ID' };

      const result = await portfolioService.addInterview(userId, interview);
      if (!result.error) {
        setState((prev) => ({
          ...prev,
          interviews: [result.data, ...prev.interviews],
        }));
      }
      return result;
    },
    [userId]
  );

  const updateInterview = useCallback(
    async (id: string, updates: Partial<PortfolioInterview>) => {
      const result = await portfolioService.updateInterview(id, updates);
      if (!result.error) {
        setState((prev) => ({
          ...prev,
          interviews: prev.interviews.map((i) =>
            i.id === id ? { ...i, ...result.data } : i
          ),
        }));
      }
      return result;
    },
    []
  );

  const deleteInterview = useCallback(async (id: string) => {
    const result = await portfolioService.deleteInterview(id);
    if (!result.error) {
      setState((prev) => ({
        ...prev,
        interviews: prev.interviews.filter((i) => i.id !== id),
      }));
    }
    return result;
  }, []);

  // Experience operations
  const addExperience = useCallback(
    async (experience: PortfolioExperience) => {
      if (!userId) return { data: null, error: 'No user ID' };

      const result = await portfolioService.addExperience(userId, experience);
      if (!result.error) {
        setState((prev) => ({
          ...prev,
          experience: [result.data, ...prev.experience],
        }));
      }
      return result;
    },
    [userId]
  );

  const updateExperience = useCallback(
    async (id: string, updates: Partial<PortfolioExperience>) => {
      const result = await portfolioService.updateExperience(id, updates);
      if (!result.error) {
        setState((prev) => ({
          ...prev,
          experience: prev.experience.map((e) =>
            e.id === id ? { ...e, ...result.data } : e
          ),
        }));
      }
      return result;
    },
    []
  );

  const deleteExperience = useCallback(async (id: string) => {
    const result = await portfolioService.deleteExperience(id);
    if (!result.error) {
      setState((prev) => ({
        ...prev,
        experience: prev.experience.filter((e) => e.id !== id),
      }));
    }
    return result;
  }, []);

  // Testimonials operations
  const addTestimonial = useCallback(
    async (testimonial: PortfolioTestimonial) => {
      if (!userId) return { data: null, error: 'No user ID' };

      const result = await portfolioService.addTestimonial(userId, testimonial);
      if (!result.error) {
        setState((prev) => ({
          ...prev,
          testimonials: [result.data, ...prev.testimonials],
        }));
      }
      return result;
    },
    [userId]
  );

  const updateTestimonial = useCallback(
    async (id: string, updates: Partial<PortfolioTestimonial>) => {
      const result = await portfolioService.updateTestimonial(id, updates);
      if (!result.error) {
        setState((prev) => ({
          ...prev,
          testimonials: prev.testimonials.map((t) =>
            t.id === id ? { ...t, ...result.data } : t
          ),
        }));
      }
      return result;
    },
    []
  );

  const deleteTestimonial = useCallback(async (id: string) => {
    const result = await portfolioService.deleteTestimonial(id);
    if (!result.error) {
      setState((prev) => ({
        ...prev,
        testimonials: prev.testimonials.filter((t) => t.id !== id),
      }));
    }
    return result;
  }, []);

  // Skills operations
  const addSkill = useCallback(
    async (skill: PortfolioSkill) => {
      if (!userId) return { data: null, error: 'No user ID' };

      const result = await portfolioService.addSkill(userId, skill);
      if (!result.error) {
        setState((prev) => ({
          ...prev,
          skills: [result.data, ...prev.skills],
        }));
      }
      return result;
    },
    [userId]
  );

  const updateSkill = useCallback(async (id: string, updates: Partial<PortfolioSkill>) => {
    const result = await portfolioService.updateSkill(id, updates);
    if (!result.error) {
      setState((prev) => ({
        ...prev,
        skills: prev.skills.map((s) => (s.id === id ? { ...s, ...result.data } : s)),
      }));
    }
    return result;
  }, []);

  const deleteSkill = useCallback(async (id: string) => {
    const result = await portfolioService.deleteSkill(id);
    if (!result.error) {
      setState((prev) => ({
        ...prev,
        skills: prev.skills.filter((s) => s.id !== id),
      }));
    }
    return result;
  }, []);

  // Portfolio content operations
  const addPortfolioContent = useCallback(
    async (content: PortfolioContent) => {
      if (!userId) return { data: null, error: 'No user ID' };

      const result = await portfolioService.addPortfolioContent(userId, content);
      if (!result.error) {
        setState((prev) => ({
          ...prev,
          portfolioContent: [result.data, ...prev.portfolioContent],
        }));
      }
      return result;
    },
    [userId]
  );

  const updatePortfolioContent = useCallback(
    async (id: string, updates: Partial<PortfolioContent>) => {
      const result = await portfolioService.updatePortfolioContent(id, updates);
      if (!result.error) {
        setState((prev) => ({
          ...prev,
          portfolioContent: prev.portfolioContent.map((c) =>
            c.id === id ? { ...c, ...result.data } : c
          ),
        }));
      }
      return result;
    },
    []
  );

  const deletePortfolioContent = useCallback(async (id: string) => {
    const result = await portfolioService.deletePortfolioContent(id);
    if (!result.error) {
      setState((prev) => ({
        ...prev,
        portfolioContent: prev.portfolioContent.filter((c) => c.id !== id),
      }));
    }
    return result;
  }, []);

  const updateDisplayOrder = useCallback(async (contentIds: string[]) => {
    const result = await portfolioService.updatePortfolioContentDisplayOrder(contentIds);
    if (!result.error) {
      setState((prev) => ({
        ...prev,
        portfolioContent: contentIds
          .map((id) => prev.portfolioContent.find((c) => c.id === id))
          .filter(Boolean) as PortfolioContent[],
      }));
    }
    return result;
  }, []);

  return {
    // State
    ...state,
    
    // Profile
    updateProfile,
    
    // Certifications
    addCertification,
    updateCertification,
    deleteCertification,
    
    // Awards
    addAward,
    updateAward,
    deleteAward,
    
    // Interviews
    addInterview,
    updateInterview,
    deleteInterview,
    
    // Experience
    addExperience,
    updateExperience,
    deleteExperience,
    
    // Testimonials
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    
    // Skills
    addSkill,
    updateSkill,
    deleteSkill,
    
    // Portfolio Content
    addPortfolioContent,
    updatePortfolioContent,
    deletePortfolioContent,
    updateDisplayOrder,
    
    // Refresh
    refresh: fetchAllData,
  };
}
