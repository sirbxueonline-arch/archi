import Image from "next/image";
import Link from "next/link";

// Thumbnail data — `top` is % of side-panel height,
// then EITHER `left` OR `right` gives the offset from the panel edge.
// `size` is the px size at scale=1.
type Thumb = {
  src: string;
  top: string;
  size: number;
  left?: string;
  right?: string;
};

const LEFT_THUMBS: Thumb[] = [
  {
    src: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=500&q=80",
    top: "4%",
    left: "10px",
    size: 170,
  },
  {
    src: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80",
    top: "22%",
    right: "12px",
    size: 110,
  },
  {
    src: "https://images.unsplash.com/photo-1496564203457-11bb12075d90?w=500&q=80",
    top: "38%",
    left: "0px",
    size: 150,
  },
  {
    src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&q=80",
    top: "58%",
    left: "44px",
    size: 170,
  },
  {
    src: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500&q=80",
    top: "76%",
    right: "8px",
    size: 130,
  },
];

const RIGHT_THUMBS: Thumb[] = [
  {
    src: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=500&q=80",
    top: "4%",
    right: "10px",
    size: 165,
  },
  {
    src: "https://images.unsplash.com/photo-1448630360428-65456885c650?w=500&q=80",
    top: "22%",
    left: "16px",
    size: 115,
  },
  {
    src: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=500&q=80",
    top: "36%",
    right: "0px",
    size: 140,
  },
  {
    src: "https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=500&q=80",
    top: "56%",
    left: "30px",
    size: 160,
  },
  {
    src: "https://images.unsplash.com/photo-1501183638710-841dd1904471?w=500&q=80",
    top: "76%",
    right: "12px",
    size: 175,
  },
];

const ENTRANCE_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const POP_EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)";

function ThumbCard({ thumb, index }: { thumb: Thumb; index: number }) {
  const entranceDelay = 120 + index * 80;
  const floatDelay = 0.9 + index * 0.25;
  const floatDuration = 6 + index * 0.7;

  return (
    <div
      className="absolute"
      style={{
        top: thumb.top,
        left: thumb.left,
        right: thumb.right,
        animation: `heroThumbIn 0.75s ${POP_EASE} ${entranceDelay}ms both`,
      }}
    >
      <div
        className="rounded-2xl overflow-hidden shadow-[0_10px_32px_rgba(0,0,0,0.10)] ring-1 ring-black/5 will-change-transform"
        // The size scales with --thumb-scale (set responsively in globals.css)
        style={{
          width: `calc(${thumb.size}px * var(--thumb-scale, 1))`,
          height: `calc(${thumb.size}px * var(--thumb-scale, 1))`,
          animation: `float ${floatDuration}s ease-in-out infinite ${floatDelay}s`,
        }}
      >
        <div className="relative w-full h-full">
          <Image
            src={thumb.src}
            alt=""
            fill
            className="object-cover"
            sizes="220px"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <div className="hero-collage relative overflow-hidden bg-white pt-14">
      <section className="relative max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 min-h-[560px] lg:min-h-[680px] xl:min-h-[800px] 2xl:min-h-[960px] flex items-center justify-center">
        {/* Left side panel — width comes from --panel-width in globals.css */}
        <div
          className="hidden lg:block absolute top-0 bottom-0 left-0 pointer-events-none"
          style={{ width: "var(--panel-width)" }}
        >
          {LEFT_THUMBS.map((thumb, i) => (
            <ThumbCard key={`L${i}`} thumb={thumb} index={i} />
          ))}
        </div>

        {/* Right side panel */}
        <div
          className="hidden lg:block absolute top-0 bottom-0 right-0 pointer-events-none"
          style={{ width: "var(--panel-width)" }}
        >
          {RIGHT_THUMBS.map((thumb, i) => (
            <ThumbCard key={`R${i}`} thumb={thumb} index={i} />
          ))}
        </div>

        {/* Centered content — fluid type that scales from phone to big desktop */}
        <div className="relative z-10 text-center max-w-[640px] xl:max-w-[780px] 2xl:max-w-[920px] py-16 sm:py-20 lg:py-24 2xl:py-32">
          <h1
            className="font-heading font-extrabold leading-[1.02] tracking-[-0.02em] text-gray-900 mb-5 sm:mb-6"
            style={{
              animation: `heroSlideUp 0.8s ${ENTRANCE_EASE} 0.1s both`,
              fontSize: "clamp(2.2rem, 3vw + 0.5rem, 4.5rem)",
            }}
          >
            Azərbaycanın
            <br />
            <span
              className="text-[#0D9488] inline-block"
              style={{ animation: `heroSlideUp 0.8s ${ENTRANCE_EASE} 0.25s both` }}
            >
              Ən Yaxşı Memarları
            </span>
            <br />
            ArchiLink-dədir
          </h1>

          <p
            className="text-gray-600 mb-7 sm:mb-9 max-w-md sm:max-w-lg 2xl:max-w-xl mx-auto leading-[1.55]"
            style={{
              animation: `heroSlideUp 0.8s ${ENTRANCE_EASE} 0.45s both`,
              fontSize: "clamp(0.95rem, 0.6vw + 0.9rem, 1.35rem)",
            }}
          >
            Müştərilər və memarları bir araya gətirən tam platforma — ilham tapmaqdan
            layihə əldə etməyə qədər, hamısı bir yerdə.
          </p>

          <div
            className="flex items-center justify-center gap-2.5 flex-wrap"
            style={{ animation: `heroSlideUp 0.8s ${ENTRANCE_EASE} 0.6s both` }}
          >
            <Link
              href="/bazar"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-[15px] font-semibold bg-[#0D9488] hover:bg-[#0F766E] text-white transition-colors"
            >
              İş tap
            </Link>
            <Link
              href="/memarlar"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-[15px] font-semibold bg-[#0D9488]/10 text-[#0D9488] hover:bg-[#0D9488]/15 transition-colors"
            >
              Memar tap
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile + tablet collage strip — visible below lg breakpoint */}
      <div
        className="lg:hidden px-4 pb-10"
        style={{ animation: `heroFadeIn 0.9s ${ENTRANCE_EASE} 0.7s both` }}
      >
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-w-md sm:max-w-2xl mx-auto">
          {[...LEFT_THUMBS.slice(0, 3), ...RIGHT_THUMBS.slice(0, 3)].map((thumb, i) => (
            <div
              key={`M${i}`}
              className="relative aspect-square rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5"
              style={{
                animation: `heroThumbIn 0.6s ${POP_EASE} ${800 + i * 90}ms both`,
              }}
            >
              <Image
                src={thumb.src}
                alt=""
                fill
                className="object-cover"
                sizes="120px"
                aria-hidden
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
