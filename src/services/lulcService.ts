import { Platform } from 'react-native';
import ImageResizer from 'react-native-image-resizer';
import type { DatasetType } from '../components/DatasetSelector';

const BACKEND_URL = 'https://lulc-recognition-lulc-backend.hf.space';

export interface LulcPredictionResponse {
  predicted_class: string;
  confidence: number;
  explain_maps: Record<string, string>;
  class_index?: number;
  all_predictions?: any[];
  inference_time_ms?: number;
  image_info?: {
    width: number;
    height: number;
    format: string;
  };
}

export class LulcService {
  /**
   * Performs LULC recognition by sending an image to the FastAPI backend.
   * Handles dynamic resizing based on the dataset type.
   */
  static async predict(
    imageUri: string,
    modelType: DatasetType,
    originalWidth: number,
    originalHeight: number,
  ): Promise<LulcPredictionResponse> {
    let uploadUri = imageUri;

    // 1. Dynamic Resizing Logic
    try {
      if (modelType === 'eurosat') {
        // EuroSAT: Resize to 64x64 if larger
        if (originalWidth > 64 || originalHeight > 64) {
          const resized = await ImageResizer.createResizedImage(
            imageUri,
            64,
            64,
            'JPEG',
            90,
            0,
            undefined,
            false,
            { mode: 'contain', onlyScaleDown: true }
          );
          uploadUri = resized.uri;
        }
      } else {
        // Others (MLRSNet, PatternNet): Resize to 1024px if larger for bandwidth
        if (originalWidth > 1024 || originalHeight > 1024) {
          const resized = await ImageResizer.createResizedImage(
            imageUri,
            1024,
            1024,
            'JPEG',
            85,
            0,
            undefined,
            false,
            { mode: 'contain', onlyScaleDown: true }
          );
          uploadUri = resized.uri;
        }
      }
    } catch (resizeError) {
      console.warn('Resizing failed, falling back to original image:', resizeError);
      // Fallback to original image if resizing fails
      uploadUri = imageUri;
    }

    // 2. Data Preparation
    const formData = new FormData();
    
    // Formatting URI for Android (file:// prefix handling if needed, though RN usually handles it)
    const cleanUri = Platform.OS === 'android' ? uploadUri : uploadUri.replace('file://', '');

    formData.append('file', {
      uri: uploadUri,
      name: `upload_${Date.now()}.jpg`,
      type: 'image/jpeg',
    } as any);

    formData.append('model_type', modelType);

    // 3. Request Execution with Timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      clearTimeout(timeoutId);

      if (response.status === 503 || response.status === 504) {
        throw new Error('SERVER_SLEEPING');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const result: LulcPredictionResponse = await response.json();
      return result;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('TIMEOUT');
      }
      
      if (error.message === 'SERVER_SLEEPING') {
        throw new Error('The backend server is currently waking up. Please wait about 30 seconds and try again.');
      }

      throw error;
    }
  }
}
