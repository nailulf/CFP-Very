import { HomeHero } from '@/components/sections/home/HomeHero';
import { ClientStrip } from '@/components/sections/home/ClientStrip';
import { ProblemCards } from '@/components/sections/home/ProblemCards';
import { HomeServices } from '@/components/sections/home/HomeServices';
import { CorporateTeaser } from '@/components/sections/home/CorporateTeaser';
import { Testimonials } from '@/components/sections/home/Testimonials';
import { ProductCarousel } from '@/components/sections/home/ProductCarousel';
import { HomeFinalCTA } from '@/components/sections/home/HomeFinalCTA';

/**
 * Band rhythm: the hero gradient resolves into page-bg, and the client strip
 * and Problem section continue it as one light zone — Problem's white cards
 * supply their own separation. From Services on, grounds alternate:
 * white -> navy -> page -> white -> navy.
 */
export default function Home() {
  return (
    <>
      <HomeHero />
      <ClientStrip />
      <ProblemCards />
      <HomeServices />
      <CorporateTeaser />
      <Testimonials />
      <ProductCarousel />
      <HomeFinalCTA />
    </>
  );
}
