'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
];

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

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
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[14px] font-medium text-[#6D6C6A] hover:text-[#1A1918] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Link href="https://calendly.com/adityacleverina/30min" target="_blank" rel="noopener noreferrer">
              <Button size="sm">Book a Call</Button>
            </Link>
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
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[15px] font-medium text-[#6D6C6A] hover:text-[#1A1918] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="https://calendly.com/adityacleverina/30min" target="_blank" rel="noopener noreferrer">
            <Button size="sm" fullWidth onClick={() => setIsOpen(false)}>
              Book a Call
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
};
