"use client";

import Image from "next/image";
import { TouchEvent, useEffect, useState } from "react";

interface Step {
  title: string;
  description: string;
  image: string;
}

const steps: Step[] = [
  {
    title: "Étape 1",
    description:
      "Ouvrez l'application Contacts de votre téléphone, puis accédez aux paramètres pour exporter vos contacts en fichier.",
    image: "/steps/step1.jpg",
  },
  {
    title: "Étape 2",
    description:
      "Rendez-vous sur le site web, puis chargez le fichier exporté.",
    image: "/steps/step2.jpg",
  },
  {
    title: "Étape 3",
    description:
      "Téléchargez le fichier modifié depuis le site. Nous vous recommandons de garder les versions originales et modifiées des numéros",
    image: "/steps/step3.jpg",
  },
  {
    title: "Étape 4",
    description:
      "Retournez dans l'application Contacts, sélectionnez tous vos contacts existants, et supprimez-les.",
    image: "/steps/step4.jpg",
  },
  {
    title: "Étape 5",
    description: "Importez le nouveau fichier de contacts modifié.",
    image: "/steps/step5.jpg",
  },
];

export default function Carousel() {
  const [currentStep, setCurrentStep] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Minimum de distance requise pour un swipe (en pixels)
  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    } else if (isRightSwipe) {
      setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length);
    }
  };

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div
      className="overflow-hidden relative mx-auto w-full max-w-[1200px] backdrop-blur-md bg-white/20 rounded-lg shadow-lg border border-white/10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex transition-transform duration-500 ease-in-out touch-pan-y"
        style={{ transform: `translateX(-${currentStep * 100}%)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {steps.map((step, index) => (
          <div key={index} className="flex-shrink-0 w-full">
            <div className="flex flex-col md:flex-row h-auto sm:h-[600px] md:h-[500px]">
              <div className="flex flex-col justify-center p-4 sm:p-6 md:p-8 space-y-4 w-full md:w-[60%] lg:w-[70%] order-2 md:order-1">
                <div className="inline-block px-3 py-1 mb-2 text-sm font-semibold text-white rounded-full backdrop-blur-sm bg-white/30">
                  {step.title}
                </div>
                <p className="text-sm text-white sm:text-base md:text-lg">
                  {step.description}
                </p>
              </div>

              <div className="relative h-[400px] sm:h-[350px] md:h-full w-full md:w-[40%] lg:w-[30%] order-1 md:order-2">
                <Image
                  src={step.image}
                  alt={`Étape ${index + 1}`}
                  fill
                  className="object-contain rounded-t-lg md:object-cover md:rounded-t-none md:rounded-r-lg"
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 40vw, 30vw"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex absolute right-0 left-0 bottom-1 gap-1 justify-center sm:bottom-2 md:bottom-4 md:gap-2">
        {steps.map((_, index) => (
          <button
            key={index}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
              currentStep === index
                ? "w-4 sm:w-6 md:w-8 bg-white"
                : "bg-white/50 hover:bg-white/70"
            }`}
            onClick={() => setCurrentStep(index)}
          />
        ))}
      </div>

      <button
        className="hidden absolute left-2 top-1/2 p-2 text-white rounded-full backdrop-blur-md transition-all -translate-y-1/2 sm:block bg-white/20 hover:bg-white/30"
        onClick={() =>
          setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length)
        }
      >
        <svg
          className="w-4 h-4 md:w-6 md:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        className="hidden absolute right-2 top-1/2 p-2 text-white rounded-full backdrop-blur-md transition-all -translate-y-1/2 sm:block bg-white/20 hover:bg-white/30"
        onClick={() => setCurrentStep((prev) => (prev + 1) % steps.length)}
      >
        <svg
          className="w-4 h-4 md:w-6 md:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
