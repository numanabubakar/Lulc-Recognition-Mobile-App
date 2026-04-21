import { Platform } from 'react-native';
import ImageResizer from 'react-native-image-resizer';
import type { DatasetType } from '../components/DatasetSelector';

const BACKEND_URL = 'https://lulc-recognition-lulc-backend.hf.space';

export interface LulcPredictionResponse {
  predicted_class: string;
  confidence: number;
  explainability_maps: Record<string, string>;
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

    // 2. Reliable Base64-JSON Implementation (The Final Fix)
    try {
      // Step A: Read local file and convert to Base64
      const localResponse = await fetch(uploadUri);
      const blob = await localResponse.blob();
      
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Step B: Send as clean JSON to the new endpoint
      const response = await fetch(`${BACKEND_URL}/predict_mobile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Request-Source': 'LulcMobileApp',
        },
        body: JSON.stringify({
          image_b64: base64Data,
          model_type: String(modelType).trim().toLowerCase(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Backend Error' }));
        console.error('[LULC] Server Rejection:', JSON.stringify(errorData));
        throw new Error(`Server Rejected: ${JSON.stringify(errorData.detail || errorData)}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('[LULC] Inference Process Failed:', error);
      throw error;
    }
  }
}
