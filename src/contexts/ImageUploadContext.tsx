import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { imgurService } from '~/services/imgur';

interface ImageUploadContextType {
  isImagePickerVisible: boolean;
  isUploading: boolean;
  isCompleted: boolean;
  uploadProgress: number;
  selectedImages: string[];
  imagesSend: string[];
  isHeadlessMenuVisible: boolean;
  isModalVisibleProduct: boolean;
  isModalVisibleQuickMessage: boolean;
  quickMessageData: string;
  showImagePicker: () => void;
  hideImagePicker: () => void;
  handleImagesSelected: (imageUris: string[]) => void;
  resetUploadState: () => void;
  setImagesSend: (urls: string[]) => void;
  toggleHeadlessMenu: () => void;
  hideHeadlessMenu: () => void;
  setIsModalVisibleProduct: (value: boolean) => void;
  setIsModalVisibleQuickMessage: (value: boolean) => void;
  setQuickMessageData: (data: string) => void;
}

const ImageUploadContext = createContext<ImageUploadContextType | undefined>(undefined);

interface ImageUploadProviderProps {
  children: ReactNode;
}

export const ImageUploadProvider: React.FC<ImageUploadProviderProps> = ({ children }) => {
  // Image picker visibility
  const [isImagePickerVisible, setIsImagePickerVisible] = useState(false);

  // Headless menu visibility
  const [isHeadlessMenuVisible, setIsHeadlessMenuVisible] = useState(false);
  const [isModalVisibleProduct, setIsModalVisibleProduct] = useState(false);
  const [isModalVisibleQuickMessage, setIsModalVisibleQuickMessage] = useState(false);

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Images data
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imagesSend, setImagesSend] = useState<string[]>([]);

  // quick message data
  const [quickMessageData, setQuickMessageData] = useState('');

  const showImagePicker = useCallback(() => {
    setIsImagePickerVisible(true);
  }, []);

  const hideImagePicker = useCallback(() => {
    setIsImagePickerVisible(false);
  }, []);

  const toggleHeadlessMenu = useCallback(() => {
    setIsHeadlessMenuVisible((prev) => !prev);
  }, []);

  const hideHeadlessMenu = useCallback(() => {
    setIsHeadlessMenuVisible(false);
  }, []);

  const resetUploadState = useCallback(() => {
    setUploadProgress(0);
    setIsCompleted(false);
    setIsUploading(false);
    setSelectedImages([]);
  }, []);

  const handleImagesSelected = useCallback(
    (imageUris: string[]) => {
      setSelectedImages(imageUris);

      if (imageUris.length > 0) {
        setIsUploading(true);
        setUploadProgress(0.01);
        try {
          imgurService
            .uploadMultipleImages(imageUris, {
              onProgress: (progress) => {
                setUploadProgress((currentProgress) => {
                  return Math.max(0.01, progress > currentProgress ? progress : currentProgress);
                });
              },
            })
            .then((results) => {
              const successfulUploads = results.filter((result) => result.success).map((result) => result.url);

              setImagesSend(successfulUploads);
              setIsCompleted(true);
              setSelectedImages([]);

              setTimeout(() => {
                resetUploadState();
              }, 200);
            })
            .catch((error) => {
              console.error('Error uploading images:', error);
              resetUploadState();
            });
        } catch (error) {
          console.error('Error uploading images:', error);
          resetUploadState();
        }
      }
    },
    [resetUploadState],
  );

  const value = {
    isImagePickerVisible,
    isUploading,
    isCompleted,
    uploadProgress,
    selectedImages,
    imagesSend,
    isHeadlessMenuVisible,
    isModalVisibleProduct,
    isModalVisibleQuickMessage,
    quickMessageData,
    showImagePicker,
    hideImagePicker,
    handleImagesSelected,
    resetUploadState,
    setImagesSend,
    toggleHeadlessMenu,
    hideHeadlessMenu,
    setIsModalVisibleProduct,
    setIsModalVisibleQuickMessage,
    setQuickMessageData,
  };

  return <ImageUploadContext.Provider value={value}>{children}</ImageUploadContext.Provider>;
};

export const useImageUpload = (): ImageUploadContextType => {
  const context = useContext(ImageUploadContext);
  if (context === undefined) {
    throw new Error('useImageUpload must be used within an ImageUploadProvider');
  }
  return context;
};
