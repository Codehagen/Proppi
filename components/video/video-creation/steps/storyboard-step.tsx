"use client"

import * as React from "react"
import Image from "next/image"
import { 
    IconPhoto, 
    IconPlus, 
    IconX, 
    IconCheck, 
    IconLoader2, 
    IconHome,
    IconSofa,
    IconBed,
    IconBath,
    IconToolsKitchen2,
    IconArmchair,
    IconDesk
} from "@tabler/icons-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { getVideoTemplateById } from "@/lib/video/video-templates"
import { uploadVideoSourceImageAction } from "@/lib/actions/video"
import type { VideoImageItem } from "@/hooks/use-video-creation"
import { Badge } from "@/components/ui/badge"

interface StoryboardStepProps {
  selectedTemplateId: string
  images: VideoImageItem[]
  onAddImageToSlot: (image: Omit<VideoImageItem, "sequenceOrder">, slotIndex: number) => void
  onRemoveImage: (id: string) => void
}

const ROOM_ICONS: Record<string, React.ReactNode> = {
  "living-room": <IconSofa className="h-5 w-5" />,
  "bedroom": <IconBed className="h-5 w-5" />,
  "kitchen": <IconToolsKitchen2 className="h-5 w-5" />,
  "bathroom": <IconBath className="h-5 w-5" />,
  "dining-room": <IconArmchair className="h-5 w-5" />,
  "office": <IconDesk className="h-5 w-5" />,
  "exterior": <IconHome className="h-5 w-5" />,
  "hallway": <IconHome className="h-5 w-5" />,
  "terrace": <IconHome className="h-5 w-5" />,
  "garden": <IconHome className="h-5 w-5" />,
}

export function StoryboardStep({
  selectedTemplateId,
  images,
  onAddImageToSlot,
  onRemoveImage,
}: StoryboardStepProps) {
  const template = getVideoTemplateById(selectedTemplateId)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [activeSlotIndex, setActiveSlotIndex] = React.useState<number | null>(null)
  const [uploadingSlotIndex, setUploadingSlotIndex] = React.useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)

  const uploadFile = React.useCallback(async (file: File, index: number) => {
    if (!template) return

    setUploadingSlotIndex(index)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const result = await uploadVideoSourceImageAction(formData)

      if (result.success) {
         // Determine room type from template slot
         const slot = template.slots[index]
         
         onAddImageToSlot({
            id: result.imageId,
            url: result.url,
            roomType: slot?.roomType || "other",
            roomLabel: slot?.label || "",
         }, index)
      } else {
          toast.error("Failed to upload image")
      }
    } catch (error) {
      console.error("Upload failed:", error)
      toast.error("Failed to upload image")
    } finally {
      setUploadingSlotIndex(null)
    }
  }, [template, onAddImageToSlot])

  const handleAddClick = (index: number) => {
    setActiveSlotIndex(index)
    // Small timeout to ensure state is set before click (safeguard)
    setTimeout(() => {
        fileInputRef.current?.click()
    }, 0)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || activeSlotIndex === null) return

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    await uploadFile(file, activeSlotIndex)
    setActiveSlotIndex(null)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
    setDragOverIndex(index)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverIndex(null)
  }

  const handleDrop = async (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(null)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are supported")
      return
    }

    await uploadFile(file, index)
  }

  if (!template) {
      return <div>Template not found</div>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
           <h2 className="text-2xl font-bold tracking-tight">{template.name}</h2>
           <p className="text-muted-foreground mt-1">{template.description}</p>
        </div>
        
        {/* Progress */}
        <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-full border">
           <div className="flex flex-col items-end">
               <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Completion</span>
               <div className="flex items-center gap-1.5">
                   <span className={cn(
                       "text-lg font-bold", 
                       images.length === template.slots.length ? "text-(--accent-green)" : "text-foreground"
                   )}>
                       {images.length}
                   </span>
                   <span className="text-muted-foreground">/</span>
                   <span className="text-muted-foreground">{template.slots.length} shots</span>
               </div>
           </div>
           
           {/* Circular Progress */}
           <div className="relative h-10 w-10">
               <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                   <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted" />
                   <path 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        fill="none" 
                        stroke={images.length === template.slots.length ? "var(--accent-green)" : "var(--accent-teal)"} 
                        strokeWidth="4" 
                        strokeDasharray={`${(images.length / template.slots.length) * 100}, 100`}
                        className="transition-all duration-500 ease-out"
                   />
               </svg>
           </div>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {template.slots.map((slot, index) => {
             // Find image for this slot (sequenceOrder is 1-based)
             const image = images.find(img => img.sequenceOrder === index + 1)
             const isUploading = uploadingSlotIndex === index
             const Icon = ROOM_ICONS[slot.roomType] || <IconPhoto className="h-5 w-5" />

             return (
                 <div key={index} className="space-y-3 group">
                     {/* Slot Header */}
                     <div className="flex items-center justify-between px-1">
                         <div className="flex items-center gap-2">
                             <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                                 {index + 1}
                             </div>
                             <span className="font-medium text-sm">{slot.label}</span>
                         </div>
                         {image && (
                             <Badge variant="outline" className="bg-(--accent-green)/10 text-(--accent-green) border-(--accent-green)/20 text-[10px] px-1.5 py-0 h-5">
                                 <IconCheck className="mr-1 h-3 w-3" />
                                 Ready
                             </Badge>
                         )}
                     </div>

                     {/* Slot Card */}
                     <div 
                        onClick={() => !image && !isUploading && handleAddClick(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        className={cn(
                             "relative aspect-video rounded-xl border-2 transition-all duration-200 overflow-hidden bg-muted/30",
                             image 
                                ? "border-transparent shadow-sm" 
                                : "border-dashed border-muted-foreground/20 cursor-pointer hover:border-(--accent-teal) hover:bg-(--accent-teal)/5",
                             dragOverIndex === index && "border-(--accent-teal) bg-(--accent-teal)/5 ring-2 ring-(--accent-teal)/20 scale-[1.02]",
                             isUploading && "border-(--accent-teal) cursor-wait"
                        )}
                     >
                         {/* Existing Image */}
                         {image && (
                             <>
                                <Image
                                    src={image.url}
                                    alt={slot.label}
                                    fill
                                    className="object-cover"
                                />
                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onRemoveImage(image.id)
                                        }}
                                        className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md hover:bg-red-500/80 transition-colors text-white"
                                    >
                                        <IconX className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Drop to replace overlay */}
                                {dragOverIndex === index && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-(--accent-teal)/80 backdrop-blur-sm z-10 animate-in fade-in duration-200">
                                        <IconPlus className="h-10 w-10 text-white animate-bounce" />
                                        <span className="text-sm font-bold text-white mt-2">Drop to replace</span>
                                    </div>
                                )}
                             </>
                         )}

                         {/* Loading State */}
                         {isUploading && (
                             <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                                 <IconLoader2 className="h-8 w-8 animate-spin text-(--accent-teal)" />
                                 <span className="text-xs font-medium mt-2">Uploading...</span>
                             </div>
                         )}

                         {/* Empty State */}
                         {!image && !isUploading && (
                             <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                 <div className="mb-2 rounded-full bg-muted p-3 text-muted-foreground group-hover:text-(--accent-teal) transition-colors">
                                     {Icon}
                                 </div>
                                 <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                                     {slot.description || "Click to add photo"}
                                 </span>
                                 
                                 <div className="mt-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                     <span className="inline-flex items-center gap-1 text-xs font-bold text-(--accent-teal)">
                                         <IconPlus className="h-3 w-3" />
                                         Add Photo
                                     </span>
                                 </div>

                                 {/* Drag over indicator for empty slot */}
                                 {dragOverIndex === index && (
                                     <div className="absolute inset-0 flex items-center justify-center bg-(--accent-teal)/10 z-10">
                                         <div className="rounded-full bg-(--accent-teal) p-3 shadow-lg animate-pulse">
                                             <IconPlus className="h-6 w-6 text-white" />
                                         </div>
                                     </div>
                                 )}
                             </div>
                         )}
                     </div>
                 </div>
             )
         })}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
