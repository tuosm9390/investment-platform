import type { Metadata } from "next";
import Header from "@/components/Header";
import "./globals.css";

import PriceAlertManager from "@/components/PriceAlertManager";

export const metadata: Metadata = {
  title: "Invesight - 투자 정보 플랫폼",
  description: "암호화폐 투자 정보를 한눈에 확인하세요. 실시간 시세, 뉴스, AI 예측 분석.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <PriceAlertManager />
        <Header />
        <main style={{ minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
