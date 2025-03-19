import Compressor from "compressorjs";

export interface CompressionOptions {
  acceptedImageTypes?: string[]; // e.g. ["image/png", "image/jpeg", "image/jpg"]
  targetSizeBytes?: number; // target size in bytes (default: 2MB)
  quality?: number; // fixed quality for compression (default: 0.1)
}

/**
 * Compresses an image file using a fixed quality setting.
 *
 * - If the file is already less than or equal to targetSizeBytes, it returns the original.
 * - Otherwise, it compresses the image using Compressor.js with quality = 0.1.
 *
 * @param file The File object to compress.
 * @param options Compression options.
 * @returns A Promise that resolves with the (possibly compressed) File.
 */
export async function compressMediaFile(
  file: File,
  options?: CompressionOptions
): Promise<File> {
  const {
    acceptedImageTypes = ["image/png", "image/jpeg", "image/jpg"],
    targetSizeBytes = 1.5 * 1024 * 1024, // 1.5MB
    quality = 0.1,
  } = options || {};

  if (file.type.startsWith("image/")) {
    // Check if the image type is supported.
    if (!acceptedImageTypes.includes(file.type)) {
      return Promise.reject(
        new Error("Supported types are only .jpg, .jpeg, and .png")
      );
    }
    // If image is already within the target size, return the original.
    if (file.size <= targetSizeBytes) {
      return file;
    }
    // Compress the image using fixed quality.
    return new Promise<File>((resolve, reject) => {
      new Compressor(file, {
        quality,
        success(result) {
          const compressedFile = new File([result], file.name, {
            type: file.type,
          });
          console.log(
            `Image: ${file.name}, Original: ${file.size} bytes, Compressed: ${compressedFile.size} bytes, Quality: ${quality}`
          );
          resolve(compressedFile);
        },
        error(err) {
          reject(err);
        },
      });
    });
  } else {
    // Reject any non-image file.
    return Promise.reject(
      new Error("Invalid file type. Please upload an image only.")
    );
  }
}

/**
 * Processes an array of files and returns valid (compressed) files along with any errors.
 *
 * @param files Array of File objects.
 * @param options Compression options.
 * @returns An object containing validFiles and errors.
 */
export async function compressMediaFiles(
  files: File[],
  options?: CompressionOptions
): Promise<{ validFiles: File[]; errors: string[] }> {
  const validFiles: File[] = [];
  const errors: string[] = [];

  for (const file of files) {
    try {
      const compressedFile = await compressMediaFile(file, options);
      validFiles.push(compressedFile);
    } catch (error: any) {
      errors.push(error.message);
    }
  }
  return { validFiles, errors };
}
