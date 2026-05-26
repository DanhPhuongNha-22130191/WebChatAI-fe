const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Service này gửi api upload hình ảnh/video đến Cloudinary
export const uploadFile = async (file) => {
    // Tự động nhận diện resource_type
    let resourceType = 'raw';
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (file.type.startsWith('image/') || isPdf) resourceType = 'image';
    else if (file.type.startsWith('video/')) resourceType = 'video';

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        // base url of cloudinary
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Upload failed');
        }

        const data = await response.json();
        console.log(data);
        return {
            url: data.secure_url, // url trả về từ Cloudinary
            type: resourceType, // 'image', 'video' hoặc 'raw'
            format: data.format, // đuôi file
            original_filename: data.original_filename,
            bytes: data.bytes
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};
