'use client';

import React, { useState } from 'react';
import { Plus, BookOpen, Trash2, Play, Pause } from 'lucide-react';
import { UploadResearch } from './UploadResearch';
import { getResearchList, deleteResearch, ResearchData } from '@/lib/api/research-api';

// Helper function to get initial research list
function getInitialResearchList(): ResearchData[] {
  return getResearchList();
}

export const ResearchSection = () => {
  const [researchList, setResearchList] = useState<ResearchData[]>(getInitialResearchList); // Lazy initialization
  const [showUpload, setShowUpload] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const loadResearch = () => {
    setResearchList(getResearchList());
  };

  const handleDelete = (id: string) => {
    if (confirm('이 연구 자료를 삭제하시겠습니까?')) {
      deleteResearch(id);
      loadResearch();
    }
  };

  return (
    <div style={{ marginTop: '3rem', width: '100%', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={20} color="var(--primary-600)" />
          NotebookLM 연구 보관함
        </h2>
        <button
          onClick={() => setShowUpload(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            backgroundColor: 'var(--primary-50, #eff6ff)',
            color: 'var(--primary-700, #1d4ed8)',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            fontWeight: 500,
            fontSize: '0.875rem'
          }}
        >
          <Plus size={18} />
          자료 가져오기
        </button>
      </div>

      {researchList.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: 'var(--gray-50, #f9fafb)',
          borderRadius: '1rem',
          border: '1px dashed var(--gray-300)',
          color: 'var(--gray-500)'
        }}>
          <p>아직 등록된 연구 자료가 없습니다.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>NotebookLM에서 분석한 화이트페이퍼나 오디오 가이드를 연동해 보세요.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {researchList.map((item) => (
            <div key={item.id} style={{
              backgroundColor: 'white',
              padding: '1.25rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--gray-200)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{item.title}</h3>
                <button onClick={() => handleDelete(item.id)} style={{ color: 'var(--gray-400)' }}>
                  <Trash2 size={18} />
                </button>
              </div>

              <p style={{
                fontSize: '0.875rem',
                color: 'var(--gray-600)',
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {item.summary}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                  {new Date(item.createdAt).toLocaleDateString()} 등록
                </span>

                {item.audioUrl && (
                  <button
                    onClick={() => setPlayingId(playingId === item.id ? null : item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'var(--primary-600)',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                  >
                    {playingId === item.id ? <Pause size={18} /> : <Play size={18} />}
                    {playingId === item.id ? '일시정지' : '오디오 리서치 듣기'}
                  </button>
                )}
              </div>

              {playingId === item.id && item.audioUrl && (
                <div style={{ marginTop: '0.5rem' }}>
                  <audio src={item.audioUrl} controls style={{ width: '100%', height: '32px' }} autoPlay />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showUpload && (
        <UploadResearch
          onSuccess={loadResearch}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
};
