import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { SimpleCalendar } from './components/SimpleCalendar';
import { Dream, UserProfile, Screen } from './types';
import { getProfile, saveProfile, getDreams, saveDream } from './services/storageService';
import { interpretDream } from './services/geminiService';
import { SPHERE_COST, BOT_USERNAME } from './constants';
import { Send, PlusCircle, Coins, Gift, AlertCircle, Share2, Loader2 } from 'lucide-react';

const App = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [currentDreamText, setCurrentDreamText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastInterpretation, setLastInterpretation] = useState<Dream | null>(null);
  
  // Храним ID текущего пользователя. По умолчанию 'guest', если не в Telegram.
  const [currentUserId, setCurrentUserId] = useState<string | number>('guest');
  
  // Journal State
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    // 1. Initialize Telegram WebApp
    let userId: string | number = 'guest';

    if (window.Telegram?.WebApp) {
      try {
          window.Telegram.WebApp.ready();
          // expand() может вызвать ошибку в обычном браузере, оборачиваем
          window.Telegram.WebApp.expand();
          
          const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
          if (tgUser) {
            userId = tgUser.id;
          }
      } catch (e) {
          console.warn("Telegram WebApp initialization warning:", e);
      }
    }
    
    // Сохраняем ID в стейт, чтобы использовать при сохранении снов
    setCurrentUserId(userId);

    // 2. Load Profile specific to this User ID
    const loadedProfile = getProfile(userId);
    
    // 3. Update profile with latest Telegram info if available (sync name)
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      loadedProfile.telegramId = tgUser.id;
      loadedProfile.username = tgUser.first_name;
      // Сохраняем обновленные метаданные
      saveProfile(loadedProfile, userId);
    }

    // 4. Check for Referral (Incoming)
    const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
    if (startParam && !loadedProfile.isOnboarded) {
      console.log(`User invited by ID: ${startParam}`);
      // Здесь можно начислить бонус за рефералку
      // loadedProfile.spheres += 1;
      // saveProfile(loadedProfile, userId);
    }

    setProfile(loadedProfile);
    setDreams(getDreams(userId));

    if (!loadedProfile.isOnboarded) {
      setActiveScreen('onboarding');
    }
  }, []);

  const handleOnboardingComplete = () => {
    if (profile) {
      const updated = { ...profile, isOnboarded: true };
      setProfile(updated);
      saveProfile(updated, currentUserId);
      setActiveScreen('home');
    }
  };

  const handleInterpret = async () => {
    if (!profile) return;

    if (profile.spheres < SPHERE_COST) {
      alert("Недостаточно Сфер сновидений. Пожалуйста, пополните баланс.");
      setActiveScreen('profile');
      return;
    }

    if (!currentDreamText.trim()) return;

    setIsLoading(true);
    setActiveScreen('processing');

    try {
      const interpretationText = await interpretDream(currentDreamText);
      
      const newDream: Dream = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        text: currentDreamText,
        interpretation: interpretationText,
      };

      // Save Dream
      const updatedDreams = [newDream, ...dreams];
      setDreams(updatedDreams);
      saveDream(newDream, currentUserId);

      // Update Profile
      const updatedProfile = {
        ...profile,
        spheres: profile.spheres - SPHERE_COST,
        totalDreamsAnalyzed: profile.totalDreamsAnalyzed + 1
      };
      setProfile(updatedProfile);
      saveProfile(updatedProfile, currentUserId);

      setLastInterpretation(newDream);
      setCurrentDreamText('');
      setActiveScreen('result');
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Произошла ошибка при анализе.";
      alert(errorMessage);
      setActiveScreen('input');
    } finally {
      setIsLoading(false);
    }
  };

  const addSpheres = (amount: number) => {
    if (!profile) return;
    const updated = { ...profile, spheres: profile.spheres + amount };
    setProfile(updated);
    saveProfile(updated, currentUserId);
    alert(`Вы получили ${amount} Сфер!`);
  };

  const handleInviteFriend = () => {
    const userId = profile?.telegramId || 'unknown_user';
    // The referral link format: t.me/BOT_NAME?start=ref_USERID
    const inviteLink = `https://t.me/${BOT_USERNAME}?start=${userId}`;
    const shareText = "Попробуй толкование снов с помощью ИИ! 🌙";
    
    // Telegram Share URL scheme
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`;

    if (window.Telegram?.WebApp && window.Telegram.WebApp.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
      // Fallback for browser testing
      window.open(shareUrl, '_blank');
    }
  };

  // --- RENDERERS ---

  const renderOnboarding = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-8 animate-fade-in">
      <div className="w-24 h-24 bg-mystic-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.5)]">
        <MoonIcon size={48} className="text-white" />
      </div>
      <div>
        <h1 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-mystic-500 to-purple-300">
          Толкователь Снов
        </h1>
        <p className="text-slate-300 text-lg leading-relaxed">
          Я помогаю осмыслить сновидения через призму психологии, без мистики и эзотерики. 
          Ваши сны — это ключ к пониманию ваших эмоций.
        </p>
      </div>
      <button 
        onClick={handleOnboardingComplete}
        className="w-full py-4 bg-mystic-600 hover:bg-mystic-500 rounded-xl font-semibold text-lg transition-all shadow-lg active:scale-95"
      >
        Начать путь
      </button>
    </div>
  );

  const renderHome = () => (
    <div className="p-6 h-full flex flex-col justify-center items-center">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold mb-2">
          {profile?.username ? `Привет, ${profile.username}` : 'Приветствую, Искатель'}
        </h2>
        <p className="text-slate-400">Готовы заглянуть в глубины своего подсознания?</p>
      </div>

      <div className="relative group w-full max-w-xs">
        <div className="absolute -inset-1 bg-gradient-to-r from-mystic-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
        <button 
          onClick={() => setActiveScreen('input')}
          className="relative w-full py-6 bg-night-800 rounded-2xl border border-slate-700 flex items-center justify-center space-x-3 hover:bg-night-700 transition-all"
        >
          <PlusCircle size={28} className="text-mystic-500" />
          <span className="text-xl font-medium">Описать сон</span>
        </button>
      </div>

      {profile && profile.spheres === 0 && (
        <div className="mt-8 p-4 bg-red-900/20 border border-red-900/50 rounded-lg flex items-start space-x-3 text-red-200 text-sm max-w-xs">
          <AlertCircle size={20} className="shrink-0" />
          <p>У вас закончились Сферы. Пополните баланс в профиле, чтобы продолжить.</p>
        </div>
      )}
    </div>
  );

  const renderInput = () => (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Опишите свой сон</h2>
        <p className="text-slate-400 text-sm">
          Вспомните ключевые моменты, людей, действия и эмоции, которые вы испытывали. Чем больше деталей, тем точнее интерпретация.
        </p>
      </div>
      
      <textarea
        value={currentDreamText}
        onChange={(e) => setCurrentDreamText(e.target.value)}
        placeholder="Мне приснилось, что я иду по длинному коридору..."
        className="flex-1 w-full bg-night-800 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-mystic-500 resize-none"
      />

      <div className="mt-4">
        <button 
          onClick={handleInterpret}
          disabled={!currentDreamText.trim()}
          className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all
            ${currentDreamText.trim() 
              ? 'bg-mystic-600 text-white hover:bg-mystic-500 shadow-lg' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
        >
          <Send size={20} />
          <span>Отправить Мастеру</span>
        </button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-mystic-900 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-mystic-500 rounded-full border-t-transparent animate-spin"></div>
        <MoonIcon size={40} className="absolute inset-0 m-auto text-mystic-500 animate-pulse" />
      </div>
      <h3 className="text-xl font-medium mb-2">Связь с подсознанием...</h3>
      <p className="text-slate-400 animate-pulse">Мастер сновидений анализирует ваши образы.</p>
    </div>
  );

  const renderResult = () => {
    if (!lastInterpretation) return null;
    return (
      <div className="p-4 min-h-full pb-24">
        <div className="bg-night-800 rounded-2xl p-6 shadow-xl border border-slate-700">
          <div className="flex items-center space-x-2 mb-6 border-b border-slate-700 pb-4">
            <div className="p-2 bg-mystic-900 rounded-lg">
              <MoonIcon size={20} className="text-mystic-500" />
            </div>
            <h2 className="text-lg font-bold">Интерпретация</h2>
          </div>
          
          <div className="prose prose-invert prose-sm max-w-none prose-headings:text-mystic-200 prose-p:text-slate-300 prose-li:text-slate-300">
             <div className="whitespace-pre-wrap leading-relaxed text-sm text-slate-200">
              {lastInterpretation.interpretation}
             </div>
          </div>
        </div>

        <button 
          onClick={() => setActiveScreen('home')}
          className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-medium transition-colors"
        >
          Вернуться назад
        </button>
      </div>
    );
  };

  const renderJournal = () => {
    const filteredDreams = dreams.filter(d => {
      if (!selectedDate) return true;
      const dDate = new Date(d.date);
      return dDate.getDate() === selectedDate.getDate() &&
             dDate.getMonth() === selectedDate.getMonth() &&
             dDate.getFullYear() === selectedDate.getFullYear();
    });

    return (
      <div className="p-4 min-h-full">
        <h2 className="text-2xl font-bold mb-6">Дневник</h2>
        
        <SimpleCalendar 
          dreams={dreams} 
          selectedDate={selectedDate} 
          onSelectDate={setSelectedDate} 
        />

        <div className="space-y-4">
          {filteredDreams.length === 0 ? (
            <div className="text-center text-slate-500 py-10">
              <p>На эту дату записей нет.</p>
            </div>
          ) : (
            filteredDreams.map(dream => (
              <div key={dream.id} className="bg-night-800 rounded-xl p-4 border border-slate-800 hover:border-slate-600 transition-colors cursor-pointer"
                onClick={() => {
                   setLastInterpretation(dream);
                   setActiveScreen('result');
                }}
              >
                <div className="text-xs text-mystic-400 mb-2">
                  {new Date(dream.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <p className="text-sm text-slate-300 line-clamp-2 italic mb-2">"{dream.text}"</p>
                <div className="text-xs text-slate-500">Нажмите, чтобы прочитать толкование</div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    if (!profile) return null;
    return (
      <div className="p-6 h-full pb-20">
        <h2 className="text-2xl font-bold mb-8">Личный профиль</h2>
        
        <div className="bg-gradient-to-br from-night-800 to-night-700 rounded-2xl p-6 border border-slate-700 mb-8 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <MoonIcon size={100} />
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 text-sm mb-1">Баланс Сфер</p>
            <div className="text-4xl font-bold text-white flex items-center space-x-2">
               <span>{profile.spheres}</span>
               <div className="w-3 h-3 bg-mystic-500 rounded-full shadow-[0_0_10px_#8b5cf6]"></div>
            </div>
            <p className="text-slate-400 text-sm mt-4">Проанализировано снов: <span className="text-white font-semibold">{profile.totalDreamsAnalyzed}</span></p>
            <p className="text-xs text-slate-600 mt-2">ID: {currentUserId}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-slate-200">Пополнить баланс</h3>
          
          <div className="grid grid-cols-3 gap-3">
            {[10, 30, 50].map((amount) => (
              <button 
                key={amount}
                onClick={() => addSpheres(amount)}
                className="bg-night-800 border border-slate-700 p-4 rounded-xl flex flex-col items-center hover:bg-night-700 hover:border-mystic-600 transition-all group"
              >
                <Coins className="text-slate-400 group-hover:text-yellow-400 mb-2 transition-colors" size={24} />
                <span className="font-bold text-lg">{amount}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Сфер</span>
              </button>
            ))}
          </div>

          <button 
             onClick={handleInviteFriend}
             className="w-full mt-4 bg-gradient-to-r from-indigo-900 to-purple-900 border border-slate-700 p-4 rounded-xl flex items-center justify-between hover:from-indigo-800 hover:to-purple-800 transition-all active:scale-95"
          >
            <div className="flex items-center space-x-3">
              <Gift className="text-pink-400" />
              <div className="text-left">
                <div className="font-semibold text-sm">Получить бесплатно</div>
                <div className="text-xs text-slate-400">Пригласить друга</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold bg-white/10 px-2 py-1 rounded text-white">+3</span>
              <Share2 size={16} className="text-slate-400" />
            </div>
          </button>
          
          <p className="text-xs text-center text-slate-600 mt-2">
            Сферы начисляются, когда друг запустит бот по вашей ссылке.
          </p>
        </div>
      </div>
    );
  };

  const renderHelp = () => (
    <div className="p-6 h-full overflow-y-auto pb-20">
        <h2 className="text-2xl font-bold mb-6">Помощь</h2>
        <div className="space-y-6 text-sm text-slate-300">
            <section>
                <h3 className="text-lg font-semibold text-white mb-2">Как это работает?</h3>
                <p>Вы описываете свой сон, а наш ИИ-аналитик разбирает его на образы и эмоции, предлагая психологическую интерпретацию.</p>
            </section>
            <section>
                <h3 className="text-lg font-semibold text-white mb-2">Что такое Сферы?</h3>
                <p>Сферы — это энергия, необходимая для толкования. 1 Сон = 1 Сфера. Мы дарим вам 3 Сферы при регистрации.</p>
            </section>
            <section>
                <h3 className="text-lg font-semibold text-white mb-2">Реферальная программа</h3>
                <p>Нажмите "Получить бесплатно" в профиле, чтобы отправить ссылку другу. Когда друг перейдет по ссылке и нажмет "Старт" в боте, вам начислятся 3 Сферы.</p>
            </section>
            <section className="bg-night-800 p-4 rounded-xl border border-slate-700 mt-8">
                <p className="italic text-slate-400 text-center">"Сон — это скрытая маленькая дверь, ведущая в самые потаенные и сокровенные уголки души." — Карл Юнг</p>
            </section>
        </div>
    </div>
  );

  // --- MAIN RENDER ---
  
  if (!profile) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-night-900 text-white">
          <Loader2 className="w-8 h-8 animate-spin text-mystic-500" />
        </div>
      );
  }

  if (activeScreen === 'onboarding') {
      return renderOnboarding();
  }

  return (
    <Layout activeScreen={activeScreen} onNavigate={setActiveScreen}>
      {activeScreen === 'home' && renderHome()}
      {activeScreen === 'input' && renderInput()}
      {activeScreen === 'processing' && renderProcessing()}
      {activeScreen === 'result' && renderResult()}
      {activeScreen === 'journal' && renderJournal()}
      {activeScreen === 'profile' && renderProfile()}
      {activeScreen === 'help' && renderHelp()}
    </Layout>
  );
};

const MoonIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

export default App;