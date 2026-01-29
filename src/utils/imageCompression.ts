/**
 * 圖片壓縮工具函數
 * 將圖片壓縮到指定品質和最大尺寸
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 - 1.0
  maxSizeMB?: number; // 最大檔案大小（MB）
}

/**
 * 壓縮圖片
 * @param file 圖片檔案或 base64 字串
 * @param options 壓縮選項
 * @returns 壓縮後的 base64 字串
 */
export async function compressImage(
  file: File | string,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSizeMB = 1,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      // 計算縮放比例
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }

      // 創建 canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      // 繪製圖片
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("無法創建 canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // 轉換為 base64
      let compressedDataUrl = canvas.toDataURL("image/jpeg", quality);

      // 如果檔案還是太大，進一步降低品質
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      let currentQuality = quality;

      const tryCompress = () => {
        const sizeInBytes = (compressedDataUrl.length * 3) / 4;
        if (sizeInBytes > maxSizeBytes && currentQuality > 0.1) {
          currentQuality -= 0.1;
          compressedDataUrl = canvas.toDataURL("image/jpeg", currentQuality);
          tryCompress();
        } else {
          resolve(compressedDataUrl);
        }
      };

      tryCompress();
    };

    img.onerror = () => {
      reject(new Error("圖片載入失敗"));
    };

    // 處理輸入類型
    if (typeof file === "string") {
      // base64 字串
      img.src = file;
    } else {
      // File 物件
      const reader = new FileReader();
      reader.onloadend = () => {
        img.src = reader.result as string;
      };
      reader.onerror = () => {
        reject(new Error("檔案讀取失敗"));
      };
      reader.readAsDataURL(file);
    }
  });
}

/**
 * 檢查 base64 字串的大小
 * @param base64  base64 字串
 * @returns 大小（MB）
 */
export function getBase64SizeMB(base64: string): number {
  if (!base64) return 0;
  // 移除 data URL 前綴
  const base64Data = base64.split(",")[1] || base64;
  // 計算大小：base64 長度 * 3/4 / 1024 / 1024
  return (base64Data.length * 3) / 4 / 1024 / 1024;
}

/**
 * 壓縮所有圖片欄位
 * @param data 包含圖片的資料物件
 * @returns 壓縮後的資料物件
 */
export async function compressAllImages(data: any): Promise<any> {
  const compressed = { ...data };

  // 壓縮 settings 中的圖片
  if (compressed.settings) {
    const settings = { ...compressed.settings };

    // 壓縮 settings.backgroundImage
    if (settings.backgroundImage && typeof settings.backgroundImage === "string") {
      try {
        const sizeMB = getBase64SizeMB(settings.backgroundImage);
        if (sizeMB > 0.5) {
          settings.backgroundImage = await compressImage(settings.backgroundImage, {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.7,
            maxSizeMB: 0.5,
          });
        }
      } catch (error) {
        console.error("壓縮 backgroundImage 失敗:", error);
      }
    }

    // 壓縮 settings.image（例如 image_text 區塊圖片）
    if (settings.image && typeof settings.image === "string") {
      try {
        const sizeMB = getBase64SizeMB(settings.image);
        if (sizeMB > 0.5) {
          settings.image = await compressImage(settings.image, {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.7,
            maxSizeMB: 0.5,
          });
        }
      } catch (error) {
        console.error("壓縮 image 失敗:", error);
      }
    }

    // 壓縮 settings.images 陣列
    if (Array.isArray(settings.images)) {
      settings.images = await Promise.all(
        settings.images.map(async (img: string) => {
          if (typeof img === "string") {
            try {
              const sizeMB = getBase64SizeMB(img);
              if (sizeMB > 0.5) {
                return await compressImage(img, {
                  maxWidth: 1920,
                  maxHeight: 1080,
                  quality: 0.7,
                  maxSizeMB: 0.5,
                });
              }
            } catch (error) {
              console.error("壓縮圖片失敗:", error);
            }
          }
          return img;
        })
      );
    }

    // 壓縮其他可能的圖片欄位
    const imageFields = ["heroImage", "iconImage", "featuredImage"];
    for (const field of imageFields) {
      if (settings[field] && typeof settings[field] === "string") {
        try {
          const sizeMB = getBase64SizeMB(settings[field]);
          if (sizeMB > 0.5) {
            settings[field] = await compressImage(settings[field], {
              maxWidth: 1920,
              maxHeight: 1080,
              quality: 0.7,
              maxSizeMB: 0.5,
            });
          }
        } catch (error) {
          console.error(`壓縮 ${field} 失敗:`, error);
        }
      }
    }

    // 壓縮 features 中的 iconImage
    if (Array.isArray(settings.features)) {
      settings.features = await Promise.all(
        settings.features.map(async (feature: any) => {
          if (feature.iconImage && typeof feature.iconImage === "string") {
            try {
              const sizeMB = getBase64SizeMB(feature.iconImage);
              if (sizeMB > 0.5) {
                feature.iconImage = await compressImage(feature.iconImage, {
                  maxWidth: 800,
                  maxHeight: 800,
                  quality: 0.7,
                  maxSizeMB: 0.3,
                });
              }
            } catch (error) {
              console.error("壓縮 feature iconImage 失敗:", error);
            }
          }
          return feature;
        })
      );
    }

    // 壓縮 cards 中的 featuredImage
    if (Array.isArray(settings.cards)) {
      settings.cards = await Promise.all(
        settings.cards.map(async (card: any) => {
          if (card.featuredImage && typeof card.featuredImage === "string") {
            try {
              const sizeMB = getBase64SizeMB(card.featuredImage);
              if (sizeMB > 0.5) {
                card.featuredImage = await compressImage(card.featuredImage, {
                  maxWidth: 1200,
                  maxHeight: 800,
                  quality: 0.7,
                  maxSizeMB: 0.4,
                });
              }
            } catch (error) {
              console.error("壓縮 card featuredImage 失敗:", error);
            }
          }
          return card;
        })
      );
    }

    compressed.settings = settings;
  }

  return compressed;
}
