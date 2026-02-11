'use client';

import React, { useState } from 'react';
import { Upload, Music, X } from 'lucide-react';
import { saveResearch } from '@/lib/api/research-api';

interface UploadResearchProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const UploadResearch: React.FC<UploadResearchProps> = ({ onSuccess, onClose }) => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary) return;

    setIsSubmitting(true);
    try {
      // In a real app, we'd upload the audio file to a bucket first
      const audioUrl = audioFile ? URL.createObjectURL(audioFile) : undefined;

      saveResearch({
        title,
        summary,
        audioUrl,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save research:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'var(--card-background, #fff)',
        padding: '2rem',
        borderRadius: '1rem',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        border: '1px solid var(--gray-200)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--gray-900)' }}>NotebookLM 자료 가져오기</h2>
          <button onClick={onClose} style={{ color: 'var(--gray-500)' }}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>연구 제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: AI 산업 동향 분석"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--gray-300)',
                outline: 'none',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>요약 내용 (Markdown)</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="NotebookLM에서 복사한 내용을 붙여넣으세요..."
              required
              style={{
                width: '100%',
                height: '150px',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--gray-300)',
                outline: 'none',
                fontSize: '1rem',
                resize: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>오디오 리서치 (선택)</label>
            <div
              style={{
                border: '2px dashed var(--gray-300)',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) setAudioFile(e.dataTransfer.files[0]);
              }}
              onClick={() => document.getElementById('audio-upload')?.click()}
            >
              <input
                id="audio-upload"
                type="file"
                accept="audio/*"
                hidden
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              />
              {audioFile ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--primary-600)' }}>
                  <Music size={20} />
                  <span>{audioFile.name}</span>
                </div>
              ) : (
                <div style={{ color: 'var(--gray-500)' }}>
                  <Upload size={24} style={{ marginBottom: '0.5rem' }} />
                  <p>WAV/MP3 파일을 드래그하거나 클릭하여 업로드</p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              backgroundColor: 'var(--primary-600, #2563eb)',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              fontWeight: 600,
              marginTop: '0.5rem',
              transition: 'opacity 0.2s',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? '저장 중...' : '자료 저장하기'}
          </button>
        </form>
      </div>
    </div>
  );
};
