'use client';

import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import styles from './InvestmentDisclaimer.module.css';

interface InvestmentDisclaimerProps {
  variant?: 'full' | 'compact' | 'inline';
}

export const InvestmentDisclaimer: React.FC<InvestmentDisclaimerProps> = ({ variant = 'full' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (variant === 'inline') {
    return (
      <p className={styles.inline}>
        <AlertTriangle size={12} />
        <span>본 정보는 투자 자문이 아니며, 투자 손실에 대한 책임은 투자자 본인에게 있습니다.</span>
      </p>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={styles.compact}>
        <div className={styles.compactHeader}>
          <Shield size={14} />
          <span>투자 유의사항</span>
        </div>
        <p className={styles.compactText}>
          본 페이지의 분석 정보는 참고 자료이며 투자 권유가 아닙니다. 투자 결정은 본인의 판단과 책임하에 이루어져야 하며, 발생하는 손실에 대해 본 서비스는 일체의 책임을 지지 않습니다.
        </p>
      </div>
    );
  }

  // full variant
  return (
    <div className={styles.full}>
      <button
        className={styles.fullHeader}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className={styles.fullHeaderLeft}>
          <AlertTriangle size={16} />
          <span className={styles.fullTitle}>⚠️ 투자 위험 고지</span>
        </div>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <div className={styles.fullSummary}>
        본 AI 분석 결과는 <strong>참고 자료</strong>이며, <strong>투자 권유가 아닙니다.</strong> 모든 투자 결정과 손실의 책임은 투자자 본인에게 있습니다.
      </div>

      {isExpanded && (
        <div className={styles.fullDetail}>
          <ul className={styles.detailList}>
            <li>
              <strong>AI 한계:</strong> AI 분석은 과거 데이터와 기술 지표를 기반으로 하며, 미래 가격을 보장하지 않습니다. 예측 정확도는 시장 상황에 따라 크게 달라질 수 있습니다.
            </li>
            <li>
              <strong>투자 위험:</strong> 암호화폐 및 주식 투자는 원금 손실의 위험이 있습니다. 특히 암호화폐는 높은 변동성으로 인해 단시간에 큰 손실이 발생할 수 있습니다.
            </li>
            <li>
              <strong>자기 책임 원칙:</strong> 투자 판단은 반드시 본인의 분석과 판단에 따라 이루어져야 합니다. 본 서비스의 분석 결과만을 근거로 투자하지 마세요.
            </li>
            <li>
              <strong>분산 투자:</strong> 한 종목에 전 자산을 투자하지 마세요. 감당 가능한 범위 내에서의 투자를 권장합니다.
            </li>
            <li>
              <strong>전문가 상담:</strong> 고액 투자를 고려 중이라면 공인 재무 상담사와 상담하시기를 권장합니다.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
