const STORAGE_KEY = 'candidateSignupData';

let resumeFileCache = null;

const safeParse = (value) => {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

export const getSignupData = () => {
  if (typeof window === 'undefined') return {};
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
};

export const setSignupData = (data) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data || {}));
};

export const mergeSignupData = (updates) => {
  if (typeof window === 'undefined') return;
  const current = getSignupData();
  setSignupData({ ...current, ...(updates || {}) });
};

export const clearSignupData = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  resumeFileCache = null;
};

export const setResumeFile = (file) => {
  resumeFileCache = file || null;
};

export const getResumeFile = () => resumeFileCache;
