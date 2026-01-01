
import React from 'react';

interface Props {
  workStart: string;
  workEnd: string;
  sleepStart: string;
  sleepEnd: string;
  suggestedWorkoutTime: string; // "19:00" formatında
  currentTime: string; // "09:52" formatında
}

export const TimeWheel: React.FC<Props> = ({ workStart, workEnd, sleepStart, sleepEnd, suggestedWorkoutTime, currentTime }) => {
  // Zaman stringini (HH:mm) dakikaya çevirir
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  // Açıyı Radyana çevir
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  // Dilim çizme fonksiyonu
  const getSlicePath = (startStr: string, endStr: string, radius: number, innerRadius: number) => {
    let startMin = toMinutes(startStr);
    let endMin = toMinutes(endStr);

    if (endMin < startMin) {
      endMin += 24 * 60;
    }

    const startAngle = (startMin * 0.25) - 90;
    const endAngle = (endMin * 0.25) - 90;

    const x1 = 50 + radius * Math.cos(toRad(startAngle));
    const y1 = 50 + radius * Math.sin(toRad(startAngle));
    const x2 = 50 + radius * Math.cos(toRad(endAngle));
    const y2 = 50 + radius * Math.sin(toRad(endAngle));

    const x3 = 50 + innerRadius * Math.cos(toRad(endAngle));
    const y3 = 50 + innerRadius * Math.sin(toRad(endAngle));
    const x4 = 50 + innerRadius * Math.cos(toRad(startAngle));
    const y4 = 50 + innerRadius * Math.sin(toRad(startAngle));

    const largeArcFlag = endMin - startMin > 720 ? 1 : 0;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  // Etiket (Text) Pozisyonu Hesaplama
  const getLabelPos = (startStr: string, endStr: string, radius: number) => {
    let startMin = toMinutes(startStr);
    let endMin = toMinutes(endStr);

    if (endMin < startMin) endMin += 24 * 60;

    const midMin = startMin + (endMin - startMin) / 2;
    const midAngle = (midMin * 0.25) - 90;

    // Yazının dilimin ortasına gelmesi için
    const x = 50 + radius * Math.cos(toRad(midAngle));
    const y = 50 + radius * Math.sin(toRad(midAngle));

    return { x, y };
  };

  // Saat Çizgileri
  const renderTicks = () => {
    const ticks = [];
    for (let i = 0; i < 24; i++) {
      const angle = (i * 15) - 90;
      const isMain = i % 6 === 0;
      const isSub = i % 3 === 0; // 3 saatte bir orta boy çizgi
      
      const r1 = isMain ? 42 : (isSub ? 44 : 46);
      const r2 = 48;

      const x1 = 50 + r1 * Math.cos(toRad(angle));
      const y1 = 50 + r1 * Math.sin(toRad(angle));
      const x2 = 50 + r2 * Math.cos(toRad(angle));
      const y2 = 50 + r2 * Math.sin(toRad(angle));

      ticks.push(
        <line 
          key={i} 
          x1={x1} y1={y1} x2={x2} y2={y2} 
          stroke={isMain ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"} 
          strokeWidth={isMain ? 0.6 : 0.3} 
        />
      );

      if (isMain) {
        const textR = 38;
        const textX = 50 + textR * Math.cos(toRad(angle));
        const textY = 50 + textR * Math.sin(toRad(angle));
        ticks.push(
            <text 
                key={`t-${i}`} 
                x={textX} 
                y={textY} 
                fontSize="3" 
                fill="#71717a" 
                textAnchor="middle" 
                alignmentBaseline="middle"
                fontWeight="bold"
            >
                {String(i).padStart(2, '0')}.00
            </text>
        );
      }
    }
    return ticks;
  };

  // Şu anki zaman ibresi
  const renderCurrentTimePointer = () => {
    const min = toMinutes(currentTime);
    const angle = (min * 0.25) - 90;
    
    // İbre uzunluğu (İç çemberden dışa doğru)
    const innerR = 26; // Yazı alanının hemen dışı
    const outerR = 48;

    const x1 = 50 + innerR * Math.cos(toRad(angle));
    const y1 = 50 + innerR * Math.sin(toRad(angle));
    const x2 = 50 + outerR * Math.cos(toRad(angle));
    const y2 = 50 + outerR * Math.sin(toRad(angle));

    return (
        <g>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth="1" strokeLinecap="round" />
            <circle cx={x1} cy={y1} r="1.5" fill="#fff" />
        </g>
    );
  };

  const workoutEndMin = toMinutes(suggestedWorkoutTime) + 90; 
  const workoutEndStr = `${Math.floor(workoutEndMin / 60) % 24}:${(workoutEndMin % 60).toString().padStart(2, '0')}`;

  // Label Positions (Dilimin tam ortasına)
  // Radius değerini 36 vererek dilimin ortasına denk getiriyoruz (24 iç, 48 dış -> ortası 36)
  const workLabel = getLabelPos(workStart, workEnd, 36);
  const sleepLabel = getLabelPos(sleepStart, sleepEnd, 36);
  const workoutLabel = getLabelPos(suggestedWorkoutTime, workoutEndStr, 36);

  return (
    <div className="relative w-full aspect-square max-w-[340px] mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
        {/* Background Circle */}
        <circle cx="50" cy="50" r="48" fill="#18181b" stroke="#27272a" strokeWidth="0.5" />
        
        {/* === SLICES === */}
        {/* Sleep Slice (Blue) */}
        <path d={getSlicePath(sleepStart, sleepEnd, 48, 24)} fill="#3b82f6" fillOpacity="0.8" />
        
        {/* Work Slice (Orange) */}
        <path d={getSlicePath(workStart, workEnd, 48, 24)} fill="#f97316" fillOpacity="0.8" />

        {/* Workout Zone (Purple - Daha dikkat çekici) */}
        <path d={getSlicePath(suggestedWorkoutTime, workoutEndStr, 48, 24)} fill="#a855f7" fillOpacity="0.9" />

        {/* Inner Circle (Clock Background) */}
        <circle cx="50" cy="50" r="24" fill="#000" stroke="#27272a" strokeWidth="1" />

        {/* Ticks */}
        {renderTicks()}

        {/* Live Pointer */}
        {renderCurrentTimePointer()}

        {/* === LABELS === */}
        <text x={workLabel.x} y={workLabel.y} fontSize="3" fill="white" textAnchor="middle" alignmentBaseline="middle" fontWeight="800" style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}>İŞ</text>
        <text x={sleepLabel.x} y={sleepLabel.y} fontSize="3" fill="white" textAnchor="middle" alignmentBaseline="middle" fontWeight="800" style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}>UYKU</text>
        <text x={workoutLabel.x} y={workoutLabel.y} fontSize="2.8" fill="white" textAnchor="middle" alignmentBaseline="middle" fontWeight="900" style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}>SPOR</text>

        {/* Center Clock (Digital) */}
        <text x="50" y="52" fontSize="11" fill="white" textAnchor="middle" alignmentBaseline="middle" fontWeight="900" letterSpacing="-0.5">
            {currentTime}
        </text>
        
        {/* Decorative Ring around clock */}
        <circle cx="50" cy="50" r="21" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

      </svg>
    </div>
  );
};
