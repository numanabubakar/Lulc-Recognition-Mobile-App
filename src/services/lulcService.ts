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
    mimeType: string = 'image/jpeg',
    fileName: string = 'image.jpg',
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
    
    // 2.1. Append non-file fields FIRST (Some FastAPI versions prefer this)
    formData.append('model_type', modelType);

    // 2.2. URI Handling Logic
    let finalUri = uploadUri;
    if (Platform.OS === 'android') {
      const needsPrefix = !uploadUri.startsWith('file://') && !uploadUri.startsWith('content://');
      if (needsPrefix) {
        finalUri = `file://${uploadUri}`;
      }
    }

    // 2.3. Append File with sanitized name and explicit MIME
    const safeName = fileName?.includes('.') ? fileName : `${fileName || 'image'}.jpg`;
    formData.append('file', {
      uri: finalUri,
      name: safeName,
      type: mimeType || 'image/jpeg',
    } as any);

    // 3. Request Execution with Diagnostics
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      // 3.1. Pre-flight Health Check
      try {
        const healthCheck = await fetch(BACKEND_URL, { 
          method: 'GET', 
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'User-Agent': 'Mozilla/5.0 (Mobile) LulcApp/1.0',
          }
        });
        if (!healthCheck.ok && healthCheck.status !== 405) {
          console.warn(`Health check returned status: ${healthCheck.status}`);
        }
      } catch (healthError: any) {
        throw new Error(`HEALTH_CHECK_FAILED: ${healthError.message}`);
      }

      // 3.2. Actual Inference Request
      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          // OMITTING custom Origin/Referer to avoid pre-flight certificate issues
          // OMITTING Content-Type to let fetch set the multipart boundary automatically
        },
      });

      clearTimeout(timeoutId);

      // Handle 503 Service Unavailable (Hugging Face Sleeping)
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
      
      // Detailed error mapping
      if (error.message?.startsWith('HEALTH_CHECK_FAILED')) {
        throw new Error(
          'Server unreachable. Please check your internet connection and ensure you aren\'t behind a firewall blocking Hugging Face.'
        );
      }

      if (error.message === 'Network request failed') {
        throw new Error(
          'Inference request failed at the network level. This usually happens if the upload is blocked or the server rejected the binary data.'
        );
      }
      
      if (error.name === 'AbortError') {
        throw new Error('The request timed out (60s). The server might be taking too long to process the image.');
      }
      
      if (error.message === 'SERVER_SLEEPING') {
        throw new Error('The backend server is currently waking up. Please wait about 30 seconds and try again.');
      }

      throw error;
    }
  }
}
