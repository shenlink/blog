import dotenv from 'dotenv';

// 加载 .env 文件
dotenv.config();

export const apiUrl: string | null = process.env.GENERATE_ARTICLES_URL_FRONTMATTER_URL || null;