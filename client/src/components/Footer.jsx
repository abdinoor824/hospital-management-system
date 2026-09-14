export default function Footer() {
  const links = [
    {
      label: "Instagram",
      href: "https://www.instagram.com/abdinurkune9?stkn=MW9meDMyZXhvanhvaA==",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
          <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
        </svg>
      ),
    },
    {
      label: "Twitter / X",
      href: "https://x.com/abdinurkune22",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4L20 20M20 4L4 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/abdinoor-ahmed-kune-b3a8652b0",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
          <circle cx="7" cy="8" r="1.3" fill="currentColor" />
          <path d="M7 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M11 17V13C11 11.5 12 11 13 11C14 11 15 11.5 15 13V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M11 17V13.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: "WhatsApp",
      href: "https://wa.me/254721802455",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M20 4.5C18 2.5 15.3 1.5 12.5 1.7C7.7 2 3.9 6 3.7 10.8C3.6 12.4 4 14 4.7 15.3L3.5 20L8.4 18.9C9.6 19.5 11 19.9 12.4 19.9H12.5C17.3 19.9 21.2 16.1 21.4 11.3C21.5 8.6 20.5 6 18.6 4.1"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 8.5C9 8 9.4 7.5 10 7.5C10.3 7.5 10.6 7.7 10.7 8L11.2 9.2C11.3 9.5 11.2 9.8 11 10L10.5 10.5C10.9 11.6 11.9 12.6 13 13L13.5 12.5C13.7 12.3 14 12.2 14.3 12.3L15.5 12.8C15.8 12.9 16 13.2 16 13.5C16 14.1 15.5 14.5 15 14.5C12 14.5 9 11.5 9 8.5Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      label: "Email",
      href: "mailto:abdinurkune@gmail.com",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M3 6L12 13L21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  const quickLinks = [
    { label: "Find a Doctor", href: "/" },
    { label: "Sign In", href: "/login" },
    { label: "Register", href: "/register" },
  ];

  return (
    <footer className="bg-slate-100 border-t border-slate-200 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10 lg:px-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Brand blurb */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-600 text-white text-[16px]">⚕</div>
            <span className="text-[15px] font-bold text-slate-900">HMS</span>
          </div>
          <p className="text-[13px] text-slate-500 leading-relaxed">
            Making it easy to find the right doctor and manage your care, all in one place.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-400 mb-3">Quick Links</p>
          <div className="flex flex-col gap-2">
            {quickLinks.map((l) => (
              <a key={l.label} href={l.href} className="text-[13.5px] text-slate-600 hover:text-indigo-600">
                {l.label}
              </a>
            ))}
          </div>
        </div>

        {/* Contact + social */}
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-400 mb-3">Get in Touch</p>
          <p className="text-[13.5px] text-slate-600 mb-1">
            <a href="mailto:abdinurkune@gmail.com" className="hover:text-indigo-600">abdinurkune@gmail.com</a>
          </p>
          <p className="text-[13.5px] text-slate-600 mb-4">
            <a href="https://wa.me/254721802455" className="hover:text-indigo-600">+254 721 802 455</a>
          </p>
          <div className="flex items-center gap-2.5">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="h-9 w-9 grid place-items-center rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 px-6 py-4 lg:px-10">
        <p className="text-[12px] text-slate-400 text-center">
          © {new Date().getFullYear()} HMS — Hospital Management System. All rights reserved.
        </p>
      </div>
    </footer>
  );
}