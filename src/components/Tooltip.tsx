'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HelpCircle, Lightbulb } from 'lucide-react';
import styles from './Tooltip.module.css';

interface TooltipProps {
  term: string;
  shortDesc: string;
  detail?: string;
  metaphor?: string;    // 🐋 고래 비유
  actionTip?: string;   // 실전 팁
  children?: React.ReactNode;
  variant?: 'icon' | 'underline';
}

export const Tooltip: React.FC<TooltipProps> = ({
  term,
  shortDesc,
  detail,
  metaphor,
  actionTip,
  children,
  variant = 'icon',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition(rect.top < 260 ? 'bottom' : 'top');
  }, []);

  useEffect(() => {
    if (isVisible) updatePosition();
  }, [isVisible, updatePosition]);

  // 외부 클릭 시 닫기 (모바일)
  useEffect(() => {
    if (!isVisible) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current && !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isVisible]);

  const handleToggle = () => setIsVisible(!isVisible);

  const hasExtended = metaphor || actionTip;

  return (
    <span className={styles.wrapper}>
      <span
        ref={triggerRef}
        className={`${styles.trigger} ${variant === 'underline' ? styles.underlineTrigger : ''}`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        aria-label={`${term} 설명 보기`}
      >
        {children || term}
        {variant === 'icon' && <HelpCircle size={13} className={styles.helpIcon} />}
      </span>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`${styles.tooltip} ${styles[position]} ${hasExtended ? styles.tooltipWide : ''}`}
          role="tooltip"
        >
          <div className={styles.tooltipHeader}>{term}</div>
          <div className={styles.tooltipShort}>{shortDesc}</div>

          {metaphor && (
            <div className={styles.tooltipMetaphor}>
              {metaphor}
            </div>
          )}

          {detail && !metaphor && (
            <div className={styles.tooltipDetail}>{detail}</div>
          )}

          {actionTip && (
            <div className={styles.tooltipTip}>
              <Lightbulb size={11} />
              <span>{actionTip}</span>
            </div>
          )}
        </div>
      )}
    </span>
  );
};
