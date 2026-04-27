"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";

const quotesByLocale: Record<string, { text: string; author: string }[]> = {
  az: [
    { text: "Memarlıq — donmuş musiqidir.", author: "Johann Wolfgang von Goethe" },
    { text: "Biz evlər qururuq, sonra onlar bizi qurur.", author: "Winston Churchill" },
    { text: "Ən böyük memarlıq — insanın ruhunu toxunan binadır.", author: "Frank Lloyd Wright" },
    { text: "Forma funksiyaya tabedir.", author: "Louis Sullivan" },
    { text: "Memarlıq yaşayan sənətdir.", author: "Philip Johnson" },
    { text: "Bir bina ruh daşımalıdır.", author: "Louis Kahn" },
    { text: "Dizayn sadəcə görünüş deyil, necə işlədiyidir.", author: "Steve Jobs" },
    { text: "Həyat ətrafdakı fəzanın keyfiyyətidir.", author: "Arthur Erickson" },
    { text: "Memarlıq həyatın özüdür.", author: "Walter Gropius" },
    { text: "İşıq memarlığın əsas materialıdır.", author: "Le Corbusier" },
    { text: "Sadəlik mükəmməlliyin son mərhələsidir.", author: "Leonardo da Vinci" },
    { text: "Fəza, işıq və nizam — memarlığın üç həqiqətidir.", author: "Le Corbusier" },
    { text: "Yaxşı memarlıq — yaşanmış şeirin ifadəsidir.", author: "Eero Saarinen" },
    { text: "Hər bina bir hekayədir.", author: "Zaha Hadid" },
    { text: "Memarlıq — zamanı daşa yazmaqdır.", author: "John Ruskin" },
  ],
  en: [
    { text: "Architecture is frozen music.", author: "Johann Wolfgang von Goethe" },
    { text: "We shape our buildings; thereafter they shape us.", author: "Winston Churchill" },
    { text: "The greatest architecture touches the human spirit.", author: "Frank Lloyd Wright" },
    { text: "Form follows function.", author: "Louis Sullivan" },
    { text: "Architecture is the art of how to waste space.", author: "Philip Johnson" },
    { text: "A building must bear the imprint of a soul.", author: "Louis Kahn" },
    { text: "Design is not just what it looks like — it's how it works.", author: "Steve Jobs" },
    { text: "Life is the quality of the space that surrounds you.", author: "Arthur Erickson" },
    { text: "Architecture is the will of an epoch translated into space.", author: "Ludwig Mies van der Rohe" },
    { text: "Light is the fundamental material of architecture.", author: "Le Corbusier" },
    { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
    { text: "Space, light and order are the three principles of architecture.", author: "Le Corbusier" },
    { text: "Good architecture is the expression of lived poetry.", author: "Eero Saarinen" },
    { text: "Every building tells a story.", author: "Zaha Hadid" },
    { text: "Architecture is writing history in stone.", author: "John Ruskin" },
  ],
  ru: [
    { text: "Архитектура — это застывшая музыка.", author: "Иоганн Вольфганг фон Гёте" },
    { text: "Мы создаём здания, а потом они создают нас.", author: "Уинстон Черчилль" },
    { text: "Великая архитектура затрагивает душу человека.", author: "Фрэнк Ллойд Райт" },
    { text: "Форма следует за функцией.", author: "Луис Салливан" },
    { text: "Архитектура — это живое искусство.", author: "Филип Джонсон" },
    { text: "Здание должно нести в себе душу.", author: "Луис Кан" },
    { text: "Дизайн — это не внешний вид, а то, как он работает.", author: "Стив Джобс" },
    { text: "Жизнь — это качество окружающего пространства.", author: "Артур Эриксон" },
    { text: "Архитектура — это воля эпохи, воплощённая в пространстве.", author: "Мис ван дер Роэ" },
    { text: "Свет — главный материал архитектуры.", author: "Ле Корбюзье" },
    { text: "Простота — высшая степень совершенства.", author: "Леонардо да Винчи" },
    { text: "Пространство, свет и порядок — три истины архитектуры.", author: "Ле Корбюзье" },
    { text: "Хорошая архитектура — это выражение прожитой поэзии.", author: "Ээро Сааринен" },
    { text: "Каждое здание — это история.", author: "Заха Хадид" },
    { text: "Архитектура — это история, написанная в камне.", author: "Джон Рёскин" },
  ],
};

export function AuthQuote() {
  const [mounted, setMounted] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const { locale } = useI18n();

  useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * 15));
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ height: 144 }} />;

  const quotes = quotesByLocale[locale] ?? quotesByLocale.az;
  const quote = quotes[quoteIndex % quotes.length];
  const words = quote.text.split(" ");
  const lastWord = words.pop();
  const firstPart = words.join(" ");

  return (
    <div>
      <blockquote className="text-3xl font-heading font-bold text-white leading-snug mb-6">
        &ldquo;{firstPart}{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          {lastWord}
        </span>
      </blockquote>
      <p className="text-gray-400 text-sm">— {quote.author}</p>
    </div>
  );
}
