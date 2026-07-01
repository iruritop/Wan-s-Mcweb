// 相册API工具函数

/**
 * 解析文件名获取日期、类别和描述
 * @param {string} fileName - 文件名，格式如 "2025-12-01_建筑_动物园.webp"
 * @returns {object} 解析后的对象
 */
export function parseGalleryFileName(fileName) {
  // 移除文件后缀名
  const fileNameWithoutExt = fileName.replace(/\.[^.]+$/, '');
  
  const parts = fileNameWithoutExt.split('_');
  if (parts.length < 3) {
    return {
      date: fileNameWithoutExt,
      category: '未分类',
      description: fileNameWithoutExt
    };
  }
  
  const date = parts[0];
  const category = parts[1];
  // 第二个下划线后面的所有内容作为描述信息
  const description = parts.slice(2).join('_');
  
  return {
    date: date,
    category: category,
    description: description
  };
}

/**
 * 生成缩略图URL
 * @param {string} originalUrl - 原始图片URL
 * @param {number} width - 缩略图宽度
 * @param {number} quality - 图片质量 (0-100)
 * @returns {string} 缩略图URL
 */
export function generateGalleryThumbnailUrl(originalUrl, width = 400, quality = 80) {
  // 如果是本地图片，直接返回原图
  if (originalUrl.startsWith('/') || originalUrl.startsWith('./')) {
    return originalUrl;
  }
  
  // 检查URL是否有效
  if (!originalUrl || typeof originalUrl !== 'string') {
    console.warn('无效的图片URL:', originalUrl);
    return '/backgrounds/default.webp'; // 返回默认图片
  }
  
  // 对于网络图片，直接返回原图（客户端会进行压缩）
  // 避免在服务端修改URL，因为图片服务可能不支持参数
  return originalUrl;
}



/**
 * 扫描本地文件夹获取图片文件
 * @param {string} folderPath - 文件夹路径
 * @returns {Promise<Array>} 图片文件数组
 */
export async function scanLocalGalleryFolder(folderPath) {
  try {
    // 在Astro中，我们使用import.meta.glob来在构建时扫描静态资源
    // 这种方法在开发和生产环境中都能正常工作
    
    // 使用import.meta.glob扫描图片文件
    const imageModules = import.meta.glob('../../public/assets/gallery-images/*.{jpg,jpeg,png,webp,gif}', {
      eager: true,
      import: 'default'
    });
    
    // 提取文件名
    const imageFiles = Object.keys(imageModules).map(filePath => {
      // 从完整路径中提取文件名
      const fileName = filePath.split('/').pop();
      return fileName;
    });
    
    // 按文件名排序（通常是按日期排序）
    imageFiles.sort();
    
    const images = imageFiles.map((fileName, index) => {
      const { date, category, description } = parseGalleryFileName(fileName);
      const imageUrl = `${folderPath}/${fileName}`;
      
      return {
        id: index,
        imageUrl: imageUrl,
        thumbnailUrl: generateGalleryThumbnailUrl(imageUrl),
        date: date,
        category: category,
        description: description
      };
    });
    
    console.log(`构建时扫描到 ${images.length} 张相册图片`);
    return images;
  } catch (error) {
    console.error('构建时扫描本地文件夹失败:', error);
    
    // 如果动态扫描失败，回退到手动列表（保持向后兼容）
    console.log('尝试使用手动文件列表作为备选方案');
    return getManualGalleryImages(folderPath);
  }
}

/**
 * 手动文件列表备选方案
 * @param {string} folderPath - 文件夹路径
 * @returns {Array} 图片数据数组
 */
function getManualGalleryImages(folderPath) {
  // 手动文件列表（作为备选方案）
  const imageFiles = [
    // 生电分类图片
    '2025-10-05_生电_潜影贝农场.webp',
    '2025-10-08_生电_24核刷铁机.webp',
    '2025-10-10_生电_200k袭击塔.webp',
    '2025-10-11_生电_全树种树场.webp',
    '2025-10-13_生电_黑曜石机.webp',
    '2025-10-15_生电_464k_大云杉树场.webp',
    '2025-10-15_生电_640熔炉组.webp',
    '2026-01-08_生电_编码全物品.webp',
    '2026-01-13_生电_三维矢量珍珠炮.webp',
    '2026-02-11_生电_烈焰人农场.webp',
    
    // 建筑分类图片
    '2025-12-01_建筑_全生物收集.webp',
    '2025-12-23_建筑_芙洛薇的内心世界.webp'
  ];
  
  const images = imageFiles.map((fileName, index) => {
    const { date, category, description } = parseGalleryFileName(fileName);
    const imageUrl = `${folderPath}/${fileName}`;
    
    return {
      id: index,
      imageUrl: imageUrl,
      thumbnailUrl: generateGalleryThumbnailUrl(imageUrl),
      date: date,
      category: category,
      description: description
    };
  });
  
  console.log(`手动列表备选方案加载了 ${images.length} 张相册图片`);
  return images;
}

/**
 * 获取相册数据
 * @param {object} galleryConfig - 相册配置
 * @returns {Promise<Array>} 相册数据数组
 */
export async function getGalleryData(galleryConfig) {
  // 直接使用文件夹路径获取图片数据
  const images = await scanLocalGalleryFolder(galleryConfig.imagesFolder);
  return images.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * 从相册数据中提取所有分类
 * @param {Array} galleryData - 相册数据
 * @returns {Array} 分类数组
 */
export function extractCategories(galleryData) {
  const categories = ['全部'];
  const categorySet = new Set();
  
  galleryData.forEach(item => {
    if (item.category && !categorySet.has(item.category)) {
      categorySet.add(item.category);
      categories.push(item.category);
    }
  });
  
  return categories;
}

/**
 * 预加载图片
 * @param {string} url - 图片URL
 * @returns {Promise} 图片加载Promise
 */
export function preloadGalleryImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * 批量预加载图片
 * @param {Array} urls - 图片URL数组
 * @returns {Promise} 所有图片加载完成的Promise
 */
export function preloadGalleryImages(urls) {
  return Promise.all(urls.map(url => preloadGalleryImage(url)));
}