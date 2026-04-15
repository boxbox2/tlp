import "./globals.css";

export const metadata = {
  title: "月汐塔罗",
  description: "轻量陪伴感的中文塔罗网页，支持选择占卜师、提问、抽牌与解读。"
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
