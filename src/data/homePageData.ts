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
    slug: "brand-blog-template",
    category: "網站模板",
    heroTitle: "品牌部落格形象模板",
    heroSubtitle:
      "以文章為核心的形象網站模板，快速建立分類、標籤與內容列表，讓更新更有節奏。",
    metaDescription:
      "以文章為核心的形象網站模板，快速建立分類、標籤與內容列表，讓更新更有節奏。",
    heroImages: ["/images/services/VirtualES-intro.jpg"],
    logo: "/images/services/VirtualES2.png",
    thumbImage: "/images/services/VirtualES2.png",
    introImage: "/images/services/VirtualES-intro.jpg",
    videoUrl: "https://www.youtube.com/embed/MxPdn6jJMMQ?si=erikyLY85bhOvooV",
    externalUrl: "/contact",
    navOrder: 1,
    isPublished: true,
    isFeatured: false,
  },
  {
    id: "2",
    title: "極簡企業官網模板",
    slug: "minimal-corporate-template",
    category: "網站模板",
    heroTitle: "極簡企業官網模板",
    heroSubtitle:
      "簡約排版、區塊式組合，首頁與服務頁快速上線，維護乾淨俐落。",
    metaDescription:
      "簡約排版、區塊式組合，首頁與服務頁快速上線，維護乾淨俐落。",
    heroImages: ["/images/services/ReadyTechQV1360-intro.jpg"],
    logo: "/images/services/ReadyTechQV1360.png",
    thumbImage: "/images/services/ReadyTechQV1360.png",
    introImage: "/images/services/ReadyTechQV1360-intro.jpg",
    videoUrl: "https://www.youtube.com/embed/MxPdn6jJMMQ?si=erikyLY85bhOvooV",
    externalUrl: "/contact",
    navOrder: 2,
    isPublished: true,
    isFeatured: false,
  },
  {
    id: "3",
    title: "行銷 Landing Page 模板",
    slug: "landing-page-template",
    category: "網站模板",
    heroTitle: "行銷 Landing Page 模板",
    heroSubtitle:
      "適合活動與產品宣傳，套用版型快速發布，並可隨時在後台調整內容。",
    metaDescription:
      "適合活動與產品宣傳，套用版型快速發布，並可隨時在後台調整內容。",
    heroImages: ["/images/services/BeseyeAI-intro.jpg"],
    logo: "/images/services/BeseyeAI.png",
    thumbImage: "/images/services/BeseyeAI.png",
    introImage: "/images/services/BeseyeAI-intro.jpg",
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
    name: "安碁資訊",
    image: "/images/partner/AcerCyber.png",
    alt: "安碁資訊",
  },

  {
    id: 2,
    name: "漢翔航空",
    image: "/images/partner/Aerospace.jpg",
    alt: "漢翔航空",
  },

  {
    id: 3,
    name: "鴻海科技",
    image: "/images/partner/FOXCONN.jpg",
    alt: "鴻海科技",
  },

  {
    id: 4,
    name: "天心資訊",
    image: "/images/partner/ATTN.png",
    alt: "天心資訊",
  },

  {
    id: 5,
    name: "中華電信",
    image: "/images/partner/ChunghwaTelecom.png",
    alt: "中華電信",
  },
];

// Success Cases Data Array
export const successCasesData = [
  {
    id: 1,
    name: "台灣中油",
    image: "/images/partner/CHIEF.png",
    alt: "台灣中油",
  },

  {
    id: 2,
    name: "考選部",
    image: "/images/partner/CHTSecurity.png",
    alt: "考選部",
  },

  {
    id: 3,
    name: "國泰金控",
    image: "/images/partner/CHTSecurity.png",
    alt: "國泰金控",
  },

  {
    id: 4,
    name: "中華電信資安旗艦",
    image: "/images/partner/CHTSecurity.png",
    alt: "中華電信資安旗艦",
  },

  {
    id: 5,
    name: "漢翔航空",
    image: "/images/partner/Aerospace.jpg",
    alt: "漢翔航空",
  },
];
