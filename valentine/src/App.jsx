import React, { useState, useEffect } from 'react';

const ValentineApp = () => {
  const [noCount, setNoCount] = useState(0);
  const [yesPressed, setYesPressed] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [noButtonPosition, setNoButtonPosition] = useState(null);

  const phrases = [
    "No",
    "Are you sure? (本気？)",
    "Really sure? (진짜로?)",
    "Think again! (考え直して！)",
    "Last chance! (最後のチャンス！)",
    "Surely not? (まさか...)",
    "You might regret this! (後悔するよ！)",
    "Give it another thought!",
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

  const handleNoClick = () => {
    setNoCount(noCount + 1);
    setCurrentTextIndex(prev => (prev + 1) % phrases.length);
    const randomX = Math.random() * 60 + 20;
    const randomY = Math.random() * 60 + 20;
    setNoButtonPosition({
      position: 'fixed',
      left: `${randomX}%`,
      top: `${randomY}%`,
      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
    });
  };

  const getYesButtonSize = () => Math.min(noCount * 16 + 18, 56);
  const getYesButtonPadding = () => {
    const m = getYesButtonSize() / 18;
    return `${0.6 * m}em ${1.3 * m}em`;
  };

  const [petals, setPetals] = useState([]);
  useEffect(() => {
    setPetals(Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: Math.random() * 6 + 8,
      delay: Math.random() * 10,
      size: Math.random() * 8 + 10,
    })));
  }, []);

  const MochiCharacter = ({ mood, size = 220 }) => (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ filter: 'drop-shadow(0 8px 24px rgba(199,140,160,0.25))' }}>
      <defs>
        <linearGradient id="body" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#FFF5F8" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="168" rx="60" ry="10" fill="#F0E0E8" opacity="0.4" />
      <circle cx="100" cy="108" r="82" fill="url(#body)" stroke="#F2C4D0" strokeWidth="1.5" />
      <circle cx="58" cy="118" r="11" fill="#FFCAD8" opacity="0.55" />
      <circle cx="142" cy="118" r="11" fill="#FFCAD8" opacity="0.55" />
      {mood === 'happy' ? (
        <g>
          <path d="M 50 88 Q 63 72 76 88" stroke="#3a3a3a" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M 124 88 Q 137 72 150 88" stroke="#3a3a3a" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M 82 116 Q 100 136 118 116" stroke="#3a3a3a" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        </g>
      ) : mood === 'worried' ? (
        <g>
          <circle cx="68" cy="92" r="7" fill="#3a3a3a" />
          <circle cx="132" cy="92" r="7" fill="#3a3a3a" />
          <circle cx="70" cy="90" r="2.5" fill="#fff" />
          <circle cx="134" cy="90" r="2.5" fill="#fff" />
          <path d="M 58 78 L 78 82" stroke="#3a3a3a" strokeWidth="3" strokeLinecap="round" />
          <path d="M 142 78 L 122 82" stroke="#3a3a3a" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="100" cy="124" rx="5" ry="7" fill="#3a3a3a" />
          <path d="M 155 76 Q 158 90 155 100" stroke="#A8D8C8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </g>
      ) : mood === 'crying' ? (
        <g>
          <path d="M 56 92 L 80 92" stroke="#3a3a3a" strokeWidth="4" strokeLinecap="round" />
          <path d="M 120 92 L 144 92" stroke="#3a3a3a" strokeWidth="4" strokeLinecap="round" />
          <path d="M 68 102 Q 62 118 68 132" stroke="#A8D8C8" strokeWidth="4" fill="rgba(168,216,200,0.2)" strokeLinecap="round" />
          <path d="M 132 102 Q 138 118 132 132" stroke="#A8D8C8" strokeWidth="4" fill="rgba(168,216,200,0.2)" strokeLinecap="round" />
          <path d="M 84 126 Q 92 121 100 124 Q 108 127 116 122" stroke="#3a3a3a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <circle cx="68" cy="92" r="7.5" fill="#3a3a3a" />
          <circle cx="132" cy="92" r="7.5" fill="#3a3a3a" />
          <circle cx="70" cy="90" r="2.5" fill="#fff" />
          <circle cx="134" cy="90" r="2.5" fill="#fff" />
          <path d="M 88 118 Q 100 130 112 118" stroke="#3a3a3a" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );

  const getMood = () => {
    if (yesPressed) return 'happy';
    if (noCount === 0) return 'neutral';
    if (noCount < 5) return 'worried';
    return 'crying';
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(160deg, #FFF9FB 0%, #FFF0F4 35%, #F8F0FF 65%, #F0FBF8 100%)',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&family=Noto+Serif+JP:wght@400;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'DM Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        @keyframes sakura {
          0% { transform: translateY(-5vh) translateX(0) rotate(0deg); opacity: 0.8; }
          25% { transform: translateY(25vh) translateX(12px) rotate(90deg); }
          50% { transform: translateY(50vh) translateX(-8px) rotate(180deg); opacity: 0.6; }
          75% { transform: translateY(75vh) translateX(16px) rotate(270deg); }
          100% { transform: translateY(105vh) translateX(4px) rotate(360deg); opacity: 0; }
        }

        @keyframes gentle-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse-ring {
          0% { box-shadow: 0 4px 16px rgba(168,216,200,0.4), 0 0 0 0 rgba(168,216,200,0.5); }
          70% { box-shadow: 0 4px 16px rgba(168,216,200,0.4), 0 0 0 16px rgba(168,216,200,0); }
          100% { box-shadow: 0 4px 16px rgba(168,216,200,0.4), 0 0 0 0 rgba(168,216,200,0); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .petal {
          position: fixed;
          border-radius: 100% 0 100% 0;
          background: linear-gradient(135deg, #FFD6E4 30%, #FFBDD0 100%);
          animation: sakura linear infinite;
          pointer-events: none;
          z-index: 1;
          opacity: 0.6;
        }

        .content { position: relative; z-index: 10; text-align: center; padding: 2rem 1.5rem; max-width: 600px; width: 100%; }

        .title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 700;
          color: #C4627A;
          line-height: 1.15;
          letter-spacing: -0.02em;
        }

        .subtitle {
          font-family: 'Noto Serif JP', serif;
          color: #C4A0B0;
          font-weight: 400;
        }

        .btn-yes {
          background: linear-gradient(135deg, #9DD8C0 0%, #7CCDB0 100%);
          color: #fff;
          border: none;
          border-radius: 60px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          letter-spacing: 0.03em;
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 16px rgba(124,205,176,0.35);
          position: relative;
          overflow: hidden;
        }
        .btn-yes:hover {
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 8px 28px rgba(124,205,176,0.5);
        }
        .btn-yes:active { transform: scale(0.97); }
        .btn-yes.pulse { animation: pulse-ring 2s ease-out infinite; }

        .btn-no {
          background: linear-gradient(135deg, #F5C0D0 0%, #ECA5B8 100%);
          color: #fff;
          border: none;
          border-radius: 60px;
          padding: 0.85em 2em;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 1rem;
          letter-spacing: 0.02em;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 14px rgba(236,165,184,0.3);
        }
        .btn-no:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 6px 20px rgba(236,165,184,0.45);
        }

        .coupon {
          background: #fff;
          border-radius: 20px;
          padding: 2rem 2rem 1.5rem;
          max-width: 380px;
          width: 100%;
          margin: 2.5rem auto 0;
          position: relative;
          box-shadow: 0 8px 40px rgba(199,140,160,0.12), 0 1px 3px rgba(199,140,160,0.08);
          border: 1.5px solid rgba(242,196,208,0.4);
          transition: all 0.4s ease;
          overflow: hidden;
        }
        .coupon:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 56px rgba(199,140,160,0.2), 0 1px 3px rgba(199,140,160,0.1);
        }
        .coupon::before, .coupon::after {
          content: '';
          position: absolute;
          width: 24px;
          height: 24px;
          background: linear-gradient(160deg, #FFF9FB 0%, #FFF0F4 35%, #F8F0FF 65%, #F0FBF8 100%);
          border-radius: 50%;
          top: 50%;
          transform: translateY(-50%);
        }
        .coupon::before { left: -12px; }
        .coupon::after { right: -12px; }

        .coupon-shimmer {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #F5C0D0, #A8D8C8, #D0C0E8, #FFE4B8, #F5C0D0);
          background-size: 200% 100%;
          animation: shimmer 4s linear infinite;
        }

        .hint-text {
          animation: gentle-float 3s ease-in-out infinite;
          color: #C4A0B0;
        }

        .footer-pill {
          position: fixed;
          bottom: 1.25rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1.25rem;
          border-radius: 100px;
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(242,196,208,0.3);
          font-size: 0.75rem;
          color: #C4A0B0;
          font-family: 'DM Sans', sans-serif;
          z-index: 20;
        }

        .stagger-1 { animation: fade-up 0.6s ease both; animation-delay: 0.1s; }
        .stagger-2 { animation: fade-up 0.6s ease both; animation-delay: 0.25s; }
        .stagger-3 { animation: fade-up 0.6s ease both; animation-delay: 0.4s; }
        .stagger-4 { animation: fade-up 0.6s ease both; animation-delay: 0.55s; }
        .stagger-5 { animation: fade-up 0.6s ease both; animation-delay: 0.7s; }
      `}</style>

      {/* Sakura petals */}
      {petals.map(p => (
        <div key={p.id} className="petal" style={{
          left: `${p.left}%`,
          width: p.size,
          height: p.size,
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
        }} />
      ))}

      <div className="content">
        {yesPressed ? (
          /* ---- SUCCESS ---- */
          <div>
            <div className="stagger-1" style={{ animation: 'gentle-float 3.5s ease-in-out infinite' }}>
              <MochiCharacter mood="happy" size={200} />
            </div>

            <h1 className="title stagger-2" style={{ fontSize: 'clamp(2.2rem, 6vw, 3.8rem)', marginTop: '1.5rem' }}>
              Yay!! I knew it!
            </h1>
            <p className="subtitle stagger-3" style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)', marginTop: '0.75rem' }}>
              사랑해 &middot; 大好き
            </p>

            {/* Coupon Card */}
            <div className="coupon stagger-4">
              <div className="coupon-shimmer" />

              <div style={{ position: 'absolute', top: 12, right: 14, background: 'linear-gradient(135deg, #ECA5B8, #F5C0D0)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: 100, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.05em' }}>
                VALID FOREVER
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', textAlign: 'left' }}>
                <div style={{ fontSize: '2.8rem', flexShrink: 0, animation: 'gentle-float 2.5s ease-in-out infinite' }}>
                  🎁
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '1.1rem', color: '#C4627A', letterSpacing: '0.04em' }}>
                    Valentine Gift
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', margin: '0.2rem 0' }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '2.4rem', color: '#3a3a3a', lineHeight: 1 }}>$50</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7CCDB0' }}>OFF</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#B0A0A8' }}>
                    Makeup, Food, Clothes &mdash; anything!
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1.5px dashed rgba(242,196,208,0.35)', marginTop: '1rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', color: '#C4A0B0' }}>
                <span style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>I-LOVE-YOU-9000</span>
                <span>Redeemable anytime ♡</span>
              </div>
            </div>

            <div className="stagger-5" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '2rem', fontSize: '2.5rem' }}>
              {['🌸', '💗', '🍡'].map((e, i) => (
                <span key={i} style={{ animation: `gentle-float 2.5s ease-in-out infinite`, animationDelay: `${i * 0.25}s` }}>{e}</span>
              ))}
            </div>

            <p className="stagger-5" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: '#C4627A', marginTop: '1.5rem', fontStyle: 'italic' }}>
              See you on the 14th, cutie! ♡
            </p>
          </div>
        ) : (
          /* ---- QUESTION ---- */
          <div>
            <div className="stagger-1" style={{ marginBottom: '2rem', position: 'relative', display: 'inline-block' }}>
              <MochiCharacter mood={getMood()} size={noCount > 3 ? 240 : 220} />
              {noCount === 0 && (
                <>
                  <span style={{ position: 'absolute', top: -8, right: -4, fontSize: '1.8rem', animation: 'gentle-float 3s ease-in-out infinite' }}>🌸</span>
                  <span style={{ position: 'absolute', top: 4, left: -8, fontSize: '1.4rem', animation: 'gentle-float 3s ease-in-out infinite', animationDelay: '0.6s' }}>✨</span>
                </>
              )}
            </div>

            <h1 className="title stagger-2" style={{ fontSize: 'clamp(2rem, 6vw, 3.8rem)' }}>
              Will you be my Valentine?
            </h1>
            <p className="subtitle stagger-3" style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.25rem)', marginTop: '0.6rem', marginBottom: '2.5rem' }}>
              バレンタインになってくれる？
            </p>

            <div className="stagger-3" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1.25rem' }}>
              <button
                className={`btn-yes ${noCount > 0 ? 'pulse' : ''}`}
                style={{ fontSize: `${getYesButtonSize()}px`, padding: getYesButtonPadding() }}
                onClick={() => setYesPressed(true)}
              >
                Yes! はい!
              </button>

              <button
                className="btn-no"
                onClick={handleNoClick}
                style={noButtonPosition ? { ...noButtonPosition, zIndex: 50 } : {}}
              >
                {noCount === 0 ? 'No' : phrases[currentTextIndex]}
              </button>
            </div>

            {noCount > 3 && (
              <p className="hint-text" style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
                ( The "Yes" button is getting pretty big... hint hint 😉 )
              </p>
            )}
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 1.25rem',
        borderRadius: 100,
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(242,196,208,0.3)',
        fontSize: '0.75rem',
        color: '#C4A0B0',
        fontFamily: "'DM Sans', sans-serif",
        zIndex: 20,
        marginTop: '2rem',
        marginBottom: '1.5rem',
      }}>
        <span>🌸</span>
        <span>Made with Love — Nid (+ Claude + Gemini)</span>
        <span>♡</span>
      </div>
    </div>
  );
};

export default ValentineApp;
