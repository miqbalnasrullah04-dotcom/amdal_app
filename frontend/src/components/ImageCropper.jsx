import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

/**
 * ImageCropper - WhatsApp-style photo cropper with zoom and drag
 * 
 * @param {string} imageSrc - Source image URL (blob URL dari file yang dipilih)
 * @param {function} onCropComplete - Callback dengan cropped image blob
 * @param {function} onCancel - Callback ketika user cancel
 */
export default function ImageCropper({ imageSrc, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);

  const onCropChange = useCallback((location) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((zoom) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Function to create cropped image
  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return;

    setLoading(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedBlob);
    } catch (e) {
      console.error('Error cropping image:', e);
      alert('Gagal memotong foto. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[120] flex flex-col">
      {/* Header */}
      <div className="bg-[#1F2A22] text-white px-4 py-3 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="text-sm font-medium">Batal</span>
        </button>
        <h2 className="text-sm font-semibold">Sesuaikan Foto</h2>
        <button
          onClick={createCroppedImage}
          disabled={loading}
          className="bg-[#2E5E3B] hover:bg-[#244B2F] disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          {loading ? 'Memproses...' : 'Selesai'}
        </button>
      </div>

      {/* Cropper Area */}
      <div className="flex-1 relative">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1} // Square crop untuk foto profil
          cropShape="round" // Bulat seperti WhatsApp
          showGrid={false}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropCompleteCallback}
        />
      </div>

      {/* Zoom Controls */}
      <div className="bg-[#1F2A22] text-white px-6 py-6 flex items-center gap-4">
        <span className="material-symbols-outlined text-[20px]">zoom_out</span>
        <input
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="flex-1 accent-[#2E5E3B] cursor-pointer"
        />
        <span className="material-symbols-outlined text-[20px]">zoom_in</span>
      </div>

      {/* Instructions */}
      <div className="bg-[#1F2A22] text-white/60 px-6 pb-4 text-center text-xs">
        Geser untuk memposisikan · Pinch atau slider untuk zoom
      </div>
    </div>
  );
}

/**
 * Helper function to create cropped image blob
 */
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas size to the cropped area
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(blob);
    }, 'image/jpeg', 0.9); // JPEG quality 90%
  });
}

/**
 * Helper to load image
 */
function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}
