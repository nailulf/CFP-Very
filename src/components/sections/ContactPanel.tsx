'use client';

import React from 'react';
import { Phone, MapPin } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export const ContactPanel = () => {
  return (
    <section className="bg-[#2C3E50] py-16 text-white">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6">Mari Terhubung</h2>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                <Phone className="text-[#B6E33D]" size={24} />
              </div>
              <div>
                <p className="text-gray-300 text-sm">Hubungi Kami</p>
                <a href="tel:+6281234567890" className="font-bold text-lg hover:text-[#B6E33D] transition-colors">+62 812-3456-7890</a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                <MapPin className="text-[#B6E33D]" size={24} />
              </div>
              <div>
                <p className="text-gray-300 text-sm">Kunjungi Kami</p>
                <p className="font-bold text-lg">SCBD, Jakarta Selatan, ID</p>
              </div>
            </div>
          </div>

          {/* Newsletter / Inline Form */}
          <div className="lg:col-span-2 bg-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur-sm">
            <div className="max-w-xl">
              <h3 className="text-2xl font-bold mb-2">Berlangganan Newsletter Kami</h3>
              <p className="text-gray-300 mb-6">Dapatkan tips keuangan terbaru dan update pasar langsung ke kotak masuk Anda.</p>
              
              <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Alamat email Anda" 
                  className="flex-1 h-12 px-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B6E33D] focus:border-transparent"
                  required
                />
                <Button type="submit" className="bg-[#B6E33D] text-[#2C3E50] hover:bg-[#a3cc35]">
                  Langganan Sekarang
                </Button>
              </form>
              <p className="text-xs text-gray-400 mt-4">
                Dengan berlangganan, Anda menyetujui Kebijakan Privasi kami. Kami menghargai privasi Anda dan tidak akan mengirim spam.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
