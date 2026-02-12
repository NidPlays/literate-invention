import React, { useState, useEffect } from 'react';
import { Heart, Cherry } from 'lucide-react';

const ValentineApp = () => {
  const [noCount, setNoCount] = useState(0);
  const [yesPressed, setYesPressed] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [noButtonPosition, setNoButtonPosition] = useState(null);

  // Japanese/Korean/English mixed phrases for the "No" button
  const phrases = [
    "No",
    "Are you sure? (本気？)",
    "Really sure? (진짜로?)",
    "Think again! (考え直して！)",
    "Last chance! (最後のチャンス！)",
    "Surely not? (まさか...)",
    "You might regret this! (後悔するよ！)",
    "Give it another thought! (もう一度考えて！)",
    "Are you absolutely certain?",
    "This could be a mistake!",
    "Have a heart! (心はないの？)",
    "Don't be so cold! (冷たくしないで！)",
    "Change of heart?",
    "Wouldn't you reconsider?",
    "Is that your final answer?",
    "You're breaking my heart ;(",
    "Pls? (お願い/제발)",
    "Pretty pls? (頼むよ〜)",
    "I'm gonna cry... (泣いちゃうよ)",
    "Ok, I'm sad now (ㅠㅠ)"
  ];

  // Logic to handle the "No" button click
  const handleNoClick = () => {
    setNoCount(noCount + 1);
    setCurrentTextIndex(prev => (prev + 1) % phrases.length);

    // Move the button to a random position for fun
    const randomX = Math.random() * 70 + 15;
    const randomY = Math.random() * 70 + 15;

    setNoButtonPosition({
      position: 'fixed',
      left: `${randomX}%`,
      top: `${randomY}%`,
      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
    });
  };

  // Calculate the size of the Yes button
  const getYesButtonSize = () => {
    const basePx = 18;
    const growthPx = 20;
    const maxSize = 64;
    return Math.min(noCount * growthPx + basePx, maxSize);
  };

  // Calculate padding based on button size
  const getYesButtonPadding = () => {
    const baseSize = getYesButtonSize();
    const paddingMultiplier = baseSize / 18;
    return `${0.7 * paddingMultiplier}em ${1.4 * paddingMultiplier}em`;
  };

  // Generate random cherry blossoms with varied sizes
  const [petals, setPetals] = useState([]);
  useEffect(() => {
    const newPetals = Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: Math.random() * 8 + 7,
      delay: Math.random() * 8,
      size: Math.random() * 10 + 12,
      opacity: Math.random() * 0.4 + 0.5
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">

      {/* CSS for Korean/Japanese Aesthetic */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Shippori+Mincho:wght@400;600;800&family=Black+Han+Sans&family=Nanum+Myeongjo:wght@400;700;800&display=swap');

        :root {
          --hanbok-pink: #FFB3D9;
          --hanbok-mint: #B8E6D5;
          --hanbok-yellow: #FFF4B8;
          --hanbok-lavender: #E6D5F5;
          --washi-cream: #FFF8F0;
          --silk-coral: #FF8FA3;
          --silk-jade: #85E0C8;
          --ink-black: #2D2D2D;
        }

        body {
          font-family: 'Shippori Mincho', serif;
          background: linear-gradient(165deg, var(--washi-cream) 0%, #FFF0F8 30%, #F0F8FF 70%, var(--hanbok-mint) 100%);
          background-attachment: fixed;
        }

        .hanbok-title {
          font-family: 'Black Han Sans', sans-serif;
          letter-spacing: 0.05em;
          text-shadow:
            3px 3px 0px rgba(255, 179, 217, 0.3),
            -1px -1px 0px rgba(184, 230, 213, 0.2);
        }

        .korean-serif {
          font-family: 'Gowun Batang', serif;
        }

        /* Washi paper texture overlay */
        .washi-texture {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image:
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px),
            repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px);
          pointer-events: none;
          z-index: 1;
          opacity: 0.6;
        }

        /* Silk gradient backgrounds */
        .silk-gradient {
          background: linear-gradient(135deg,
            var(--hanbok-pink) 0%,
            var(--silk-coral) 25%,
            var(--hanbok-lavender) 50%,
            var(--hanbok-mint) 75%,
            var(--silk-jade) 100%
          );
          background-size: 400% 400%;
          animation: silk-shimmer 15s ease infinite;
        }

        @keyframes silk-shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Cherry blossom petals - more realistic */
        @keyframes sakura-fall {
          0% {
            transform: translateY(-10vh) translateX(0) rotate(0deg);
            opacity: 1;
          }
          20% {
            transform: translateY(20vh) translateX(10px) rotate(90deg);
          }
          40% {
            transform: translateY(40vh) translateX(-5px) rotate(180deg);
          }
          60% {
            transform: translateY(60vh) translateX(15px) rotate(270deg);
          }
          80% {
            transform: translateY(80vh) translateX(-10px) rotate(360deg);
          }
          100% {
            transform: translateY(110vh) translateX(5px) rotate(450deg);
            opacity: 0;
          }
        }

        .sakura-petal {
          position: absolute;
          background: radial-gradient(ellipse at center, #FFD4E5 0%, #FFB3D9 50%, #FF8FA3 100%);
          border-radius: 100% 0% 100% 0%;
          animation: sakura-fall linear infinite;
          filter: drop-shadow(0 1px 2px rgba(255, 143, 163, 0.3));
          z-index: 2;
        }

        /* Origami fold animations */
        @keyframes origami-float {
          0%, 100% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
          33% {
            transform: translateY(-20px) rotate(3deg) scale(1.05);
          }
          66% {
            transform: translateY(-10px) rotate(-2deg) scale(0.98);
          }
        }

        .origami-float {
          animation: origami-float 4s ease-in-out infinite;
        }

        /* Hanbok-inspired buttons */
        .hanbok-button-yes {
          background: linear-gradient(135deg, var(--silk-jade) 0%, var(--hanbok-mint) 100%);
          box-shadow:
            0 8px 24px rgba(133, 224, 200, 0.4),
            inset 0 2px 0 rgba(255, 255, 255, 0.5),
            inset 0 -2px 8px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
          border: 3px solid rgba(255, 255, 255, 0.6);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .hanbok-button-yes::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 70%
          );
          transform: rotate(45deg);
          animation: silk-shine 3s linear infinite;
        }

        @keyframes silk-shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        .hanbok-button-yes:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow:
            0 12px 32px rgba(133, 224, 200, 0.6),
            inset 0 2px 0 rgba(255, 255, 255, 0.7);
        }

        .hanbok-button-yes.pulsing {
          animation: hanbok-pulse 2s ease-in-out infinite;
        }

        @keyframes hanbok-pulse {
          0%, 100% {
            box-shadow:
              0 8px 24px rgba(133, 224, 200, 0.4),
              0 0 0 0 rgba(133, 224, 200, 0.7);
          }
          50% {
            box-shadow:
              0 12px 32px rgba(133, 224, 200, 0.6),
              0 0 0 20px rgba(133, 224, 200, 0);
          }
        }

        .hanbok-button-no {
          background: linear-gradient(135deg, #FFB3D9 0%, var(--silk-coral) 100%);
          box-shadow:
            0 8px 20px rgba(255, 143, 163, 0.35),
            inset 0 2px 0 rgba(255, 255, 255, 0.4),
            inset 0 -2px 8px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
          border: 3px solid rgba(255, 255, 255, 0.5);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .hanbok-button-no:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow:
            0 10px 28px rgba(255, 143, 163, 0.5),
            inset 0 2px 0 rgba(255, 255, 255, 0.5);
        }

        .hanbok-button-no.teasing {
          animation: no-flutter 1.2s ease-in-out infinite;
        }

        @keyframes no-flutter {
          0%, 100% {
            transform: rotate(0deg);
            box-shadow: 0 8px 20px rgba(255, 143, 163, 0.35);
          }
          25% {
            transform: rotate(-2deg) scale(1.02);
            box-shadow: 0 12px 28px rgba(255, 143, 163, 0.5);
          }
          75% {
            transform: rotate(2deg) scale(1.02);
            box-shadow: 0 12px 28px rgba(255, 143, 163, 0.5);
          }
        }

        /* Traditional Korean coupon card with bojagi (wrapping cloth) style */
        .bojagi-card {
          background:
            linear-gradient(135deg, rgba(255, 248, 240, 0.98) 0%, rgba(255, 244, 235, 0.98) 100%);
          border: 4px solid transparent;
          border-image: linear-gradient(
            135deg,
            var(--hanbok-pink) 0%,
            var(--hanbok-lavender) 25%,
            var(--hanbok-mint) 50%,
            var(--hanbok-yellow) 75%,
            var(--silk-coral) 100%
          ) 1;
          box-shadow:
            0 20px 60px rgba(255, 143, 163, 0.2),
            inset 0 2px 0 rgba(255, 255, 255, 0.8),
            inset 0 0 40px rgba(255, 179, 217, 0.1);
          position: relative;
          backdrop-filter: blur(10px);
          transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .bojagi-card::before {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          background: linear-gradient(
            135deg,
            var(--hanbok-pink) 0%,
            var(--hanbok-lavender) 25%,
            var(--hanbok-mint) 50%,
            var(--hanbok-yellow) 75%,
            var(--silk-coral) 100%
          );
          background-size: 300% 300%;
          animation: bojagi-shimmer 8s ease infinite;
          z-index: -1;
          border-radius: 1.5rem;
          opacity: 0.6;
        }

        @keyframes bojagi-shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .bojagi-card:hover {
          transform: translateY(-12px) rotate(1deg);
          box-shadow:
            0 30px 80px rgba(255, 143, 163, 0.35),
            inset 0 2px 0 rgba(255, 255, 255, 0.9);
        }

        /* Traditional Korean pattern decorations */
        .hanbok-pattern {
          background-image:
            radial-gradient(circle at 20% 50%, rgba(255, 179, 217, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(184, 230, 213, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(255, 244, 184, 0.1) 0%, transparent 50%);
        }

        /* Paper fold effect */
        .paper-fold {
          background: linear-gradient(
            to bottom right,
            rgba(255, 255, 255, 0.3) 0%,
            transparent 50%
          );
        }
      `}</style>

      {/* Washi paper texture overlay */}
      <div className="washi-texture" />

      {/* Animated silk gradient background */}
      <div className="silk-gradient fixed inset-0 opacity-20" style={{ zIndex: 0 }} />

      {/* Cherry Blossom Petals - Enhanced */}
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="sakura-petal"
          style={{
            left: `${petal.left}%`,
            width: `${petal.size}px`,
            height: `${petal.size}px`,
            animationDuration: `${petal.animationDuration}s`,
            animationDelay: `${petal.delay}s`,
            opacity: petal.opacity
          }}
        />
      ))}

      {/* Main Card Content */}
      <div className="relative z-10 text-center p-6 lg:p-12 max-w-5xl w-full mx-auto">

        {yesPressed ? (
          /* SUCCESS STATE */
          <div className="flex flex-col items-center w-full" style={{ animation: 'origami-float 4s ease-in-out infinite' }}>
            <div className="relative mb-8 lg:mb-12">
               {/* Happy Mochi Character SVG - Enhanced with Hanbok colors */}
               <svg width="300" height="300" viewBox="0 0 200 200" className="mx-auto" style={{ filter: 'drop-shadow(0 10px 30px rgba(255, 179, 217, 0.4))' }}>
                {/* Soft glow background */}
                <circle cx="100" cy="110" r="95" fill="url(#happyGlow)" opacity="0.3" />

                <defs>
                  <radialGradient id="happyGlow">
                    <stop offset="0%" stopColor="#FFB3D9" />
                    <stop offset="100%" stopColor="#B8E6D5" />
                  </radialGradient>
                  <linearGradient id="mochiGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#FFF8F0" />
                  </linearGradient>
                </defs>

                {/* Body with gradient */}
                <circle cx="100" cy="110" r="90" fill="url(#mochiGradient)" stroke="#FFB3D9" strokeWidth="2" />
                <ellipse cx="100" cy="170" rx="70" ry="15" fill="#E6D5F5" opacity="0.4" />

                {/* Hanbok-colored cheeks */}
                <circle cx="55" cy="115" r="14" fill="#FFB3D9" opacity="0.7" />
                <circle cx="145" cy="115" r="14" fill="#FFB3D9" opacity="0.7" />

                {/* Happy Eyes */}
                <path d="M 45 90 Q 60 70 75 90" stroke="#2D2D2D" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M 125 90 Q 140 70 155 90" stroke="#2D2D2D" strokeWidth="6" fill="none" strokeLinecap="round" />

                {/* Big happy smile */}
                <path d="M 80 115 Q 100 140 120 115" stroke="#2D2D2D" strokeWidth="6" fill="none" strokeLinecap="round" />

                {/* Floating hearts with hanbok colors */}
                <g style={{ animation: 'origami-float 3s ease-in-out infinite' }}>
                   <path d="M160 50 L170 40 L180 50 L170 60 Z" fill="#FF8FA3" />
                   <path d="M30 60 L40 50 L50 60 L40 70 Z" fill="#85E0C8" />
                   <circle cx="165" cy="80" r="6" fill="#FFF4B8" />
                   <circle cx="45" cy="90" r="5" fill="#E6D5F5" />
                </g>
              </svg>
            </div>

            <h1 className="hanbok-title text-5xl lg:text-8xl mb-8 leading-tight" style={{ color: '#FF8FA3' }}>
              Yay!! I knew it!<br/>
              <span className="text-4xl lg:text-6xl mt-6 block" style={{ color: '#85E0C8' }}>사랑해 Saranghae!</span>
              <span className="text-3xl lg:text-5xl mt-4 block korean-serif" style={{ color: '#E6D5F5' }}>大好き!</span>
            </h1>

            {/* BOJAGI COUPON CARD - Korean wrapping cloth inspired */}
            <div className="bojagi-card p-8 rounded-3xl transform -rotate-1 hover:rotate-0 max-w-md w-full mx-4 mt-10 relative cursor-pointer group hanbok-pattern">
              {/* Korean cloud pattern corner decorations */}
              <div className="absolute top-4 right-4 w-16 h-16 opacity-20" style={{
                background: 'radial-gradient(circle, var(--hanbok-lavender) 20%, transparent 20%)',
                backgroundSize: '8px 8px'
              }}></div>

              <div className="absolute top-3 right-3 text-white text-xs px-3 py-1 rounded-full font-bold z-10 korean-serif" style={{
                background: 'linear-gradient(135deg, #FF8FA3 0%, #FFB3D9 100%)',
                boxShadow: '0 4px 12px rgba(255, 143, 163, 0.4)'
              }}>
                FOREVER ∞
              </div>

              {/* Traditional ticket perforations */}
              <div className="absolute -left-4 top-1/2 w-8 h-8 rounded-full" style={{ background: 'var(--washi-cream)' }}></div>
              <div className="absolute -right-4 top-1/2 w-8 h-8 rounded-full" style={{ background: 'var(--washi-cream)' }}></div>

              <div className="flex items-center gap-6 relative z-0">
                 <div className="text-6xl" style={{ animation: 'origami-float 3s ease-in-out infinite' }}>🎁</div>
                 <div className="text-left flex-1">
                    <h2 className="text-2xl font-bold tracking-wide hanbok-title mb-1" style={{ color: 'var(--silk-coral)' }}>
                      Valentine Gift
                    </h2>
                    <div className="flex items-baseline gap-2 my-2">
                      <p className="text-5xl font-extrabold hanbok-title" style={{ color: 'var(--ink-black)' }}>$50</p>
                      <span className="text-sm font-bold korean-serif" style={{ color: 'var(--silk-jade)' }}>OFF</span>
                    </div>
                    <p className="text-xs korean-serif font-semibold leading-relaxed" style={{ color: 'var(--ink-black)', opacity: 0.6 }}>
                      Makeup, Food, Clothes, etc.
                    </p>
                 </div>
              </div>

              <div className="mt-4 pt-3 text-xs flex justify-between items-center korean-serif" style={{
                borderTop: '2px dashed rgba(255, 179, 217, 0.3)',
                color: 'var(--ink-black)',
                opacity: 0.6
              }}>
                <span className="font-mono">ID: LOVE-9000</span>
                <span className="group-hover:opacity-100 transition-opacity" style={{ color: 'var(--silk-coral)' }}>
                  *Redeemable anytime ♡
                </span>
              </div>
            </div>

            <div className="flex gap-8 items-center justify-center mt-12 text-7xl">
               <span style={{ animation: 'origami-float 2s ease-in-out infinite', animationDelay: '0s' }}>🌸</span>
               <span style={{ animation: 'origami-float 2s ease-in-out infinite', animationDelay: '0.3s' }}>💗</span>
               <span style={{ animation: 'origami-float 2s ease-in-out infinite', animationDelay: '0.6s' }}>🍡</span>
            </div>

            <p className="mt-12 text-3xl korean-serif font-semibold" style={{ color: 'var(--silk-coral)' }}>
              See you on the 14th, cutie! ♡
            </p>
          </div>
        ) : (
          /* QUESTION STATE */
          <div className="flex flex-col items-center">

            <div className="mb-12 relative transition-all duration-500">
              {/* Dynamic Mochi Character SVG - Hanbok themed */}
              <svg width="340" height="340" viewBox="0 0 200 200" className="mx-auto" style={{
                filter: 'drop-shadow(0 15px 40px rgba(255, 179, 217, 0.3))',
                animation: noCount > 3 ? 'origami-float 2s ease-in-out infinite' : 'none'
              }}>
                <defs>
                  <linearGradient id="mochiBody" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#FFF8F0" />
                  </linearGradient>
                  <radialGradient id="softGlow">
                    <stop offset="0%" stopColor={noCount > 5 ? "#FFB3D9" : "#B8E6D5"} stopOpacity="0.3" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>

                {/* Soft background glow */}
                <circle cx="100" cy="110" r="100" fill="url(#softGlow)" />

                {/* Body */}
                <circle cx="100" cy="110" r="90" fill="url(#mochiBody)" stroke="#FFB3D9" strokeWidth="2" />
                <ellipse cx="100" cy="170" rx="70" ry="15" fill="#E6D5F5" opacity="0.3" />

                {/* Hanbok-colored cheeks */}
                <circle cx="55" cy="120" r="12" fill="#FFB3D9" opacity="0.7" />
                <circle cx="145" cy="120" r="12" fill="#FFB3D9" opacity="0.7" />

                {noCount === 0 ? (
                  // Neutral/Hopeful Face
                  <g>
                    <circle cx="65" cy="95" r="9" fill="#2D2D2D" />
                    <circle cx="135" cy="95" r="9" fill="#2D2D2D" />
                    {/* Sparkle in eyes */}
                    <circle cx="68" cy="92" r="3" fill="white" />
                    <circle cx="138" cy="92" r="3" fill="white" />
                    <path d="M 88 120 Q 100 132 112 120" stroke="#2D2D2D" strokeWidth="5" fill="none" strokeLinecap="round" />
                  </g>
                ) : noCount < 5 ? (
                  // Worried Face
                  <g>
                    <ellipse cx="65" cy="95" rx="9" ry="10" fill="#2D2D2D" />
                    <ellipse cx="135" cy="95" rx="9" ry="10" fill="#2D2D2D" />
                    <path d="M 125 78 L 145 83" stroke="#2D2D2D" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 75 78 L 55 83" stroke="#2D2D2D" strokeWidth="4" strokeLinecap="round" />
                    <ellipse cx="100" cy="125" rx="6" ry="8" fill="#2D2D2D" />
                    {/* Sweat drop */}
                    <path d="M 160 75 Q 165 90 162 105" stroke="#B8E6D5" strokeWidth="5" fill="none" strokeLinecap="round" />
                    <circle cx="162" cy="108" r="4" fill="#B8E6D5" />
                  </g>
                ) : (
                  // Crying Face
                  <g>
                     <path d="M 52 95 L 78 95" stroke="#2D2D2D" strokeWidth="5" strokeLinecap="round" />
                     <path d="M 122 95 L 148 95" stroke="#2D2D2D" strokeWidth="5" strokeLinecap="round" />
                     {/* Tears with hanbok colors */}
                     <path d="M 65 105 Q 58 125 65 142" stroke="#B8E6D5" strokeWidth="5" fill="rgba(184, 230, 213, 0.3)" />
                     <path d="M 135 105 Q 142 125 135 142" stroke="#B8E6D5" strokeWidth="5" fill="rgba(184, 230, 213, 0.3)" />
                     {/* Sad mouth */}
                     <path d="M 82 130 Q 92 125 100 123 T 118 130" stroke="#2D2D2D" strokeWidth="5" fill="none" strokeLinecap="round" />
                  </g>
                )}
              </svg>

              {/* Floating cherry blossoms around head */}
              <div className="absolute -top-8 -right-8" style={{ animation: 'origami-float 3s ease-in-out infinite' }}>
                <div className="text-5xl">🌸</div>
              </div>
              <div className="absolute -top-6 -left-6" style={{ animation: 'origami-float 3s ease-in-out infinite', animationDelay: '0.5s' }}>
                <div className="text-4xl">✨</div>
              </div>
            </div>

            <h1 className="hanbok-title text-5xl lg:text-8xl mb-4 leading-tight" style={{ color: 'var(--silk-coral)' }}>
              Will you be my Valentine?
            </h1>
            <p className="korean-serif text-xl lg:text-3xl mb-10" style={{ color: 'var(--hanbok-lavender)', opacity: 0.8 }}>
              バレンタインになってくれる？
            </p>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-10 mt-16 w-full px-4">
              {/* YES BUTTON - Hanbok inspired */}
              <button
                className={`hanbok-button-yes text-white font-bold rounded-full whitespace-nowrap flex-shrink-0 korean-serif tracking-wide
                  ${noCount > 0 ? "pulsing" : ""}`}
                style={{
                  fontSize: `${getYesButtonSize()}px`,
                  padding: getYesButtonPadding(),
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
                onClick={() => setYesPressed(true)}
              >
                네! Yes! はい!
              </button>

              {/* NO BUTTON - Hanbok inspired */}
              <button
                onClick={handleNoClick}
                style={noButtonPosition ? { ...noButtonPosition, zIndex: 50 } : {}}
                className={`hanbok-button-no text-white font-bold py-5 px-10 rounded-full korean-serif text-lg lg:text-2xl flex-shrink-0 tracking-wide ${
                  noCount > 5 ? "teasing" : ""
                }`}
              >
                {noCount === 0 ? "아니요 No" : phrases[currentTextIndex]}
              </button>
            </div>

            {/* Funny Helper text if they persist on No */}
            {noCount > 3 && (
               <div className="mt-12 korean-serif text-lg lg:text-xl font-medium" style={{
                 color: 'var(--silk-coral)',
                 animation: 'origami-float 2s ease-in-out infinite'
               }}>
                  ( The "Yes" button is getting pretty big... hint hint 😉 )
               </div>
            )}
          </div>
        )}
      </div>

      {/* Decorative Footer with Korean/Japanese elements */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 korean-serif text-sm z-20" style={{
        color: 'var(--silk-coral)',
        opacity: 0.6,
        background: 'rgba(255, 248, 240, 0.8)',
        padding: '0.5rem 1.5rem',
        borderRadius: '2rem',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255, 179, 217, 0.3)'
      }}>
        <Cherry size={18} />
        <span>Made with love ♡</span>
        <Heart size={18} fill="currentColor" />
      </div>

    </div>
  );
};

export default ValentineApp;