'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, X } from 'lucide-react';
import styles from './PortfolioDialog.module.css';

interface PortfolioDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quantity: number, averagePrice: number) => void;
  symbol: string;
  currentPrice: number;
}

export const PortfolioDialog: React.FC<PortfolioDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  symbol,
  currentPrice,
}) => {
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  useEffect(() => {
    if (isOpen) {
      setBuyPrice(currentPrice.toString());
    }
  }, [isOpen, currentPrice]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = parseFloat(quantity);
    const p = parseFloat(buyPrice);
    if (!isNaN(q) && !isNaN(p) && q >= 0 && p > 0) {
      onSubmit(q, p);
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>

        <div className={styles.header}>
          <div className={styles.iconCircle}>
            <Wallet size={24} />
          </div>
          <h2 className={styles.title}>{symbol} 포트폴리오 추가</h2>
        </div>

        <div className={styles.content}>
          <p className={styles.currentPriceLabel}>현재 가격: ${currentPrice.toLocaleString()}</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>보유 수량</label>
              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={styles.input}
                placeholder="0.00"
                autoFocus
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>평균 단가 (USD)</label>
              <input
                type="number"
                step="any"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className={styles.input}
                placeholder="매도/매수가 입력"
              />
            </div>

            <p className={styles.helperText}>
              * 총 평가액 계산에 사용됩니다. 실제 매매와는 무관합니다.
            </p>

            <div className={styles.actions}>
              <button type="button" onClick={onClose} className={styles.cancelButton}>
                취소
              </button>
              <button type="submit" className={styles.submitButton}>
                저장하기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
