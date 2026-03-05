'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  return (
    <div className="pt-32 pb-20 bg-gray-50 min-h-screen">
      <Container>
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row">
          
          {/* Contact Info Sidebar */}
          <div className="bg-[#2C3E50] p-10 lg:p-12 text-white lg:w-2/5 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-6">Hubungi Kami</h1>
              <p className="text-gray-300 mb-10">
                Punya pertanyaan tentang layanan kami atau siap memulai perjalanan finansial Anda? Kami siap membantu.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="text-[#B6E33D]" size={20} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Telepon</p>
                    <a href="tel:+6281234567890" className="font-medium hover:text-[#B6E33D] transition-colors">+62 812-3456-7890</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="text-[#B6E33D]" size={20} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Email</p>
                    <a href="mailto:hello@verycleverina.com" className="font-medium hover:text-[#B6E33D] transition-colors">hello@verycleverina.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="text-[#B6E33D]" size={20} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Kantor</p>
                    <p className="font-medium">SCBD, Jakarta Selatan,<br />Indonesia 12190</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-sm text-gray-400">
                Jam Operasional:<br />
                Sen - Jum: 09:00 - 18:00 WIB
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="p-10 lg:p-12 lg:w-3/5">
            {isSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                  <Send size={32} />
                </div>
                <h2 className="text-2xl font-bold text-[#2C3E50] mb-2">Pesan Terkirim!</h2>
                <p className="text-gray-600 mb-8">
                  Terima kasih telah menghubungi kami. Kami akan membalas pesan Anda dalam waktu 24 jam kerja.
                </p>
                <Button onClick={() => setIsSuccess(false)} variant="outline">
                  Kirim Pesan Lain
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                    <input 
                      id="name"
                      type="text" 
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent transition-all"
                      placeholder="Budi Santoso"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">Alamat Email</label>
                    <input 
                      id="email"
                      type="email" 
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent transition-all"
                      placeholder="budi@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-gray-700">Subjek</label>
                  <select 
                    id="subject"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent transition-all bg-white"
                    required
                  >
                    <option value="">Pilih topik</option>
                    <option value="consultation">Konsultasi Keuangan</option>
                    <option value="templates">Mentoring & Edukasi</option>
                    <option value="planning">Perencanaan Komprehensif</option>
                    <option value="other">Pertanyaan Lain</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-gray-700">Pesan</label>
                  <textarea 
                    id="message"
                    rows={5}
                    className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent transition-all resize-none"
                    placeholder="Bagaimana kami dapat membantu Anda?"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  fullWidth 
                  disabled={isSubmitting}
                  className="bg-[#2C3E50] hover:bg-[#34495E]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    'Kirim Pesan'
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
