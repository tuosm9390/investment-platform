'use client';

import React from 'react';
import { Tooltip } from './Tooltip';
import { GLOSSARY, GlossaryEntry } from '@/data/investmentGlossary';

/**
 * 텍스트 패턴 → 용어 키 매핑
 * AI 인사이트 텍스트에서 자주 등장하는 다양한 표현을 하나의 용어 키로 매핑합니다.
 * 대소문자 무관(case-insensitive), 긴 패턴 먼저 매칭(greedy match 방지)
 */
const TERM_PATTERNS: { pattern: RegExp; key: string }[] = [
  // SMC/ICT — 긴 표현 먼저
  { pattern: /Liquidity\s*Sweep/gi, key: 'LIQUIDITY_SWEEP' },
  { pattern: /유동성\s*스윕/g, key: 'LIQUIDITY_SWEEP' },
  { pattern: /Breaker\s*Block/gi, key: 'BREAKER_BLOCK' },
  { pattern: /브레이커\s*블록/g, key: 'BREAKER_BLOCK' },
  { pattern: /Order\s*Block/gi, key: 'OB' },
  { pattern: /오더\s*블록/g, key: 'OB' },
  { pattern: /Fair\s*Value\s*Gap/gi, key: 'FVG' },
  { pattern: /공정\s*가치\s*갭/g, key: 'FVG' },
  { pattern: /Kill\s*Zone/gi, key: 'KILL_ZONE' },
  { pattern: /킬\s*존/g, key: 'KILL_ZONE' },
  { pattern: /Silver\s*Bullet/gi, key: 'SILVER_BULLET' },
  { pattern: /실버\s*불릿/g, key: 'SILVER_BULLET' },
  { pattern: /Change\s*of\s*Character/gi, key: 'CHOCH' },
  { pattern: /Judas\s*Swing/gi, key: 'JUDAS_SWING' },
  { pattern: /유다스\s*스윙/g, key: 'JUDAS_SWING' },
  { pattern: /Unicorn\s*Model/gi, key: 'UNICORN' },
  { pattern: /유니콘\s*모델/g, key: 'UNICORN' },
  { pattern: /Stop\s*Loss/gi, key: 'STOP_LOSS' },
  { pattern: /손절가/g, key: 'STOP_LOSS' },
  { pattern: /손절/g, key: 'STOP_LOSS' },
  { pattern: /Market\s*Structure\s*Shift/gi, key: 'MSS' },
  { pattern: /Break\s*of\s*Structure/gi, key: 'BOS' },
  { pattern: /구조\s*이탈/g, key: 'BOS' },
  { pattern: /구조\s*전환/g, key: 'CHOCH' },
  { pattern: /추세\s*전환/g, key: 'CHOCH' },

  // 약어 (단어 경계 필수)
  { pattern: /\bFVG\b/g, key: 'FVG' },
  { pattern: /\bOB\b/g, key: 'OB' },
  { pattern: /\bBOS\b/g, key: 'BOS' },
  { pattern: /\bCHoCH\b/gi, key: 'CHOCH' },
  { pattern: /\bMSS\b/g, key: 'MSS' },
  { pattern: /\bAMD\b/g, key: 'AMD' },
  { pattern: /\bRSI\b/g, key: 'RSI' },
  { pattern: /\bMACD\b/g, key: 'MACD' },
  { pattern: /\bEMA\s*\d*/g, key: 'EMA' },

  // 추세/신호
  { pattern: /\bBullish\b/gi, key: 'BULLISH' },
  { pattern: /\bBearish\b/gi, key: 'BEARISH' },
  { pattern: /컨플루언스/g, key: 'CONFLUENCE' },
  { pattern: /\bConfluence\b/gi, key: 'CONFLUENCE' },

  // 유동성 (일반적 사용)
  { pattern: /\bLiquidity\b/gi, key: 'LIQUIDITY' },
  { pattern: /유동성/g, key: 'LIQUIDITY' },

  // 유인
  { pattern: /\bInducement\b/gi, key: 'INDUCEMENT' },
];

// CONFLUENCE는 glossary에 없을 수 있으니 추가
if (!GLOSSARY['CONFLUENCE']) {
  GLOSSARY['CONFLUENCE'] = {
    term: '컨플루언스 (Confluence)',
    shortDesc: '여러 기술적 근거가 같은 가격대에서 겹치는 것 — 진입의 확률을 높여줌',
    detail: '예를 들어, FVG + OB + 킬존 시간이 겹치면 3가지 컨플루언스가 됩니다. ICT에서는 최소 3개의 컨플루언스를 요구합니다.',
    easyMode: '복합 근거',
    metaphor: '🐋 고래의 발자국이 3개 이상 겹치는 자리예요! 발자국 하나보다 세 개가 겹친 곳이 고래가 진짜 있었던 곳입니다.',
    actionTip: '최소 3가지 근거가 겹치는 자리에서만 진입하세요. "하나만 보고 들어가는 것"이 초보자의 가장 큰 실수입니다.',
  };
}

interface HighlightedInsightProps {
  text: string;
  easyMode?: boolean;
}

/**
 * AI 인사이트 텍스트에서 전문 용어를 자동 감지하고 Tooltip으로 감싸는 컴포넌트
 */
export const HighlightedInsight: React.FC<HighlightedInsightProps> = ({ text, easyMode = true }) => {
  const elements: (string | React.ReactElement)[] = [];
  const usedRanges: { start: number; end: number; key: string; match: string }[] = [];

  // 모든 패턴에 대해 매칭 위치를 수집
  for (const { pattern, key } of TERM_PATTERNS) {
    // glossary에 해당 키가 없으면 건너뛰기
    if (!GLOSSARY[key]) continue;

    const regex = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      // 이미 다른 패턴으로 커버된 범위와 겹치면 더 긴 것 우선
      const overlapping = usedRanges.find(
        r => (start >= r.start && start < r.end) || (end > r.start && end <= r.end)
      );

      if (overlapping) {
        // 현재 매치가 더 길면 교체
        if ((end - start) > (overlapping.end - overlapping.start)) {
          const idx = usedRanges.indexOf(overlapping);
          usedRanges[idx] = { start, end, key, match: match[0] };
        }
        // 짧으면 무시
      } else {
        usedRanges.push({ start, end, key, match: match[0] });
      }
    }
  }

  // 위치 순으로 정렬
  usedRanges.sort((a, b) => a.start - b.start);

  // 텍스트를 조각으로 분리
  let lastIndex = 0;
  let tooltipCount = 0;

  for (const range of usedRanges) {
    // 겹침이 있는 경우 건너뛰기 (앞의 것이 우선)
    if (range.start < lastIndex) continue;

    // 용어 앞의 일반 텍스트
    if (range.start > lastIndex) {
      elements.push(text.slice(lastIndex, range.start));
    }

    const entry: GlossaryEntry = GLOSSARY[range.key];
    const displayText = easyMode ? (entry.easyMode || range.match) : range.match;

    elements.push(
      <Tooltip
        key={`term-${tooltipCount++}`}
        term={entry.term}
        shortDesc={entry.shortDesc}
        detail={entry.detail}
        metaphor={entry.metaphor}
        actionTip={entry.actionTip}
        variant="underline"
      >
        {easyMode ? `${displayText}(${range.match})` : range.match}
      </Tooltip>
    );

    lastIndex = range.end;
  }

  // 마지막 남은 텍스트
  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  // 매칭이 없으면 원본 텍스트 그대로
  if (elements.length === 0) {
    return <>{text}</>;
  }

  return <>{elements}</>;
};
