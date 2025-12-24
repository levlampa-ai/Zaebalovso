import React, { useRef, useState, useEffect } from 'react';
import { SnakeGame } from './components/SnakeGame';

// === ASSETS CONFIGURATION ===
const VIDEO_PATH = "https://www.dropbox.com/scl/fi/rq5s4jemyhrcbbokz7p42/bag.mp4?rlkey=6q0rrx421iwot9pvrk7pr8355&st=66ri8yfh&raw=1"; 
const AVATAR_PATH = "https://s5.iimage.su/s/24/g9yGkrEx5th3z8IcUzGziwu0OX6CpryP8vqDzUti.gif";
const MUSIC_PATH = "https://www.dropbox.com/scl/fi/8ouenvig8iao93l49r7r8/myz.mp3?rlkey=rqmfxmihssonunuu7fkmqyf84&st=yo445j32&raw=1";
// ============================

const SoundIcon = ({ isPlaying }: { isPlaying: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    {isPlaying ? (
      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 2.75 2.75 0 000-11.668.75.75 0 010-1.06zM15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
    ) : (
      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 101.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 10-1.06-1.06l-1.72 1.72-1.72-1.72z" />
    )}
  </svg>
);

export default function App() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Пытаемся запустить музыку сразу и вешаем слушатель на первый клик
  useEffect(() => {
    const startAudio = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setHasInteracted(true);
          })
          .catch(() => {
            console.log("Ожидание взаимодействия для воспроизведения...");
          });
      }
    };

    // Пробуем при загрузке
    startAudio();

    // Слушаем любой клик по окну
    window.addEventListener('click', startAudio, { once: true });
    window.addEventListener('touchstart', startAudio, { once: true });

    return () => {
      window.removeEventListener('click', startAudio);
      window.removeEventListener('touchstart', startAudio);
    };
  }, [isPlaying]);

  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation(); // Чтобы не срабатывали лишние слушатели
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4 bg-black font-sans selection:bg-white/20">
      
      {/* Background Video */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video 
          id="myVideo"
          autoPlay 
          muted 
          loop 
          playsInline 
          className="w-full h-full object-cover opacity-50 scale-105"
        >
          <source src={VIDEO_PATH} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
      </div>

      {/* Background Audio */}
      <audio 
        id="bgMusic" 
        ref={audioRef} 
        loop 
        preload="auto"
      >
        <source src={MUSIC_PATH} type="audio/mpeg" />
      </audio>
      
      {/* Sound Toggle Button */}
      <button 
        onClick={toggleMusic}
        className="absolute top-8 right-8 z-50 bg-white/10 backdrop-blur-2xl border border-white/30 p-5 rounded-full hover:bg-white/20 transition-all duration-300 text-white shadow-2xl active:scale-90 group"
        title={isPlaying ? "Выключить музыку" : "Включить музыку"}
      >
        <SoundIcon isPlaying={isPlaying} />
      </button>

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-5xl bg-white/10 backdrop-blur-[45px] rounded-[3rem] border border-white/20 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row min-h-[600px] animate-in fade-in slide-in-from-bottom-10 duration-1000">
        
        {/* Left: Profile Info */}
        <div className="w-full md:w-[45%] p-12 flex flex-col items-center justify-center text-center bg-white/5 border-b md:border-b-0 md:border-r border-white/10">
          
          {/* Avatar Area */}
          <div className="relative group mb-10 w-44 h-44 md:w-60 md:h-60">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-70 transition duration-1000 animate-pulse"></div>
            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white/60 shadow-2xl bg-black flex items-center justify-center">
              <img 
                src={AVATAR_PATH} 
                alt="Lord of Crime Avatar" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
                loading="eager"
                onError={(e) => {
                  console.error("Ошибка загрузки аватарки");
                  (e.target as HTMLImageElement).src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                }}
              />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-8 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
            lord of crime
          </h1>

          <div className="space-y-4 w-full max-w-sm">
            <div className="flex justify-between items-center bg-white/5 px-6 py-4 rounded-2xl border border-white/10 text-white hover:bg-white/10 transition-all">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Возраст</span>
              <span className="font-black text-lg">14 годиков</span>
            </div>
            <div className="flex justify-between items-center bg-white/5 px-6 py-4 rounded-2xl border border-white/10 text-white hover:bg-white/10 transition-all">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Язык</span>
              <span className="font-black text-lg">Russian</span>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl text-left border border-white/10 text-white hover:bg-white/10 transition-all group/info">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block mb-3">О себе</span>
              <p className="text-sm font-medium leading-relaxed text-white/80">
                Активно погружаюсь в мир кодинга. Изучаю <span className="text-blue-400 font-black">Python</span> и <span className="text-yellow-400 font-black">JavaScript</span>. 
              </p>
            </div>
          </div>
        </div>

        {/* Right: Snake Game */}
        <div className="w-full md:w-[55%] p-10 flex items-center justify-center bg-black/10">
          <SnakeGame />
        </div>

      </div>

      <div className="absolute bottom-8 text-white/20 text-[10px] uppercase tracking-[0.6em] font-black z-10 pointer-events-none">
        &copy; {new Date().getFullYear()} LORD OF CRIME • BIO • DEV
      </div>

      {/* Invisible Overlay for initial audio play if browser blocked it */}
      {!hasInteracted && (
        <div className="fixed inset-0 z-[100] cursor-pointer" aria-hidden="true" />
      )}
    </div>
  );
}
