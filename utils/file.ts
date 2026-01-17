
export const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        // 简单验证
        if (!file.type.startsWith('image/')) {
            reject(new Error('请上传图片文件'));
            return;
        }

        // GIF 不压缩直接读取（限制大小）
        if (file.type === 'image/gif') {
            if (file.size > 4 * 1024 * 1024) {
                reject(new Error('为了保持流畅，GIF 图片请小于 4MB'));
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = (e) => reject(e);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                // 压缩逻辑 (稍微提高上限以适应立绘)
                const MAX_WIDTH = 1200; 
                const MAX_HEIGHT = 1200;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context error'));
                    return;
                }
                
                // 清空画布 (保证透明)
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                
                // 智能格式选择: 如果原图是PNG/WebP，保持格式以保留透明通道
                // 否则转为 JPEG 0.85 质量
                let mimeType = 'image/jpeg';
                if (file.type === 'image/png' || file.type === 'image/webp') {
                    mimeType = file.type;
                }
                
                const dataUrl = canvas.toDataURL(mimeType, 0.85);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(new Error('图片加载失败'));
        };
        reader.onerror = (err) => reject(new Error('文件读取失败'));
    });
};
