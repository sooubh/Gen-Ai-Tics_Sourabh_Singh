import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'VECNAVERSE — Voice-to-Investigation Cybercrime Audio Intelligence',
  description: 'Authorized law enforcement workspace for forensic cybercrime audio analysis, multi-speaker diarization, entity extraction, and emergency trigger detection.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#121315] font-sans text-[#edeae1] antialiased min-h-screen selection:bg-[#7d8c52] selection:text-[#161f00]">
        <Sidebar />
        <div className="pl-72">
          <Header />
          <main className="w-full pt-16 min-h-screen flex flex-col justify-between bg-[#121315]">
            <div className="flex-1 w-full">{children}</div>
            <footer className="w-full bg-[#0d0e10]/90 px-4 py-3 mt-auto border-t border-[#35373e]">
              <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-[#71706b] font-mono text-xs">
                <span>VECNAVERSE Cybercrime Audio Intelligence Platform • CJIS Tier 4 / FedRAMP High Enclave</span>
                <span>Automated acoustic & vocal analysis is non-evidentiary and requires affirmative sworn validation.</span>
              </div>
            </footer>
          </main>
        </div>
      </body>
    </html>
  );
}
