'use client';

import React, { useEffect, useRef } from 'react';
import { X, Download, FileSpreadsheet, FileText, Tag } from 'lucide-react';
import { digitalProducts, DigitalProduct } from '@/data/digitalProducts';

interface DigitalProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FILE_ICON_MAP: Record<DigitalProduct['fileType'], React.ReactNode> = {
  Excel: <FileSpreadsheet size={18} />,
  'Google Sheets': <FileSpreadsheet size={18} />,
  PDF: <FileText size={18} />,
};

const CATEGORY_COLORS: Record<DigitalProduct['category'], string> = {
  Planner: 'bg-[#205781]/10 text-[#205781]',
  Tracker: 'bg-[#4F9DA6]/15 text-[#3A7A82]',
  Calculator: 'bg-[#8AD6C1]/20 text-[#2A9070]',
  Guide: 'bg-purple-100 text-purple-700',
  Template: 'bg-amber-100 text-amber-700',
};

export const DigitalProductsModal: React.FC<DigitalProductsModalProps> = ({ isOpen, onClose }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const freeProducts = digitalProducts.filter((p) => p.isFree);
  const paidProducts = digitalProducts.filter((p) => !p.isFree);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{
        backgroundColor: 'rgba(10, 10, 10, 0.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        transition: 'opacity 250ms ease',
      }}
      aria-modal="true"
      role="dialog"
      aria-label="Digital Products"
    >
      <div
        className="relative w-full sm:max-w-3xl max-h-[92dvh] sm:max-h-[85dvh] flex flex-col bg-white sm:rounded-2xl overflow-hidden"
        style={{
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.97)',
          transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          border: '1px solid #E5E4E1',
          boxShadow: '0 40px 80px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E4E1] flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[#1A1918] tracking-tight">Digital Products & Templates</h2>
            <p className="text-xs text-[#9C9B99] mt-0.5">{digitalProducts.length} tools for your financial glow-up</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F0F0EE] text-[#6B6A68] hover:bg-[#E5E4E1] hover:text-[#1A1918] transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-6 flex flex-col gap-8 bg-[#F8F7F5]">

          {/* Free section */}
          {freeProducts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#2A9070]">Free Downloads</span>
                <div className="flex-1 h-px bg-[#E5E4E1]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {freeProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}

          {/* Paid section */}
          {paidProducts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#205781]">Premium Tools</span>
                <div className="flex-1 h-px bg-[#E5E4E1]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paidProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const ProductCard: React.FC<{ product: DigitalProduct }> = ({ product }) => {
  const [expanded, setExpanded] = React.useState(false);
  const words = product.description.trim().split(/\s+/);
  const isLong = words.length > 20;
  const displayText = isLong && !expanded ? words.slice(0, 20).join(' ') + '…' : product.description;

  return (
  <div className="group flex flex-col gap-3 p-4 rounded-xl bg-white border border-[#E5E4E1] hover:border-[#C8C7C4] hover:shadow-sm transition-all">
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[product.category]}`}>
          <Tag size={10} />
          {product.category}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-[#6B6A68] bg-[#F0F0EE] px-2 py-0.5 rounded-full">
          {FILE_ICON_MAP[product.fileType]}
          {product.fileType}
        </span>
      </div>
      {product.isFree ? (
        <span className="text-[11px] font-bold text-[#2A9070] bg-[#8AD6C1]/20 px-2 py-0.5 rounded-full flex-shrink-0">FREE</span>
      ) : (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {product.originalPrice && (
            <span className="text-[11px] text-[#B0AFAD] line-through">{product.originalPrice}</span>
          )}
          <span className="text-[11px] font-bold text-[#1A1918] bg-[#E5E4E1] px-2 py-0.5 rounded-full">{product.price}</span>
        </div>
      )}
    </div>

    <div>
      <p className="font-semibold text-[#1A1918] text-sm leading-snug">{product.title}</p>
      <p className="text-xs text-[#6B6A68] mt-1 leading-relaxed">
        {displayText}
        {isLong && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="ml-1 text-[#205781] font-semibold hover:underline focus:outline-none"
          >
            {expanded ? 'less' : 'more'}
          </button>
        )}
      </p>
    </div>

    <a
      href={product.downloadUrl}
      download={product.isFree}
      className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#205781] hover:text-[#1A1918] transition-colors"
    >
      <Download size={12} />
      {product.isFree ? 'Download Free' : 'Get This Template'}
    </a>
  </div>
  );
};
