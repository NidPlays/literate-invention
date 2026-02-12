import React, { useState, useEffect } from 'react';
import { Heart, Stars, Sparkles, Music, Cherry, Frown } from 'lucide-react';

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
    const randomX = Math.random() * 80 + 10; // Random position between 10% and 90% of screen width
    const randomY = Math.random() * 80 + 10; // Random position between 10% and 90% of screen height
    
    setNoButtonPosition({
      position: 'fixed',
      left: `${randomX}%`,
      top: `${randomY}%`,
      transition: 'all 0.3s ease' // Smooth animation
    });
  };

  // Calculate the size of the Yes button
  const getYesButtonSize = () => {
    return noCount * 20 + 16; // Base 16px, grows by 20px each time
  };

  // Generate random cherry blossoms
  const [petals, setPetals] = useState([]);
  useEffect(() => {
    const newPetals = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: Math.random() * 5 + 5,
      delay: Math.random() * 5
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center overflow-hidden font-sans relative selection:bg-pink-200">
      
      {/* CSS for animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Mochiy+Pop+One&family=Nunito:wght@400;600;800&display=swap');
        
        body {
          font-family: 'Nunito', sans-serif;
        }
        
        h1, h2, .cute-font {
          font-family: 'Mochiy Pop One', sans-serif;
        }

        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }

        .petal {
          position: absolute;
          top: -10px;
          width: 15px;
          height: 15px;
          background: #ffb7c5;
          border-radius: 100% 0 100% 0;
          opacity: 0.8;
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          z-index: 0;
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .bounce-anim {
          animation: bounce-slow 2s infinite ease-in-out;
        }
      `}</style>

      {/* Cherry Blossom Background */}
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="petal"
          style={{
            left: `${petal.left}%`,
            animationDuration: `${petal.animationDuration}s`,
            animationDelay: `${petal.delay}s`
          }}
        />
      ))}

      {/* Main Card Content */}
      <div className="z-10 text-center p-8 max-w-4xl w-full mx-auto">
        
        {yesPressed ? (
          /* SUCCESS STATE */
          <div className="flex flex-col items-center animate-in zoom-in duration-500 w-full">
            <div className="relative mb-8">
               {/* Happy Mochi Character SVG */}
               <svg width="200" height="200" viewBox="0 0 200 200" className="bounce-anim drop-shadow-xl">
                <circle cx="100" cy="110" r="90" fill="#ffffff" /> {/* Body */}
                <ellipse cx="100" cy="170" rx="70" ry="15" fill="#e2e2e2" opacity="0.5" /> {/* Shadow */}
                
                {/* Cheeks */}
                <circle cx="55" cy="115" r="12" fill="#ff9eb5" opacity="0.6" />
                <circle cx="145" cy="115" r="12" fill="#ff9eb5" opacity="0.6" />
                
                {/* Happy Eyes */}
                <path d="M 45 90 Q 60 70 75 90" stroke="#333" strokeWidth="5" fill="none" strokeLinecap="round" />
                <path d="M 125 90 Q 140 70 155 90" stroke="#333" strokeWidth="5" fill="none" strokeLinecap="round" />
                
                {/* Mouth */}
                <path d="M 85 115 Q 100 135 115 115" stroke="#333" strokeWidth="5" fill="none" strokeLinecap="round" />
                
                {/* Hearts floating around */}
                <g className="animate-pulse">
                   <path d="M160 50 L170 40 L180 50 L170 60 Z" fill="#ff5e78" />
                   <path d="M30 60 L40 50 L50 60 L40 70 Z" fill="#ff5e78" />
                </g>
              </svg>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-pink-600 mb-6 drop-shadow-sm">
              Yay!! I knew it! <br/>
              <span className="text-2xl md:text-4xl mt-4 block text-pink-500">Saranghae! (사랑해) 💖</span>
              <span className="text-lg md:text-2xl mt-2 block text-pink-400">Daisuki! (大好き)</span>
            </h1>

            {/* COUPON CARD */}
            <div className="bg-white border-4 border-dashed border-pink-400 p-6 rounded-lg shadow-2xl transform -rotate-2 hover:rotate-0 transition-all duration-300 max-w-md w-full mx-4 mt-6 relative overflow-hidden group cursor-pointer">
              <div className="absolute top-0 right-0 bg-pink-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold z-10">
                VALID FOREVER
              </div>
              
              {/* Decorative circles to make it look like a ticket */}
              <div className="absolute -left-3 top-1/2 w-6 h-6 bg-pink-50 rounded-full"></div>
              <div className="absolute -right-3 top-1/2 w-6 h-6 bg-pink-50 rounded-full"></div>

              <div className="flex items-center gap-4 relative z-0">
                 <div className="text-5xl filter drop-shadow-md animate-bounce">🛍️</div>
                 <div className="text-left flex-1">
                    <h2 className="text-2xl font-bold text-pink-600 uppercase tracking-wider cute-font">Valentine Gift</h2>
                    <div className="flex items-baseline gap-1">
                      <p className="text-4xl font-extrabold text-gray-800 my-1">$50.00</p>
                      <span className="text-sm text-gray-500 font-bold">OFF</span>
                    </div>
                    <p className="text-sm text-pink-400 font-bold leading-tight">Buy Anything Coupon!<br/>(Makeup, Food, Clothes, etc.)</p>
                 </div>
              </div>
              
              <div className="mt-4 border-t-2 border-pink-100 pt-2 text-xs text-gray-400 flex justify-between font-mono">
                <span>ID: LOVE-U-9000</span>
                <span className="group-hover:text-pink-500 transition-colors">*Redeemable next time we meet ❤️</span>
              </div>
            </div>
            
            <div className="flex gap-4 items-center justify-center mt-8">
               <span className="text-6xl animate-bounce">😽</span>
               <span className="text-6xl animate-bounce delay-100">🎉</span>
               <span className="text-6xl animate-bounce delay-200">🍜</span>
            </div>
            
            <p className="mt-8 text-xl text-gray-700 font-medium">
              See you on the 14th, cutie! 
            </p>
          </div>
        ) : (
          /* QUESTION STATE */
          <div className="flex flex-col items-center">
            
            <div className="mb-8 relative transition-all duration-300">
              {/* Dynamic Mochi Character SVG */}
              <svg width="180" height="180" viewBox="0 0 200 200" className="drop-shadow-lg">
                <circle cx="100" cy="110" r="90" fill="#ffffff" /> {/* Body */}
                <ellipse cx="100" cy="170" rx="70" ry="15" fill="#e2e2e2" opacity="0.5" /> {/* Shadow */}
                
                {/* Cheeks */}
                <circle cx="55" cy="120" r="10" fill="#ffb7c5" opacity="0.6" />
                <circle cx="145" cy="120" r="10" fill="#ffb7c5" opacity="0.6" />

                {noCount === 0 ? (
                  // Neutral/Happy Face
                  <g>
                    <circle cx="65" cy="95" r="8" fill="#333" />
                    <circle cx="135" cy="95" r="8" fill="#333" />
                    <path d="M 90 120 Q 100 130 110 120" stroke="#333" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </g>
                ) : noCount < 5 ? (
                  // Worried Face
                  <g>
                    <circle cx="65" cy="95" r="8" fill="#333" />
                    <circle cx="135" cy="95" r="8" fill="#333" />
                    <path d="M 125 80 L 145 85" stroke="#333" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 75 80 L 55 85" stroke="#333" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="100" cy="125" r="5" fill="#333" />
                    {/* Sweat drop */}
                    <path d="M 160 80 Q 165 95 160 110" stroke="#87CEEB" strokeWidth="4" fill="none" />
                  </g>
                ) : (
                  // Crying Face
                  <g>
                     <path d="M 55 95 L 75 95" stroke="#333" strokeWidth="4" strokeLinecap="round" />
                     <path d="M 125 95 L 145 95" stroke="#333" strokeWidth="4" strokeLinecap="round" />
                     {/* Tears */}
                     <path d="M 65 105 Q 60 120 65 135" stroke="#87CEEB" strokeWidth="4" fill="#E0F7FA" />
                     <path d="M 135 105 Q 140 120 135 135" stroke="#87CEEB" strokeWidth="4" fill="#E0F7FA" />
                     {/* Squiggly mouth */}
                     <path d="M 85 125 Q 92 120 100 125 T 115 125" stroke="#333" strokeWidth="4" fill="none" />
                  </g>
                )}
              </svg>
              
              {/* Cute sparkles around head */}
              <div className="absolute top-0 right-0 animate-pulse">
                <Sparkles className="text-yellow-400 w-8 h-8" />
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-pink-600 mb-4 drop-shadow-sm leading-tight">
              Will you be my Valentine? <br/>
              <span className="text-xl md:text-2xl font-normal text-pink-400 mt-2 block">
                (バレンタインになってくれる？)
              </span>
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-8 w-full">
              {/* YES BUTTON */}
              <button
                className={`bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 cute-font
                  ${noCount > 0 ? "animate-pulse" : ""}`}
                style={{ fontSize: getYesButtonSize() }}
                onClick={() => setYesPressed(true)}
              >
                Yes! (はい!)
              </button>

              {/* NO BUTTON */}
              <button
                onClick={handleNoClick}
                style={noButtonPosition ? { ...noButtonPosition, zIndex: 50 } : {}}
                className="bg-red-400 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-2xl shadow-md transition-all duration-300 cute-font"
              >
                {noCount === 0 ? "No" : phrases[currentTextIndex]}
              </button>
            </div>
            
            {/* Funny Helper text if they persist on No */}
            {noCount > 3 && (
               <div className="mt-8 text-gray-500 text-sm animate-bounce">
                  ( The "Yes" button is getting pretty big... hint hint 😉 )
               </div>
            )}
          </div>
        )}
      </div>

      {/* Decorative Footer */}
      <div className="fixed bottom-4 text-pink-300 text-xs flex items-center gap-2 opacity-60">
        <Cherry size={16} />
        <span>Made with love (and code)</span>
        <Heart size={16} fill="currentColor" />
      </div>

    </div>
  );
};

export default ValentineApp;