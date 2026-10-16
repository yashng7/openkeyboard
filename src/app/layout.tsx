import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OpenKeyboard — Browser-Based WebHID Control Panel for Gaming & Hall-Effect Keyboards',
  description:
    'Configure Hall-effect actuation, Rapid Trigger, SOCD Snap Tap, multi-layer keymaps, per-key RGB, macros, and Jev-1.13 AI calibration directly in your browser without installing bloatware drivers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
