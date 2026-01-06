"use client"

import { useState, useCallback } from "react"
import { createSignedUploadUrls, recordUploadedImages } from "@/lib/actions"

export interface UploadProgress {
  imageId: string
  fileName: string
  progress: number // 0-100
  status: "pending" | "uploading" | "completed" | "failed"
  error?: string
}

interface UseImageUploadReturn {
  uploadImages: (projectId: string, files: File[]) => Promise<boolean>
  progress: UploadProgress[]
  isUploading: boolean
  error: string | null
  reset: () => void
}

export function useImageUpload(): UseImageUploadReturn {
  const [progress, setProgress] = useState<UploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setProgress([])
    setIsUploading(false)
    setError(null)
  }, [])

  const uploadImages = useCallback(async (projectId: string, files: File[]): Promise<boolean> => {
    if (files.length === 0) return false

    setIsUploading(true)
    setError(null)

    // Initialize progress for all files
    const initialProgress: UploadProgress[] = files.map((file, index) => ({
      imageId: `temp_${index}`,
      fileName: file.name,
      progress: 0,
      status: "pending",
    }))
    setProgress(initialProgress)

    try {
      // Step 1: Get signed upload URLs from server
      const fileMetadata = files.map((file) => ({
        name: file.name,
        type: file.type,
      }))

      const urlsResult = await createSignedUploadUrls(projectId, fileMetadata)

      if (!urlsResult.success) {
        setError(urlsResult.error)
        setIsUploading(false)
        return false
      }

      const signedUrls = urlsResult.data

      // Update progress with actual imageIds
      setProgress(
        signedUrls.map((url, index) => ({
          imageId: url.imageId,
          fileName: files[index].name,
          progress: 0,
          status: "uploading" as const,
        }))
      )

      // Step 2: Upload files directly to Supabase
      const uploadedImages: { imageId: string; path: string; fileName: string; fileSize: number; contentType: string }[] = []

      for (let i = 0; i < signedUrls.length; i++) {
        const { imageId, signedUrl, path } = signedUrls[i]
        const file = files[i]

        try {
          // Upload to Supabase using signed URL
          const response = await fetch(signedUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type,
            },
          })

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`)
          }

          // Mark this file as completed
          setProgress((prev) =>
            prev.map((p) =>
              p.imageId === imageId
                ? { ...p, progress: 100, status: "completed" as const }
                : p
            )
          )

          uploadedImages.push({
            imageId,
            path,
            fileName: file.name,
            fileSize: file.size,
            contentType: file.type,
          })
        } catch (uploadError) {
          // Mark this file as failed
          setProgress((prev) =>
            prev.map((p) =>
              p.imageId === imageId
                ? {
                    ...p,
                    status: "failed" as const,
                    error: uploadError instanceof Error ? uploadError.message : "Upload failed",
                  }
                : p
            )
          )
        }
      }

      // Step 3: Record successfully uploaded images in database
      if (uploadedImages.length > 0) {
        const recordResult = await recordUploadedImages(projectId, uploadedImages)

        if (!recordResult.success) {
          setError(recordResult.error)
          setIsUploading(false)
          return false
        }
      }

      setIsUploading(false)
      return uploadedImages.length > 0
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Upload failed")
      setIsUploading(false)
      return false
    }
  }, [])

  return {
    uploadImages,
    progress,
    isUploading,
    error,
    reset,
  }
}
