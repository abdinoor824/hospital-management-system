import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Footer from "@/components/Footer";

export const metadata = {
  title: "HMS - Hospital Management System",
  description: "Hospital Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}