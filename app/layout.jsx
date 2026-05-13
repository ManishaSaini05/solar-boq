import "./globals.css";

export const metadata = {
  title: "Solar BoQ System",
  description: "Rooftop Solar — Design to Proposal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
