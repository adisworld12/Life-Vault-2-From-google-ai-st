import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { triggerHaptic } from '../utils/security';

export interface CapturedImageResult {
  dataUrl: string;
  format: string;
  source: 'camera' | 'photos' | 'file';
  name: string;
}

/**
 * Captures a photo using native Capacitor Camera or falls back to file/stream.
 */
export async function capturePhotoNative(): Promise<CapturedImageResult | null> {
  try {
    if (Capacitor.isPluginAvailable('Camera')) {
      await triggerHaptic('light');
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        saveToGallery: false,
        promptLabelHeader: 'Scan Document',
        promptLabelPhoto: 'From Photos',
        promptLabelPicture: 'Take Photo',
      });

      if (image.dataUrl) {
        await triggerHaptic('success');
        return {
          dataUrl: image.dataUrl,
          format: image.format || 'jpeg',
          source: 'camera',
          name: `Scan_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-4)}.${image.format || 'jpg'}`,
        };
      }
    }
  } catch (error: any) {
    // User cancelled or camera unavailable
    if (error?.message?.includes('User cancelled') || error?.message?.includes('cancelled')) {
      return null;
    }
    console.warn('Native camera capture error:', error);
    throw error;
  }

  return null;
}

/**
 * Selects an image from the native Photo Library.
 */
export async function pickPhotoFromGallery(): Promise<CapturedImageResult | null> {
  try {
    if (Capacitor.isPluginAvailable('Camera')) {
      await triggerHaptic('light');
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      if (image.dataUrl) {
        await triggerHaptic('success');
        return {
          dataUrl: image.dataUrl,
          format: image.format || 'jpeg',
          source: 'photos',
          name: `Photo_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-4)}.${image.format || 'jpg'}`,
        };
      }
    }
  } catch (error: any) {
    if (error?.message?.includes('User cancelled') || error?.message?.includes('cancelled')) {
      return null;
    }
    console.warn('Native photo gallery error:', error);
    throw error;
  }

  return null;
}
