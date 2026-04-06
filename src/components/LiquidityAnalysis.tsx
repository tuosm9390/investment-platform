'use client';

import React from 'react';
import { FVG } from '@/lib/advanced-indicators';
import { Layers } from 'lucide-react';
import styles from './ProfessionalAnalysisView.module.css'; // Reusing styles

interface Props {
  fvgs: FVG[];
}

export const LiquidityAnalysis: React.FC<Props> = ({ fvgs }) => {
  const activeFvgs = fvgs.filter(f => !f.mitigated);

  return (
    <div className={styles.card}>
      <h3>유동성 분석 (미완화 FVG)</h3>
      {activeFvgs.length === 0 ? (
        <p className={styles.empty}>활성화된 유동성 갭이 없습니다.</p>
      ) : (
        <ul className={styles.list}>
          {activeFvgs.slice(0, 10).map((fvg, i) => (
            <li key={i} className={fvg.type === 'bullish' ? styles.bullish : styles.bearish}>
              <Layers size={14} />
              <span>
                {fvg.type === 'bullish' ? '상승' : '하락'} FVG: 
                {fvg.bottom.toFixed(2)} - {fvg.top.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
