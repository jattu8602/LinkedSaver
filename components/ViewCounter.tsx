"use client";

import { useEffect, useState, useRef } from 'react';
import { Eye, Heart } from 'lucide-react';

// Sub-component for consistency
const BadgeContainer = ({ children, colorClass }: { children: React.ReactNode, colorClass?: string }) => (
    <div className={`flex items-center gap-2 px-3 h-9 rounded-full border border-zinc-700/50 backdrop-blur-sm bg-zinc-800/50 ${colorClass || ''} w-full justify-center`}>
        {children}
    </div>
);

export function ViewCounter() {
    const [views, setViews] = useState(0);
    const [displayViews, setDisplayViews] = useState(0);
    const [hasCounted, setHasCounted] = useState(false);

    // Slider state
    const [slideIndex, setSlideIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const res = await fetch('/api/views', { method: 'POST' });
                const data = await res.json();
                setViews(data.count);
            } catch (e) {
                console.error("Failed to update views", e);
            }
        };
        init();
    }, []);

    // Initial Counting Animation
    useEffect(() => {
        if (views === 0) return;

        let current = 0;
        const duration = 2000;
        const steps = 60;
        const increment = views / steps;
        const intervalTime = duration / steps;

        const timer = setInterval(() => {
            current += increment;
            if (current >= views) {
                setDisplayViews(views);
                setHasCounted(true);
                clearInterval(timer);
            } else {
                setDisplayViews(Math.floor(current));
            }
        }, intervalTime);

        return () => clearInterval(timer);
    }, [views]);

    // Carousel Logic
    useEffect(() => {
        if (!hasCounted) return;

        // Sequence:
        // 0 (Views) -> wait 5s -> 1 (Thanks)
        // 1 (Thanks) -> wait 5s -> 2 (Views) -> wait 500ms -> reset to 0

        const interval = setInterval(() => {
            setSlideIndex(prev => {
                const next = prev + 1;
                // Enable transition for the move
                setIsTransitioning(true);
                return next;
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [hasCounted]);

    // Handle Reset
    useEffect(() => {
        if (slideIndex === 2) {
            // We just slid to the "Clone Views".
            // Wait for transition to finish (500ms), then snap back to 0
            const timeout = setTimeout(() => {
                setIsTransitioning(false);
                setSlideIndex(0);
            }, 500); // Metric matches duration-500

            return () => clearTimeout(timeout);
        }
    }, [slideIndex]);

    const ViewsItem = (
        <BadgeContainer>
            <Eye className="w-4 h-4 text-blue-400" />
            <span className="font-mono font-bold text-zinc-100 min-w-[4ch] text-right">
                {displayViews.toLocaleString()}
            </span>
            <span className="text-xs text-zinc-400">views</span>
        </BadgeContainer>
    );

    const ThanksItem = (
        <BadgeContainer>
            <span className="text-xs text-zinc-300 font-medium whitespace-nowrap">Thanks for showing love</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
        </BadgeContainer>
    );

    // If still counting, just show the static single item to avoid glitches
    if (!hasCounted) {
        return (
             <div className="h-9 min-w-[170px] flex items-center justify-end overflow-hidden">
                {ViewsItem}
             </div>
        );
    }

    return (
        <div className="h-9 min-w-[180px] overflow-hidden relative">
            {/* The Sliding Container */}
            <div
                className={`flex flex-col w-full absolute top-0 left-0 ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
                style={{ transform: `translateY(-${slideIndex * 36}px)` }} // 36px is h-9
            >
                {/* 0: Views */}
                <div className="h-9 w-full flex items-center justify-center">
                    {ViewsItem}
                </div>
                {/* 1: Thanks */}
                <div className="h-9 w-full flex items-center justify-center">
                    {ThanksItem}
                </div>
                 {/* 2: Views (Clone for loop) */}
                 <div className="h-9 w-full flex items-center justify-center">
                    {ViewsItem}
                </div>
            </div>
        </div>
    );
}
