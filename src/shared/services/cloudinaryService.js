const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const getResourceType = (file) => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    return "raw";
};

const getMediaType = (file) => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    return "file";
};

export const uploadFile = async (file) => {
    if (!file) throw new Error("Không có file");

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error("Thiếu cấu hình Cloudinary trong file .env");
    }

    const resourceType = getResourceType(file);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "appchat/messages");

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
        {
            method: "POST",
            body: formData
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || "Upload Cloudinary thất bại");
    }

    return {
        url: data.secure_url,
        publicId: data.public_id,
        resourceType,
        mediaType: getMediaType(file),
        original_filename: file.name,
        bytes: data.bytes || file.size
    };
};