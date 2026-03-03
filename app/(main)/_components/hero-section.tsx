import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { IntroSection } from "./intro-section";
import { FeaturesSection } from "./features-section";
import { NewsCanal } from "./news-canal";
import { EventCanal } from "./event-canal";
import { TestimonialSection } from "./testimonial-section";
import { CtaSection } from "./cta-section";
import { SocialSection } from "./social-section";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { HeroMaskEffect } from "./hero-mask-effect";

function NewsSkeleton() {
  return (
    <div className="w-full py-24 bg-background container mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Skeleton className="h-48 md:h-64 rounded-3xl w-full" />
        <Skeleton className="h-48 md:h-64 rounded-3xl w-full" />
      </div>
    </div>
  );
}

function EventSkeleton() {
  return (
    <div className="w-full py-24 bg-background container mx-auto px-4">
      <Skeleton className="h-125 rounded-[2.5rem] w-full" />
    </div>
  );
}

export async function HeroSection() {
  const session = await auth();
  return (
    <section className="relative w-full text-black flex flex-col pt-0 z-10">
      {/* Sticky background image track */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <div className="sticky top-0 w-full h-screen flex items-center justify-center">
          <div className="relative w-full h-full bg-black shadow-2xl">
            <Image
              src="/images/benderaPatra.png"
              alt="Bendera PATRA"
              fill
              priority
              className="object-cover object-top"
            />
          </div>
        </div>
      </div>

      {/* Hero Content Layer (First Curtain) */}
      <div className="relative z-10 w-full min-h-screen bg-white flex flex-col justify-center pb-32 sm:pb-44 lg:pb-64 shadow-[0_20px_50px_rgba(0,0,0,0.15)] pt-24 md:pt-28">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          {/* SVG Mask Effect with CTA Buttons */}
          <div className="w-full">
            <HeroMaskEffect
              ctaButtons={
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto rounded-full text-base sm:text-lg font-bold px-8 sm:px-10 h-12 sm:h-14 bg-brand-primary hover:bg-brand-hover text-white border-2 border-brand-primary"
                    asChild
                  >
                    {session?.user ? (
                      <Link
                        href={
                          session.user.role === "SUPER_ADMIN" ||
                          session.user.role === "ADMIN"
                            ? "/admin"
                            : "/events"
                        }
                      >
                        {session.user.role === "SUPER_ADMIN" ||
                        session.user.role === "ADMIN"
                          ? "Admin Panel"
                          : "Events"}
                      </Link>
                    ) : (
                      <Link href="/login">Login</Link>
                    )}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto rounded-full text-base sm:text-lg font-bold px-6 sm:px-8 h-12 sm:h-14 bg-white hover:bg-white/90 text-brand-primary border-2 border-brand-primary flex items-center justify-center gap-2"
                    asChild
                  >
                    <Link href="/articles">
                      Baca Artikel Kami
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary" />
                    </Link>
                  </Button>
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* Spacer for sticky scroll effect */}
      <div className="relative z-0 w-full h-screen pointer-events-none" />

      {/* Second Curtain */}
      <div className="relative z-20 bg-background flex flex-col w-full shadow-[0_-20px_50px_rgba(0,0,0,0.15)]">
        <IntroSection />
        <FeaturesSection />
        <Suspense fallback={<NewsSkeleton />}>
          <NewsCanal />
        </Suspense>
        <SocialSection />
        <Suspense fallback={<EventSkeleton />}>
          <EventCanal />
        </Suspense>
        <TestimonialSection />
        <CtaSection />
      </div>
    </section>
  );
}
