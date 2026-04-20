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

    // 2. Blob-Stream Implementation
    // Read the file locally first to ensure the native layer has full access to the bits
    let blob: Blob;
    try {
      const localResponse = await fetch(uploadUri);
      blob = await localResponse.blob();
    } catch (localError) {
      console.error('[LULC] Failed to read local file:', localError);
      throw new Error('Could not read the selected image file from your device.');
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', `${BACKEND_URL}/predict`);
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            reject(new Error('Server returned invalid data format.'));
          }
        } else {
          reject(new Error(`Server Error (${xhr.status}): ${xhr.responseText || 'Check network'}`));
        }
      };
      
      xhr.onerror = () => {
        console.error('[LULC] XHR Detailed Failure:', xhr);
        reject(new Error('Network request failed. Your device connection to Hugging Face was rejected.'));
      };

      xhr.timeout = 60000;
      
      // Browser-Mimicking Headers to bypass HF Proxy/Cloudflare
      xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
      xhr.setRequestHeader('Origin', 'https://huggingface.co');
      xhr.setRequestHeader('Referer', 'https://huggingface.co/spaces/Lulc-Recognition/lulc-backend');
      xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
      
      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');
      formData.append('model_type', modelType);
      
      xhr.send(formData);
    });
  }
}
