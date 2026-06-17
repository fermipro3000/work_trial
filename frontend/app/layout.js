import "./globals.css";
import Providers from "@/components/layout/Providers";
import { Nav } from "@/components/layout/Nav";

export const metadata = {
  title: "NFT Airdrop Platform",
  description: "Discover and claim NFT airdrops",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <Nav />
          <main className="mx-auto max-w-6xl px-4 py-12">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
