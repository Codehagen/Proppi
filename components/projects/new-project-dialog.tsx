"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  IconUpload,
  IconPalette,
  IconCheck,
  IconArrowRight,
  IconArrowLeft,
  IconSparkles,
  IconLoader2,
} from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useProjectCreation, type CreationStep } from "@/hooks/use-project-creation"
import { useImageUpload } from "@/hooks/use-image-upload"
import { UploadStep } from "@/components/projects/steps/upload-step"
import { StyleStep } from "@/components/projects/steps/style-step"
import { ConfirmStep } from "@/components/projects/steps/confirm-step"
import { createProjectAction } from "@/lib/actions"

interface NewProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STEPS: { id: CreationStep; label: string; icon: React.ReactNode }[] = [
  { id: "upload", label: "Upload", icon: <IconUpload className="h-4 w-4" /> },
  { id: "style", label: "Style", icon: <IconPalette className="h-4 w-4" /> },
  { id: "confirm", label: "Confirm", icon: <IconCheck className="h-4 w-4" /> },
]

function StepIndicator({
  steps,
  currentStep,
}: {
  steps: typeof STEPS
  currentStep: CreationStep
}) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep
        const isCompleted = index < currentIndex

        return (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200",
                isActive && "bg-[var(--accent-teal)]/10 text-[var(--accent-teal)]",
                isCompleted && "text-[var(--accent-teal)]",
                !isActive && !isCompleted && "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs transition-all duration-200",
                  isActive && "bg-[var(--accent-teal)] text-white",
                  isCompleted && "bg-[var(--accent-teal)] text-white",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <IconCheck className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-8 transition-colors duration-200",
                  index < currentIndex ? "bg-[var(--accent-teal)]" : "bg-border"
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export function NewProjectDialog({ open, onOpenChange }: NewProjectDialogProps) {
  const router = useRouter()
  const creation = useProjectCreation()
  const imageUpload = useImageUpload()

  const handleClose = React.useCallback(() => {
    creation.reset()
    imageUpload.reset()
    onOpenChange(false)
  }, [creation, imageUpload, onOpenChange])

  const handleSubmit = React.useCallback(async () => {
    if (!creation.canProceed() || !creation.selectedTemplate) return

    creation.setIsSubmitting(true)

    try {
      // Step 1: Create the project
      const projectFormData = new FormData()
      projectFormData.set("name", creation.projectName)
      projectFormData.set("styleTemplateId", creation.selectedTemplate.id)

      const projectResult = await createProjectAction(projectFormData)

      if (!projectResult.success) {
        console.error("Failed to create project:", projectResult.error)
        creation.setIsSubmitting(false)
        return
      }

      const project = projectResult.data

      // Step 2: Upload images directly to Supabase (client-side)
      const files = creation.images.map((img) => img.file)
      const uploadSuccess = await imageUpload.uploadImages(project.id, files)

      if (!uploadSuccess) {
        console.error("Failed to upload images:", imageUpload.error)
        // Project was created but images failed - still redirect to project
      }

      // Success - redirect to project detail page
      creation.reset()
      imageUpload.reset()
      onOpenChange(false)
      router.push(`/dashboard/${project.id}`)
    } catch (error) {
      console.error("Project creation error:", error)
      creation.setIsSubmitting(false)
    }
  }, [creation, imageUpload, onOpenChange, router])

  const stepTitles: Record<CreationStep, { title: string; description: string }> = {
    upload: {
      title: "Upload Images",
      description: "Add the real estate photos you want to enhance",
    },
    style: {
      title: "Choose Style",
      description: "Select a transformation style for your photos",
    },
    confirm: {
      title: "Review & Confirm",
      description: "Name your project and review before processing",
    },
  }

  const currentStepInfo = stepTitles[creation.step]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="lg" className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <DialogHeader className="space-y-3">
            <StepIndicator steps={STEPS} currentStep={creation.step} />
            <div className="pt-2 text-center">
              <DialogTitle className="text-xl">{currentStepInfo.title}</DialogTitle>
              <DialogDescription className="mt-1">
                {currentStepInfo.description}
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {creation.step === "upload" && (
            <UploadStep
              images={creation.images}
              onAddImages={creation.addImages}
              onRemoveImage={creation.removeImage}
            />
          )}
          {creation.step === "style" && (
            <StyleStep
              selectedTemplate={creation.selectedTemplate}
              onSelectTemplate={creation.setSelectedTemplate}
            />
          )}
          {creation.step === "confirm" && (
            <ConfirmStep
              images={creation.images}
              selectedTemplate={creation.selectedTemplate}
              projectName={creation.projectName}
              onProjectNameChange={creation.setProjectName}
              estimatedCost={creation.estimatedCost}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t bg-muted/30 px-6 py-4">
          <div>
            {creation.step !== "upload" && (
              <Button
                variant="ghost"
                onClick={creation.goToPreviousStep}
                className="gap-2"
                disabled={creation.isSubmitting}
              >
                <IconArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleClose} disabled={creation.isSubmitting}>
              Cancel
            </Button>

            {creation.step === "confirm" ? (
              <Button
                onClick={handleSubmit}
                disabled={!creation.canProceed() || creation.isSubmitting}
                className="gap-2 min-w-[140px]"
                style={{ backgroundColor: "var(--accent-teal)" }}
              >
                {creation.isSubmitting ? (
                  <>
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <IconSparkles className="h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={creation.goToNextStep}
                disabled={!creation.canProceed()}
                className="gap-2"
                style={{ backgroundColor: "var(--accent-teal)" }}
              >
                Continue
                <IconArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
