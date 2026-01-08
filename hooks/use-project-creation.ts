"use client";

import { useCallback, useState } from "react";
import type { StyleTemplate } from "@/lib/style-templates";

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  name: string;
}

export type CreationStep = "upload" | "room-type" | "style" | "confirm";

export interface ProjectCreationState {
  step: CreationStep;
  images: UploadedImage[];
  roomType: string | null;
  selectedTemplate: StyleTemplate | null;
  projectName: string;
  isSubmitting: boolean;
}

const INITIAL_STATE: ProjectCreationState = {
  step: "upload",
  images: [],
  roomType: null,
  selectedTemplate: null,
  projectName: "",
  isSubmitting: false,
};

export function useProjectCreation() {
  const [state, setState] = useState<ProjectCreationState>(INITIAL_STATE);

  const setStep = useCallback((step: CreationStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const addImages = useCallback((files: File[]) => {
    const newImages: UploadedImage[] = files.map((file, index) => ({
      id: `img_${Date.now()}_${index}`,
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    setState((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  }, []);

  const removeImage = useCallback((id: string) => {
    setState((prev) => {
      const imageToRemove = prev.images.find((img) => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return {
        ...prev,
        images: prev.images.filter((img) => img.id !== id),
      };
    });
  }, []);

  const setRoomType = useCallback((roomType: string | null) => {
    setState((prev) => ({ ...prev, roomType }));
  }, []);

  const setSelectedTemplate = useCallback((template: StyleTemplate | null) => {
    setState((prev) => ({ ...prev, selectedTemplate: template }));
  }, []);

  const setProjectName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, projectName: name }));
  }, []);

  const setIsSubmitting = useCallback((isSubmitting: boolean) => {
    setState((prev) => ({ ...prev, isSubmitting }));
  }, []);

  const reset = useCallback(() => {
    // Clean up preview URLs
    state.images.forEach((img) => URL.revokeObjectURL(img.preview));
    setState(INITIAL_STATE);
  }, [state.images]);

  const canProceed = useCallback(() => {
    switch (state.step) {
      case "upload":
        return state.images.length > 0;
      case "room-type":
        return state.roomType !== null;
      case "style":
        return state.selectedTemplate !== null;
      case "confirm":
        return state.projectName.trim().length > 0;
      default:
        return false;
    }
  }, [
    state.step,
    state.images.length,
    state.roomType,
    state.selectedTemplate,
    state.projectName,
  ]);

  const goToNextStep = useCallback(() => {
    if (!canProceed()) return;

    setState((prev) => {
      switch (prev.step) {
        case "upload":
          return { ...prev, step: "room-type" };
        case "room-type":
          return { ...prev, step: "style" };
        case "style":
          return { ...prev, step: "confirm" };
        default:
          return prev;
      }
    });
  }, [canProceed]);

  const goToPreviousStep = useCallback(() => {
    setState((prev) => {
      switch (prev.step) {
        case "room-type":
          return { ...prev, step: "upload" };
        case "style":
          return { ...prev, step: "room-type" };
        case "confirm":
          return { ...prev, step: "style" };
        default:
          return prev;
      }
    });
  }, []);

  return {
    ...state,
    setStep,
    addImages,
    removeImage,
    setRoomType,
    setSelectedTemplate,
    setProjectName,
    setIsSubmitting,
    reset,
    canProceed,
    goToNextStep,
    goToPreviousStep,
  };
}

export type UseProjectCreationReturn = ReturnType<typeof useProjectCreation>;
