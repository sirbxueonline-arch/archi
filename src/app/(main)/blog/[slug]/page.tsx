"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, User, Calendar, Share2, Copy, Check, BookOpen, ChevronRight } from "lucide-react";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  authorBio: string;
  date: string;
  category: string;
  readTime: number;
  coverColor: string;
  body: string[];
}

const ARTICLES: Article[] = [
  {
    id: "1",
    slug: "azerbaycanda-muasir-memarlig-trendleri",
    title: "Azərbaycanda Müasir Memarlıq Trendləri 2025",
    excerpt: "Son illərdə Bakıda baş verən memarlıq inqilabı: davamlı dizayn, biofil memarlıq və ağıllı binalar haqqında geniş araşdırma.",
    author: "Əli Həsənov",
    authorBio: "10 ildən artıq təcrübəyə malik memar. Bakı Dövlət Universiteti Memarlıq fakültəsinin məzunu. Müasir və davamlı memarlıq üzrə ixtisaslaşmışdır.",
    date: "2025-03-10",
    category: "Dizayn Trendləri",
    readTime: 8,
    coverColor: "bg-primary",
    body: [
      "Azərbaycan memarlığı son bir neçə ildə əhəmiyyətli transformasiya prosesindən keçməkdədir. Bakı, dünya standartlarına cavab verən müasir binaların inşası ilə özünü qlobal miqyasda tanıtmağa davam edir. Bu dəyişikliklərin mərkəzində isə davamlılıq, biofil dizayn və ağıllı texnologiyaların inteqrasiyası dayanır.",
      "Biofil memarlıq konsepsiyası ölkəmizdə get-gedə daha geniş yayılır. Bu yanaşmaya görə binalar insan-təbiət əlaqəsini gücləndirməlidir: yaşıl divarlar, təbii materialların istifadəsi, günəş işığının maksimum daxil olması və açıq məkanların layihələndirilməsi əsas prioritetlərə çevrilir. Bakıda son tikinti layihələrinin böyük hissəsi bu prinsipləri tətbiq edir.",
      "Ağıllı bina texnologiyaları da yerli memarlıq sahəsinə sürətlə daxil olur. İoT sensörləri, avtomatik iqlim nəzarəti, enerji idarəetmə sistemləri – bunlar artıq lüks deyil, müasir kommersiyal binaların standart tələbləridir. Bakı İş Mərkəzi bu sahədə öncül nümunə sayıla bilər.",
      "Davamlı memarlıq sahəsindəki irəliləyişlər xüsusilə diqqətçəkicidir. LEED sertifikatına malik binaların sayı artır, günəş panelləri geniş istifadəyə girir, yağış sularının toplanması sistemləri yaşayış evlərinin layihəsinin ayrılmaz hissəsinə çevrilir. Hökumət tərəfindən davamlı tikintiyə verilən dəstək bu prosesi daha da sürətləndirir.",
      "Gələcəyə baxdıqda, Azərbaycan memarlığının hibrid iş modellərini, çevik yaşayış konsepsiyalarını və enerji müstəqil binaları daha çox mənimsəyəcəyi proqnozlaşdırılır. Yerli memarlar beynəlxalq trendləri izləyərək onları yerli mədəni kontekstlə birləşdirməkdə uğur qazanırlar.",
    ],
  },
  {
    id: "2",
    slug: "interyer-dizayn-meqalesi",
    title: "İnteryer Dizaynda Rəng Psixologiyası",
    excerpt: "Rənglərin insan psixologiyasına təsiri və interyer dizaynda doğru rəng palitrasının seçilməsi üçün praktik məsləhətlər.",
    author: "Nigar Əliyeva",
    authorBio: "İnteryer dizayner. Milano Politexnik Universitetinin məzunu. Yaşayış və kommersiyal məkanların dizaynı üzrə ixtisaslaşmış.",
    date: "2025-03-05",
    category: "Memar Məsləhətləri",
    readTime: 6,
    coverColor: "bg-teal-600",
    body: [
      "Rənglər yalnız estetik element deyil – onlar bizim əhval-ruhiyyəmizə, məhsuldarlığımıza və hətta fiziki sağlamlığımıza birbaşa təsir edir. Bu baxımdan interyer dizaynda rəng seçimi son dərəcə vacib bir qərardır.",
      "Mavi rəngin sakinləşdirici təsiri ilə yataq otaqlarında geniş istifadə olunur. Açıq mavi tonlar sakitlik hissi yaradır, qan təzyiqini tənzimləməyə kömək edir. Lakin çox tünd mavi tonlar bəzən depressiv atmosfer yarada bilər – buna görə balans vacibdir.",
      "Sarı rəng enerji, optimizm və yaradıcılıqla assosiasiya olunur. Mətbəx və yeməkxana kimi sosial məkanlarda sarı vurğular mükəmməl işləyir. Bununla belə, çox intensiv sarı göz yorğunluğuna gətirib çıxara bilər.",
      "Yaşıl rəng təbiəti xatırladır və stressin azaldılmasına kömək edir. İş otaqları üçün ideal seçimdir çünki konsentrasiyaya kömək edir. Nəm xlorında qalan yaşıl tonlar bu il xüsusilə populyardır.",
      "Neytral tonlar – ağ, bej, gri – məkana genişlik hissi verir və digər aksentlərlə mükəmməl birləşir. Minimalist interyer dizaynın əsasını təşkil edən bu rənglər, düzgün tekstur və materiallarla birlikdə istilik dolu məkan yarada bilər.",
    ],
  },
  {
    id: "3",
    slug: "bim-texnologiyasi-memarligda",
    title: "BIM Texnologiyası Memarlıqda Necə İnqilab Edir?",
    excerpt: "Building Information Modeling sistemi ilə layihələrin planlaşdırılması, xərclərin azaldılması və komanda işinin optimallaşdırılması.",
    author: "Rauf Quliyev",
    authorBio: "BIM mütəxəssisi və memar. 8 il ərzində iri miqyaslı layihələrdə BIM koordinatoru kimi çalışıb. Autodesk sertifikatı mövcuddur.",
    date: "2025-02-28",
    category: "Texnologiya",
    readTime: 10,
    coverColor: "bg-primary",
    body: [
      "Building Information Modeling (BIM) – memarlıq, mühəndislik və tikinti sektorunda keçid dövründə yaşayan fundamental bir texnoloji transformasiyadır. BIM yalnız 3D modelləmə deyil, binanın bütün həyat tsikli boyunca məlumatların idarə edilməsi üçün bütüncül bir sistem platformasıdır.",
      "Ənənəvi 2D layihə prosesi ilə müqayisədə BIM-in üstünlükləri çoxdur. Birincisi, kolliziya aşkarlanması: müxtəlif mühəndislik sistemlərinin (elektrik, su, havalandırma) tikintiyə başlamazdan əvvəl virtual mühitdə sınaqdan keçirilməsi sayəsində sahədəki bahalı səhvlər minimuma endirilir.",
      "Xərclər baxımından BIM layihə büdcəsini orta hesabla 15-20% aşağı sala bilər. Bu, materialların daha dəqiq hesablanması, yenidən işin azaldılması və tikinti prosesinin optimallaşdırılması sayəsində əldə edilir. Bakıda bir neçə iri tikinti şirkəti bu texnologiyanı artıq tam tətbiq edib.",
      "Komanda əməkdaşlığı baxımından BIM bulud əsaslı platformalar vasitəsilə memarlar, mühəndislər, podratçılar və sifarişçilərin real vaxt rejimində eyni modellə işləməsinə imkan verir. Bu şəffaflıq isə qərar qəbulu prosesini əhəmiyyətli dərəcədə sürətləndirir.",
      "Azərbaycanda BIM-in tətbiqi hələlik inkişaf mərhələsindədir. Lakin dövlət tikinti layihələrinin getdikcə daha çox BIM tələb etməsi mütəxəssislərin bu sahədə bilik artırmasını vacib edir. ArchiLink platformasında bir çox məmarın BIM bacarıqlarını öz profillərindəki sertifikatlarında göstərdiyi görünür.",
    ],
  },
  {
    id: "4",
    slug: "baki-sahil-bulvar-case-study",
    title: "Bakı Sahil Bulvarı: Şəhər Məkanının Yenilənməsi",
    excerpt: "Bakı Bulvarının yenidən qurulması prosesi, arxitektura həlləri və ictimai məkanların dizaynı haqqında ətraflı case study.",
    author: "Ləman Süleymanova",
    authorBio: "Şəhər planlaşdırması üzrə memar. London School of Economics-in Urban Design proqramının məzunu.",
    date: "2025-02-20",
    category: "Case Study",
    readTime: 12,
    coverColor: "bg-emerald-500",
    body: [
      "Bakı Bulvarı – şəhərin tarixən ən sevimli ictimai məkanlarından biri – son illərdə keçirdiyi köklü transformasiyadan sonra yenidən şəhər həyatının mərkəzinə çevrildi. Bu case study layihənin memarlıq həlllərini, ictimai məkanın yenidən düşünülməsini və sosial nəticələrini araşdırır.",
      "Layihənin konsepsiya mərhələsində şəhər sakinlərinin ehtiyaclarının başa düşülməsi üçün geniş sosioloji araşdırma aparıldı. Müxtəlif yaş qruplarının, mədəni arkaplanın istifadəçilərinin müsahibələri məkanın çoxfunksiyalı olması zərurətini ortaya qoydu: aktiv istirahət, sakit düşüncə zonası, ticarət, mədəni tədbirlər.",
      "Dizayn həlllərindən ən diqqətçəkici olanı biofil yanaşmadır. Xürma ağacları, yerli bitki növləri, su elementləri – bunlar Xəzər dənizinin vizual təsirini gücləndirir. Bulvarın döşəmə örtüyü üçün istilik saxlayan və isə qaralayan keramik materiallar seçilib.",
      "Hərəkətsiz insanlar (əlillər, yaşlılar, uşaqlar üçün) əlçatanlıq standartlarına xüsusi diqqət verildi. Rampalar, taktil lövhələr, oturma qrupları hər 50 metrdə yerləşdirilib. Bu həll beynəlxalq Inclusive Design standartlarına tam uyğun hesab edilir.",
      "Layihənin sosial nəticələri son dərəcə müsbət olub. Bulvarın ziyarətçi sayı 40% artıb, yanındakı kiçik bizneslərin gəliri orta hesabla 25% yüksəlib. Bulvar artıq şəhər sakinlərinin mədəni yaddaşının ayrılmaz hissəsinə çevrilib.",
    ],
  },
  {
    id: "5",
    slug: "davamli-memarliq-azerbaycan",
    title: "Davamlı Memarlıq: Azərbaycanda Yaşıl Bina Standartları",
    excerpt: "LEED və BREEAM sertifikasiyası, enerji effektivliyi və ekoloji memarlıq prinsiplərinin yerli tətbiqi.",
    author: "Kamran Babayev",
    authorBio: "Davamlı memarlıq mütəxəssisi. LEED AP sertifikatı mövcuddur. Enerji effektiv bina dizaynı sahəsində 7 illik təcrübə.",
    date: "2025-02-14",
    category: "Dizayn Trendləri",
    readTime: 9,
    coverColor: "bg-green-600",
    body: [
      "Davamlı memarlıq artıq yalnız ekoloji narahatlıqdan doğan seçim deyil – bu gün o, uzunmüddətli xərcləri azaldan, bina dəyərini artıran və istedadlı işçiləri cəlb edən strateji investisiyadır. Azərbaycanda bu sahənin inkişafı üçün uyğun şərait formalaşmaqdadır.",
      "LEED (Leadership in Energy and Environmental Design) Şimali Amerikada yaranmış, lakin qlobal miqyasda ən tanınan yaşıl bina sertifikatlaşdırma sistemidir. Binalar enerji effektivliyi, su idarəetməsi, materiallar, daxili mühit keyfiyyəti kimi kateqoriyalarda qiymətləndirilir. Ölkəmizdə ilk LEED sertifikatlı binalar kommersiyal sektorda meydana çıxmağa başlayıb.",
      "Günəş enerjisinin tətbiqi Azərbaycanda böyük potensial daşıyır. Ölkəmiz Avropanın ən günəşli regionlarından birinə aiddir – illik 2700 saata qədər günəş işığı alırıq. Bu imkanın düzgün istifadəsi binaların enerji xərclərini əhəmiyyətli dərəcədə azalda bilər.",
      "Passiv dizayn strategiyaları – düzgün bina istiqaməti, yaxşı izolyasiya, pəncərə sistemi optimallaşdırması – bahalı texnologiyalarsız belə böyük enerji qənaəti təmin edir. Bu prinsiplər həm yeni tikintidə, həm də mövcud binaların renovasiyasında tətbiq oluna bilər.",
      "Hökumət tərəfindən davamlı tikintiyə verilən təşviqlər gün-gündən artır. Vergi güzəştləri, subsidiyalar və sertifikatlaşdırma xərclərinin dövlət tərəfindən ödənilməsi – bu addımlar yerli memarları yaşıl həllər tətbiq etməyə sövq edir.",
    ],
  },
  {
    id: "6",
    slug: "kicik-mekan-dizayn-sirrleri",
    title: "Kiçik Məkanlar üçün Dizayn Sirləri",
    excerpt: "Kompakt yaşayış sahələrini funksional və estetik cəhətdən cəlbedici etmək üçün memarların tətbiq etdiyi 10 effektiv üsul.",
    author: "Sevinc Məmmədova",
    authorBio: "İnteryer dizayner. Kiçik məkan optimallaşdırması üzrə ixtisaslaşmış. 200-dən artıq layihə portfelə sahib.",
    date: "2025-02-08",
    category: "Memar Məsləhətləri",
    readTime: 5,
    coverColor: "bg-amber-500",
    body: [
      "Şəhər mənzillərinin kiçilməsi meylini nəzərə alsaq, kompakt məkanların faydalı istifadəsi müasir interyer dizaynın ən aktual mövzularından birinə çevrilir. Bir sıra ağıllı həllərlə 40-50 kv.m mənzili çox daha geniş hiss etdirmək mümkündür.",
      "Çoxfunksiyalı mebel – bu sahənin qızıl qaydası. Divan-çarpayılar, uzanan yemək masaları, daxili yataq otağı (murphy bed) sistemləri kiçik məkanlarda yer qazanmağın ən effektiv üsullarıdır. Yerli bazarda bu tip məhsulların çeşidi ildən-ilə genişlənir.",
      "Şaquli məkanın istifadəsi tez-tez unudulur. Tavana qədər uzanan rəflər, yüksək dolablar, asma çarpayılar – bunlar döşəmə sahəsini «oğurlamadan» əlavə yaddaş sahəsi yaradır. Uşaq otaqları üçün xüsusilə effektivdir.",
      "İşıqlandırma dizaynı məkanı vizual olaraq genişlədə bilər. Birbaşa tavan işığından daha çox layiqli stend lampalar, divar breketi işıqlar, LED şeridlər istifadə edin. Güzgülərin strateji yerləşdirilməsi isə məkanı demək olar ki, iki qat böyük göstərə bilər.",
      "Rəng palitrasında açıq tonlara üstünlük verin, lakin monotonluqdan qaçın. Bir vurğu divarı, rəngli yastıqlar, teksturlu halılar – bunlar məkanı cansıxıcı ağ bir qutuya çevirmədən genişlik hissini saxlayır.",
    ],
  },
  {
    id: "7",
    slug: "3d-cixaris-memar-aletleri",
    title: "3D Çıxarış: Memarın Ən Güclü Satış Aləti",
    excerpt: "Müasir 3D vizualizasiya texnologiyaları, virtual reality turlar və müştəri ünsiyyətinin yaxşılaşdırılması üçün rəqəmsal alətlər.",
    author: "Elçin Nəsirov",
    authorBio: "Memar və 3D vizualizasiya mütəxəssisi. Autodesk 3ds Max, V-Ray, Unreal Engine 5 sertifikatları var.",
    date: "2025-01-30",
    category: "Texnologiya",
    readTime: 7,
    coverColor: "bg-cyan-500",
    body: [
      "Bir memar müştəriyə 2D plan göstərərkən əksər hallarda müştəri «bu nə deməkdir?» ifadəsini deyir. Halbuki, həmin planın fotorealistik 3D vizualizasiyasını göstərdikdə müştərinin reaksiyası tamamilə fərqli olur. Bu sadə fərq həm satışlarda, həm müştəri məmnuniyyətində böyük rol oynayır.",
      "Müasir render mühərrikləri – V-Ray, Corona, Lumion, Twinmotion – fotoqrafiyadan praktiki olaraq ayırd edilə bilməyən görüntülər yaratmağa imkan verir. Günəş işığının saata görə simulyasiyası, material teksturları, ərazidəki ağaclar və insanlar – bunların hamısı real hiss yaradan bir vizualizasiya üçün lazımdır.",
      "Virtual Reality (VR) turlar müştərinin hələ tikilməmiş binanın içindən gəzə bilməsinə imkan verir. Oculus Quest kimi əlçatan VR qurğuların qiyməti düşdükcə bu texnologiya daha çox memarlıq studiyasının alətlər arsenalına daxil olur. Bakıda bu texnologiyanı tətbiq edən bir neçə studiya var.",
      "Real-time vizualizasiya mühərrikləri (Unreal Engine 5, Twinmotion) isə müştərinin ekranda göründüyü kimi materialları, işıqlandırmanı, mebeli dəyişdirməsinə imkan verir. Bu interaktivlik müştərinin qərar qəbulunu əhəmiyyətli dərəcədə sürətləndirir.",
      "ArchiLink platformasında uğurlu məmarların əksəriyyəti 3D vizualizasiya nümunələrini portfolio bölmələrindəki layihələrə əlavə etmişlər. Bu, profil baxış sayını orta hesabla 3 dəfə artırır.",
    ],
  },
  {
    id: "8",
    slug: "gence-yeni-mahalle-case-study",
    title: "Gəncə Yeni Məhəllə: İctimai Məkan Layihəsi",
    excerpt: "Gəncə şəhərinin cənub hissəsindəki yaşayış kompleksinin memarlıq konsepsiyası, ictimai məkanların layihələndirilməsi.",
    author: "Aynur Hüseynova",
    authorBio: "Şəhər planlaşdırmacısı. Gəncə şəhərinin inkişaf planında iştirak etmiş. Yaşayış kompleksləri dizaynı üzrə ixtisaslaşmış.",
    date: "2025-01-22",
    category: "Case Study",
    readTime: 11,
    coverColor: "bg-primary",
    body: [
      "Gəncə şəhərinin cənub hissəsindəki 12 hektar sahədə yerləşən yeni yaşayış kompleksi Azərbaycanın bölgə şəhərlərindəki müasir mənzil tikintisinin maraqlı bir nümunəsini təmsil edir. Layihə yalnız binaları deyil, tam bir məhəllə ekosistemini yaratmağı hədəfləyib.",
      "Konsepsiya mərhələsindən etibarən ictimai məkanların layihəyə inteqrasiyası prioritet götürüldü. Kompleksin mərkəzindəki 2 hektarlıq park yalnız estetik məqsəd daşımır – o, məhəllənin sosial həyatının mərkəzidir. Burada uşaq oyun meydançaları, ağ saçlılar üçün istirahət guşəsi, açıq idman sahəsi, kiçik bazarlar nəzərdə tutulub.",
      "Arxitektura dili Azərbaycan ənənəvi ornamentlərini müasir formalara inteqrasiya edir. Cəphe sistemlərindəki şəbəkəli metal panellər şirvanşahlar dövrü memarlığından ilham alır. Bu yanaşma tikilinin yerli kontekstə bağlı hiss etdirməsinə xidmət edir.",
      "Enerji infrastrukturu baxımından kompleks mərkəzləşdirilmiş istilik pompası sisteminə əsaslanır. Bina damlarındakı günəş panelləri ictimai məkanların işıqlandırmasını tam ödəyir. Yağış suyu toplama sistemi isə parkın suvarılmasında istifadə olunur.",
      "Layihənin ilk fazası tamamlandıqdan sonra aparılan resident sorğusu yüksək məmnunluq göstəricisini ortaya qoyur. İctimai məkanlara gündəlik orta ziyarəti 850 nəfər təşkil edir. Bu, məhəllə sakinlərinin sosial əlaqəsinin güclənməsinin açıq göstəricisidir.",
    ],
  },
];

const RELATED_ARTICLES = ARTICLES.slice(0, 3);

function formatArticleDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("az-AZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [copied, setCopied] = useState(false);

  const article = ARTICLES.find((a) => a.slug === slug) ?? ARTICLES[0];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://archilink.az/blog/${article.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Article Header */}
      <div className={`${article.coverColor} pt-20`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Yazılara qayıt
          </Link>

          <div className="mb-4">
            <span className="inline-block text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full">
              {article.category}
            </span>
          </div>

          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatArticleDate(article.date)}
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
              <Clock className="w-4 h-4" />
              {article.readTime} dəq oxuma
            </span>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-10">
          <article className="lg:col-span-3">
            {/* Excerpt */}
            <p className="text-lg text-slate-600 font-medium leading-relaxed mb-8 pb-8 border-b border-border">
              {article.excerpt}
            </p>

            {/* Body paragraphs */}
            <div className="space-y-6">
              {article.body.map((paragraph, idx) => (
                <p key={idx} className="text-slate-700 leading-relaxed text-base">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Share Section */}
            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Bu yazını paylaş
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white hover:bg-muted text-sm font-medium text-slate-700 transition-colors"
                >
                  {copied ? (
                    <><Check className="w-4 h-4 text-emerald-500" /> Kopyalandı</>
                  ) : (
                    <><Copy className="w-4 h-4" /> Linki kopyala</>
                  )}
                </button>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=https://archilink.az/blog/${article.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Facebook
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=https://archilink.az/blog/${article.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A66C2] text-white text-sm font-medium hover:bg-[#0A66C2]/90 transition-colors"
                >
                  LinkedIn
                </a>
                <a
                  href={`https://wa.me/?text=https://archilink.az/blog/${article.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"
                >
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Author Card */}
            <div className="mt-10 p-6 rounded-2xl border border-border bg-white flex gap-4 items-start">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Müəllif haqqında</p>
                <h4 className="font-heading font-bold text-slate-900 mb-1">{article.author}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{article.authorBio}</p>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="font-heading font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">
                Oxuma vaxtı
              </h3>
              <div className="flex items-center gap-2 p-4 rounded-xl bg-primary/5 border border-primary/10 mb-6">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">{article.readTime} dəqiqə</span>
              </div>
              <h3 className="font-heading font-bold text-slate-900 mb-3 text-sm uppercase tracking-wider">
                Kateqoriya
              </h3>
              <span className="inline-block text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-full mb-6">
                {article.category}
              </span>
            </div>
          </aside>
        </div>

        {/* Related Articles */}
        <div className="mt-16">
          <h2 className="font-heading text-2xl font-bold text-slate-900 mb-6">Oxşar Yazılar</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {RELATED_ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3).map((related) => (
              <Link key={related.id} href={`/blog/${related.slug}`} className="group block">
                <div className="rounded-2xl border border-border bg-white overflow-hidden hover:shadow-md transition-shadow">
                  <div className={`${related.coverColor} h-32 flex items-center justify-center`}>
                    <BookOpen className="w-8 h-8 text-white/30" />
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-semibold text-primary">{related.category}</span>
                    <h4 className="font-heading font-bold text-sm text-slate-900 mt-1 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {related.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {related.readTime} dəq
                      <span className="ml-auto flex items-center gap-1 text-primary">
                        Oxu <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
