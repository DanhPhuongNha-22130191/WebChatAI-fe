import { useState, useCallback } from 'react';
import { uploadFile } from "../../../shared/services/cloudinaryService.js";

/**
 * Hook chuyên biệt xử lý chọn và upload file
 */
export const useChatFileUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleSelectFile = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) {
                alert("File quá lớn! Vui lòng chọn file dưới 50MB.");
                return;
            }
            setSelectedFile(file);
        }
    }, []);

    const handleRemoveFile = useCallback(() => {
        setSelectedFile(null);
        const fileInput = document.getElementById('chat-file-input');
        if (fileInput) fileInput.value = '';
    }, []);

    const uploadSelectedFile = useCallback(async () => {
        if (!selectedFile) return null;

        setIsUploading(true);
        try {
            const result = await uploadFile(selectedFile);
            handleRemoveFile();
            return result;
        } catch (error) {
            console.error("Upload thất bại:", error);
            alert("Gửi file thất bại. Vui lòng thử lại.");
            throw error;
        } finally {
            setIsUploading(false);
        }
    }, [selectedFile, handleRemoveFile]);

    return {
        selectedFile,
        isUploading,
        handleSelectFile,
        handleRemoveFile,
        uploadSelectedFile
    };
};
