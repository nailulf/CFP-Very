'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useLang } from '@/lib/lang-context';
import { translations } from '@/lib/translations';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const { lang } = useLang();
  const t = translations[lang].navbar;
  const normalizeHref = (href: string) => (href.startsWith('#') ? `/${href}` : href);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E0EFF5]">
      <div className="mx-auto w-full max-w-screen-xl px-5 sm:px-10 lg:px-20">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3 text-[20px] font-bold text-[#1A1918] tracking-[-0.5px]">
            <Image
              src="/icon_1.png"
              alt="Aditya Very Cleverina CFP logo"
              width={192}
              height={192}
              className="w-9 h-9 rounded-md object-cover"
              priority
            />
            <div className='flex flex-col leading-tight'>
              <span className="font-bold text-[20px]">Teman Tumbuh</span>
              <span className="text-[#6D6C6A] text-[14px] leading-none">Aditya Very Cleverina</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {/* Services dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[14px] font-medium text-[#6D6C6A] hover:text-[#1A1918] transition-colors"
                aria-expanded={servicesOpen}
                aria-haspopup="true"
                onClick={() => setServicesOpen((v) => !v)}
              >
                {t.servicesMenu.label}
                <ChevronDown size={15} className={`transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>
              {servicesOpen && (
                <div className="absolute left-0 top-full pt-3">
                  <div className="w-64 rounded-2xl border border-[#E0EFF5] bg-white p-2 shadow-[0_12px_32px_rgba(0,0,0,0.10)]">
                    {t.servicesMenu.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block rounded-xl px-4 py-3 text-[14px] font-medium text-[#6D6C6A] hover:bg-[#F0F7FA] hover:text-[#205781] transition-colors"
                        onClick={() => setServicesOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {t.links.map((link) => (
              <Link
                key={link.href}
                href={normalizeHref(link.href)}
                className="text-[14px] font-medium text-[#6D6C6A] hover:text-[#1A1918] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right: switcher + CTA */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <a href="https://wa.me/6281806484635" target="_blank" rel="noopener noreferrer">
              <Button size="sm">{t.cta}</Button>
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-[#6D6C6A]"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-[#E0EFF5] px-5 py-6 flex flex-col gap-5">
          {/* Services group */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-between text-[15px] font-medium text-[#6D6C6A] hover:text-[#1A1918] transition-colors"
              aria-expanded={mobileServicesOpen}
              onClick={() => setMobileServicesOpen((v) => !v)}
            >
              {t.servicesMenu.label}
              <ChevronDown size={18} className={`transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileServicesOpen && (
              <div className="flex flex-col gap-3 pl-4 border-l-2 border-[#E0EFF5]">
                {t.servicesMenu.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-[14px] font-medium text-[#6D6C6A] hover:text-[#205781] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {t.links.map((link) => (
            <Link
              key={link.href}
              href={normalizeHref(link.href)}
              className="text-[15px] font-medium text-[#6D6C6A] hover:text-[#1A1918] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <LanguageSwitcher />
          <a href="https://wa.me/6281806484635" target="_blank" rel="noopener noreferrer">
            <Button size="sm" fullWidth onClick={() => setIsOpen(false)}>
              {t.cta}
            </Button>
          </a>
        </div>
      )}
    </header>
  );
};
