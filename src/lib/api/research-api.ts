export interface ResearchData {
  id: string;
  title: string;
  summary: string;
  audioUrl?: string;
  createdAt: string;
}

export const saveResearch = (data: Omit<ResearchData, 'id' | 'createdAt'>): ResearchData => {
  const newResearch: ResearchData = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  };

  const existing = getResearchList();
  localStorage.setItem('notebook_research', JSON.stringify([newResearch, ...existing]));
  return newResearch;
};

export const getResearchList = (): ResearchData[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('notebook_research');
  return data ? JSON.parse(data) : [];
};

export const deleteResearch = (id: string) => {
  const existing = getResearchList();
  localStorage.setItem('notebook_research', JSON.stringify(existing.filter(r => r.id !== id)));
};
