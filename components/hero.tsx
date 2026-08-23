"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const HeroSection = () => {
  const imageRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const imageElement = imageRef.current;

  if (!imageElement) return;

  const handleScroll = () => {
    console.log("scroll:", window.scrollY);
    const scrollPosition = window.scrollY;

    if (scrollPosition > 100) {
      imageElement.classList.add("scrolled");
    } else {
      imageElement.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll);

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);

  return (
    <section className="pt-40 pb-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-8xl lg:text-[105px] pb-6 gradient-title">
          Manage Your Finances <br /> with Intelligence
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          An AI-powered financial management platform that helps you track,
          analyze, and optimize your spending with real-time insights.
        </p>
        {/* <div className="flex justify-center space-x-4 relative z-20">
          <Button size="lg" className="px-8">
          <Link href="/dashboard">
            
              Get Started
              </Link>
            </Button>
          
        </div> */}
        <div className="hero-image-wrapper mt-5 md:mt-0 relative z-0 pointer-events-none">
          <div ref={imageRef} className="hero-image">
            <Image
              src="/banner.jpeg"
              width={1280}
              height={720}
              alt="Dashboard Preview"
              className="rounded-lg shadow-2xl border mx-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;