'use client';

import { useState, useRef } from 'react';
import type { Apartment } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import apiFetch from '@/lib/api';

interface PhotoUploaderProps {
  apartment: Apartment;
  onUploadSuccess: () => void;
}

export default function PhotoUploader({ apartment, onUploadSuccess }: PhotoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please choose a photo to upload.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);

    try {
        await apiFetch(`/apartments/${apartment.id}/photos`, {
            method: 'POST',
            body: formData,
        });

      toast({
        title: "Photo Uploaded!",
        description: "Your photo has been successfully added to the listing.",
      });

      // Reset form and refresh data
      setFile(null);
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onUploadSuccess();

    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeletePhoto = async (photoId: string) => {
    // Note: A DELETE /apartments/{apartment_id}/photos/{photo_id} endpoint would be needed.
    // This is a placeholder for that functionality.
    toast({ title: 'Delete not implemented', description: 'This feature requires a backend endpoint for deleting photos.'})
  }

  return (
    <div className="space-y-6">
      {/* Display Existing Photos */}
      <div>
        <h4 className="text-md font-medium mb-4">Current Photos</h4>
        {apartment.photos && apartment.photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {apartment.photos.map(photo => (
              <div key={photo.id} className="relative group aspect-square">
                <Image
                  src={photo.url}
                  alt={photo.hint || 'Apartment photo'}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="rounded-md object-cover"
                />
                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" aria-label="Delete photo">
                           <X className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Delete this photo?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently remove the photo from your listing.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeletePhoto(photo.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                   </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md text-muted-foreground">
             <ImageIcon className="h-12 w-12" />
             <p className="mt-2">No photos have been uploaded for this listing yet.</p>
          </div>
        )}
      </div>

      {/* Upload New Photo Form */}
      <div className="space-y-4 pt-6 border-t">
         <h4 className="text-md font-medium">Upload New Photo</h4>
        <div 
          className="flex items-center justify-center w-full p-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              {file ? file.name : 'Click to browse or drag and drop a file'}
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
          </div>
          <Input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/gif"
          />
        </div>
        
        <Input 
          type="text"
          placeholder="Optional: Photo description or hint (e.g., 'Master bedroom view')"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        
        <Button onClick={handleUpload} disabled={isLoading || !file}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Upload Photo
        </Button>
      </div>
    </div>
  );
}
