import React, { useEffect, useState } from 'react';

const StoreHero = ({ store, showNameOnHero }) => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const hero = isMobile && store?.mobileHero ? store.mobileHero : store?.hero;
  const overlay = typeof hero?.overlay === 'number' ? hero.overlay : 0.25;

  if (!hero) {
    return (
      <div className="w-full bg-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-10">
          {showNameOnHero && <h1 className="text-2xl md:text-3xl font-bold">{store?.name || 'חנות'}</h1>}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden">
      {hero.type === 'image' && (
        <img
          src={hero.imageUrl}
          alt={store?.name || 'באנר חנות'}
          className="w-full h-44 sm:h-56 md:h-72 lg:h-80 object-cover"
          loading="lazy"
        />
      )}

      {hero.type === 'video' && (
        <video
          className="w-full h-44 sm:h-56 md:h-72 lg:h-80 object-cover"
          src={hero.videoUrl}
          muted
          loop
          playsInline
          autoPlay
        />
      )}

      {hero.type === 'slider' && (
        <div className="w-full h-44 sm:h-56 md:h-72 lg:h-80 relative">
          <img
            src={hero.slides?.[0]?.imageUrl}
            alt={store?.name || 'באנר חנות'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${overlay})` }} />

      {showNameOnHero && (
        <div className="absolute inset-0">
          <div className="max-w-7xl mx-auto h-full px-3 sm:px-4 md:px-6 flex items-end pb-4">
            <div className="text-white">
              <div className="flex items-center gap-3">
                {store?.logoUrl && (
                  <img
                    src={store.logoUrl}
                    alt={store?.name || 'לוגו חנות'}
                    className="w-12 h-12 rounded-full ring-2 ring-white/70 object-cover"
                    loading="lazy"
                  />
                )}
                <h1 className="text-2xl md:text-3xl font-bold">{store?.name}</h1>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreHero;
