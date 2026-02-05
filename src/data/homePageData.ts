export interface BasePage {
  id: string;
  title: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImages?: string[];
  isPublished: boolean;
  isFeatured: boolean;
}

export interface Product extends BasePage {
  logo?: string;
  externalUrl?: string;
  category?: string;
  navOrder?: number;
  // 服務相關的額外欄位（用於 ServiceSection）
  thumbImage?: string;
  introImage?: string;
  videoUrl?: string;
}

export const servicesData: Product[] = [
  {
    id: "1",
    title: "品牌部落格形象模板",
    slug: "#",
    category: "網站模板",
    heroTitle: "品牌部落格形象模板",
    heroSubtitle:
      "以文章為核心的形象網站模板，快速建立分類、標籤與內容列表，讓更新更有節奏。",
    metaDescription:
      "以文章為核心的形象網站模板，快速建立分類、標籤與內容列表，讓更新更有節奏。",
    heroImages: ["/images/services/VirtualES-intro.jpg"],
    logo: "/images/services/service-blog.png",
    thumbImage: "/images/services/service-blog.png",
    introImage: "/images/services/service-blog-intro.jpg",
    videoUrl: "https://www.youtube.com/embed/MxPdn6jJMMQ?si=erikyLY85bhOvooV",
    externalUrl: "/contact",
    navOrder: 1,
    isPublished: true,
    isFeatured: false,
  },
  {
    id: "2",
    title: "形象首頁設計",
    slug: "#",
    category: "網站模板",
    heroTitle: "形象首頁設計",
    heroSubtitle:
      "根據您的品牌形象與需求，量身打造獨特的首頁設計，讓您的品牌在眾多競爭者中脫穎而出。",
    metaDescription:
      "根據您的品牌形象與需求，量身打造獨特的首頁設計，讓您的品牌在眾多競爭者中脫穎而出。",
    heroImages: ["/images/services/landingpage-design-intro.jpg"],
    logo: "/images/services/landingpage-design.png",
    thumbImage: "/images/services/landingpage-design.png",
    introImage: "/images/services/landingpage-design-intro.jpg",
    videoUrl: "https://www.youtube.com/embed/MxPdn6jJMMQ?si=erikyLY85bhOvooV",
    externalUrl: "/contact",
    navOrder: 2,
    isPublished: true,
    isFeatured: false,
  },
  {
    id: "3",
    title: "客製化網站開發",
    slug: "#",
    category: "網站模板",
    heroTitle: "客製化網站開發",
    heroSubtitle:
      "您的品牌有獨特的營運需求？我們可以為您規劃兼具美感與體貼近使用者需求的網站，並提供完整的開發與維護服務。",
    metaDescription:
      "您的品牌有獨特的營運需求？我們可以為您規劃兼具美感與體貼近使用者需求的網站，並提供完整的開發與維護服務。",
    heroImages: ["/images/services/customization-intro.jpg"],
    logo: "/images/services/customization.png",
    thumbImage: "/images/services/customization.png",
    introImage: "/images/services/customization-intro.jpg",
    videoUrl: "https://www.youtube.com/embed/MxPdn6jJMMQ?si=erikyLY85bhOvooV",
    externalUrl: "/contact",
    navOrder: 3,
    isPublished: true,
    isFeatured: false,
  },
];

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  publishDate: string;
  isPublished: boolean;
  isFeatured: boolean;
}

export const newsData: NewsArticle[] = [
  {
    id: "1",
    title: "小編筆記：模板先上線，再慢慢把內容養起來",
    slug: "#",
    category: "小編分享",
    excerpt:
      "先用模板把架構搭起來（首頁、文章列表、分類），再用日常更新把內容養起來；比起一次到位，這種做法更適合長期經營。小編建議先把版面規則固定住，後續只要專注寫內容、換圖片、調整段落就好。",
    content:
      "<p>小編最近整理了一些做網站的心得：與其等到每個區塊都「完美」才上線，不如先用模板把架構搭好——首頁、文章列表、分類頁先到位，版面也會比較一致。上線後再把重心放在內容：每週一篇更新、每次一個主題，把品牌故事慢慢養起來，網站就會越來越完整。</p>",
    featuredImage: "/images/news/0814.png",
    publishDate: "2025-08-14",
    isPublished: true,
    isFeatured: true,
  },
  {
    id: "2",
    title: "轉分享：把網站更新流程做簡單，才會真的有人持續寫",
    slug: "#",
    category: "轉分享",
    excerpt:
      "整理自內容行銷常見建議：先降低更新門檻，網站才會真的有人持續寫。頁面、文章、分類、摘要都能在後台完成，就不會每次小改都卡住。越少人需要被「叫來支援」，更新頻率通常就越穩。",
    content:
      "<p>這篇是小編整理／轉分享的重點：網站會不會常更新，通常不是因為大家不想寫，而是「更新太麻煩」。如果新增文章、改段落順序、替換圖片都要找工程，那更新很快就停了。部落格式形象網頁最實用的地方，是把日常維護放進後台：建立頁面、發布文章、設定分類與摘要，甚至微調版面內容順序，都能直接操作完成。</p>",
    featuredImage: "/images/news/0703.png",
    publishDate: "2025-07-03",
    isPublished: true,
    isFeatured: false,
  },
  {
    id: "3",
    title: "設計小抄：為什麼「簡約模板」反而更耐看？",
    slug: "#",
    category: "設計觀點",
    excerpt:
      "小編最常被問：簡約是不是很無聊？其實重點是留白、字級與間距一致，讀起來更舒服，也更不容易越改越亂。當文章越來越多，一套固定的模板規則反而能讓內容更突出、視覺更耐看。",
    content:
      "<p>這篇是小編的設計心得筆記：簡約不是「什麼都不要放」，而是把規則訂清楚。像是同一層級的標題字級一致、段落行距固定、卡片圖片比例統一、留白不要忽大忽小。當網站內容越來越多，這些規則會救你——不會因為多加幾篇文章就讓版面走鐘。模板化設計最大的好處，就是把一致性先做好，讓內容更突出、閱讀更順。</p>",
    featuredImage: "/images/news/0621.png",
    publishDate: "2025-06-21",
    isPublished: true,
    isFeatured: false,
  },
];

// Partners Data Array
export const partnersData = [
  {
    id: 1,
    name: "AQURAYE",
    image: "/images/partner/AQURAYE.png",
    alt: "AQURAYE",
  },
  {
    id: 2,
    name: "AVEGART",
    image: "/images/partner/AVEGART.png",
    alt: "AVEGART",
  },
  {
    id: 3,
    name: "balbestk",
    image: "/images/partner/balbestk.png",
    alt: "balbestk",
  },
  {
    id: 4,
    name: "BUDSETY",
    image: "/images/partner/BUDSETY.png",
    alt: "BUDSETY",
  },
  {
    id: 5,
    name: "BUPSICK",
    image: "/images/partner/BUPSICK.png",
    alt: "BUPSICK",
  },
  {
    id: 6,
    name: "BUTUCK",
    image: "/images/partner/BUTUCK.png",
    alt: "BUTUCK",
  },
  {
    id: 7,
    name: "Cauearo",
    image: "/images/partner/Cauearo.png",
    alt: "Cauearo",
  },
  {
    id: 8,
    name: "Conjector",
    image: "/images/partner/Conjector.png",
    alt: "Conjector",
  },
  {
    id: 9,
    name: "corysur",
    image: "/images/partner/corysur.png",
    alt: "corysur",
  },
  {
    id: 10,
    name: "covelato",
    image: "/images/partner/covelato.png",
    alt: "covelato",
  },
  {
    id: 11,
    name: "CroyPick",
    image: "/images/partner/CroyPick.png",
    alt: "CroyPick",
  },
  {
    id: 12,
    name: "DOPSIGN",
    image: "/images/partner/DOPSIGN.png",
    alt: "DOPSIGN",
  },
  {
    id: 13,
    name: "DUDSEIT",
    image: "/images/partner/DUDSEIT.png",
    alt: "DUDSEIT",
  },
  {
    id: 14,
    name: "Galyiesuk",
    image: "/images/partner/Galyiesuk.png",
    alt: "Galyiesuk",
  },
  {
    id: 15,
    name: "GonirMator",
    image: "/images/partner/GonirMator.png",
    alt: "GonirMator",
  },
  {
    id: 16,
    name: "GONPEAN",
    image: "/images/partner/GONPEAN.png",
    alt: "GONPEAN",
  },
  {
    id: 17,
    name: "Gqusery",
    image: "/images/partner/Gqusery.png",
    alt: "Gqusery",
  },
  {
    id: 18,
    name: "gvibrik",
    image: "/images/partner/gvibrik.png",
    alt: "gvibrik",
  },
  {
    id: 19,
    name: "KURSLAK",
    image: "/images/partner/KURSLAK.png",
    alt: "KURSLAK",
  },
  {
    id: 20,
    name: "MARKLARA",
    image: "/images/partner/MARKLARA.png",
    alt: "MARKLARA",
  },
  {
    id: 21,
    name: "MOROSEL",
    image: "/images/partner/MOROSEL.png",
    alt: "MOROSEL",
  },
  {
    id: 22,
    name: "PONASA",
    image: "/images/partner/PONASA.png",
    alt: "PONASA",
  },
  {
    id: 23,
    name: "ROTSLAL",
    image: "/images/partner/ROTSLAL.png",
    alt: "ROTSLAL",
  },
  {
    id: 24,
    name: "Sewipere",
    image: "/images/partner/Sewipere.png",
    alt: "Sewipere",
  },
  {
    id: 25,
    name: "SpinUve",
    image: "/images/partner/SpinUve.png",
    alt: "SpinUve",
  },
  {
    id: 26,
    name: "Squeany",
    image: "/images/partner/Squeany.png",
    alt: "Squeany",
  },
  {
    id: 27,
    name: "Stvimedty",
    image: "/images/partner/Stvimedty.png",
    alt: "Stvimedty",
  },
  {
    id: 28,
    name: "TORSCIL",
    image: "/images/partner/TORSCIL.png",
    alt: "TORSCIL",
  },
];

// Success Cases Data Array
export const successCasesData = [
  {
    id: 1,
    name: "AQURAYE",
    image: "/images/partner/AQURAYE.png",
    alt: "AQURAYE",
  },
  {
    id: 2,
    name: "AVEGART",
    image: "/images/partner/AVEGART.png",
    alt: "AVEGART",
  },
  {
    id: 3,
    name: "balbestk",
    image: "/images/partner/balbestk.png",
    alt: "balbestk",
  },
  {
    id: 4,
    name: "BUDSETY",
    image: "/images/partner/BUDSETY.png",
    alt: "BUDSETY",
  },
  {
    id: 5,
    name: "BUPSICK",
    image: "/images/partner/BUPSICK.png",
    alt: "BUPSICK",
  },
  {
    id: 6,
    name: "BUTUCK",
    image: "/images/partner/BUTUCK.png",
    alt: "BUTUCK",
  },
  {
    id: 7,
    name: "Cauearo",
    image: "/images/partner/Cauearo.png",
    alt: "Cauearo",
  },
  {
    id: 8,
    name: "Conjector",
    image: "/images/partner/Conjector.png",
    alt: "Conjector",
  },
  {
    id: 9,
    name: "corysur",
    image: "/images/partner/corysur.png",
    alt: "corysur",
  },
  {
    id: 10,
    name: "covelato",
    image: "/images/partner/covelato.png",
    alt: "covelato",
  },
  {
    id: 11,
    name: "CroyPick",
    image: "/images/partner/CroyPick.png",
    alt: "CroyPick",
  },
  {
    id: 12,
    name: "DOPSIGN",
    image: "/images/partner/DOPSIGN.png",
    alt: "DOPSIGN",
  },
  {
    id: 13,
    name: "DUDSEIT",
    image: "/images/partner/DUDSEIT.png",
    alt: "DUDSEIT",
  },
  {
    id: 14,
    name: "Galyiesuk",
    image: "/images/partner/Galyiesuk.png",
    alt: "Galyiesuk",
  },
  {
    id: 15,
    name: "GonirMator",
    image: "/images/partner/GonirMator.png",
    alt: "GonirMator",
  },
  {
    id: 16,
    name: "GONPEAN",
    image: "/images/partner/GONPEAN.png",
    alt: "GONPEAN",
  },
  {
    id: 17,
    name: "Gqusery",
    image: "/images/partner/Gqusery.png",
    alt: "Gqusery",
  },
  {
    id: 18,
    name: "gvibrik",
    image: "/images/partner/gvibrik.png",
    alt: "gvibrik",
  },
  {
    id: 19,
    name: "KURSLAK",
    image: "/images/partner/KURSLAK.png",
    alt: "KURSLAK",
  },
  {
    id: 20,
    name: "MARKLARA",
    image: "/images/partner/MARKLARA.png",
    alt: "MARKLARA",
  },
  {
    id: 21,
    name: "MOROSEL",
    image: "/images/partner/MOROSEL.png",
    alt: "MOROSEL",
  },
  {
    id: 22,
    name: "PONASA",
    image: "/images/partner/PONASA.png",
    alt: "PONASA",
  },
  {
    id: 23,
    name: "ROTSLAL",
    image: "/images/partner/ROTSLAL.png",
    alt: "ROTSLAL",
  },
  {
    id: 24,
    name: "Sewipere",
    image: "/images/partner/Sewipere.png",
    alt: "Sewipere",
  },
  {
    id: 25,
    name: "SpinUve",
    image: "/images/partner/SpinUve.png",
    alt: "SpinUve",
  },
  {
    id: 26,
    name: "Squeany",
    image: "/images/partner/Squeany.png",
    alt: "Squeany",
  },
  {
    id: 27,
    name: "Stvimedty",
    image: "/images/partner/Stvimedty.png",
    alt: "Stvimedty",
  },
  {
    id: 28,
    name: "TORSCIL",
    image: "/images/partner/TORSCIL.png",
    alt: "TORSCIL",
  },
];
