'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import styles from './PriceAlertDialog.module.css';

interface PriceAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (price: number) => void;
  symbol: string;
  currentPrice: number;
}

export const PriceAlertDialog: React.FC<PriceAlertDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  symbol,
  currentPrice,
}) => {
  const [targetPrice, setTargetPrice] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTargetPrice(currentPrice.toString());
    }
  }, [isOpen, currentPrice]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(targetPrice);
    if (!isNaN(price) && price > 0) {
      onSubmit(price);
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
            <Bell size={24} />
          </div>
          <h2 className={styles.title}>{symbol} 가격 알림 설정</h2>
        </div>

        <div className={styles.content}>
          <p className={styles.currentPriceLabel}>현재 가격</p>
          <p className={styles.currentPriceValue}>${currentPrice.toLocaleString()}</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.label}>목표 가격 (USD)</label>
            <input
              type="number"
              step="any"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className={styles.input}
              placeholder="목표 가격을 입력하세요"
              autoFocus
            />
            <p className={styles.helperText}>
              설정하신 가격에 도달하면 브라우저 알림을 보내드립니다.
            </p>

            <div className={styles.actions}>
              <button type="button" onClick={onClose} className={styles.cancelButton}>
                취소
              </button>
              <button type="submit" className={styles.submitButton}>
                알림 설정
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
