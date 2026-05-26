// Tải file từ một URL bằng cách fetch nó dưới dạng blob.
export const downloadMedia = async (url, fileNamePrefix = 'file', defaultExtension = '') => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        let extension = defaultExtension;
        const contentType = response.headers.get('content-type');

        // Xac định đuôi file từ Content-Type
        if (contentType) {
            // Ảnh
            if (contentType.includes('png')) extension = 'png';
            else if (contentType.includes('gif')) extension = 'gif';
            else if (contentType.includes('webp')) extension = 'webp';
            else if (contentType.includes('jpeg')) extension = 'jpg';
            else if (contentType.includes('svg')) extension = 'svg';
            // Video
            else if (contentType.includes('webm')) extension = 'webm';
            else if (contentType.includes('ogg')) extension = 'ogv';
            else if (contentType.includes('quicktime')) extension = 'mov';
            else if (contentType.includes('mp4')) extension = 'mp4';
        }

        // Dự phòng: Thử lấy đuôi từ URL nếu Content-Type không có
        if (!extension || extension === defaultExtension) {
            const urlExt = url.split('.').pop().split(/[?#]/)[0];
            if (urlExt && urlExt.length < 5) {
                extension = urlExt;
            }
        }

        // Dự phòng cuối cùng nếu hoàn toàn không tìm thấy gì
        if (!extension) {
            extension = 'file';
        }

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${fileNamePrefix}_${Date.now()}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Download failed:', error);
        // Dự phòng: mở trong tab mới
        window.open(url, '_blank');
    }
};


export const copyToClipboard = (text, successMessage = 'Đã sao chép liên kết!') => {
    navigator.clipboard.writeText(text);
    alert(successMessage);
};
