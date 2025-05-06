'use client';

import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import {
  generate3DModel,
  type Generate3DModelInput,
  type Generate3DModelOutput,
} from '@/ai/flows/generate-3d-model';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, Box } from 'lucide-react'; // Changed Cube to Box
import { useToast } from '@/hooks/use-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const FormSchema = z.object({
  conceptArt: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, 'Concept art image is required.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
  modelDescription: z.string().min(10, {
    message: 'Model description must be at least 10 characters.',
  }),
});

export const ModelGenerator: FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modelResult, setModelResult] = useState<Generate3DModelOutput | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
   const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      conceptArt: undefined,
      modelDescription: '',
    },
  });

   // Clean up preview URL when component unmounts or preview changes
   useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl); // Revoke previous URL
    }
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      form.setValue('conceptArt', event.target.files, { shouldValidate: true });
    } else {
      setPreviewUrl(null);
      form.resetField('conceptArt');
    }
  };

  const convertFileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async (data) => {
    setIsLoading(true);
    setModelResult(null);
    try {
      const file = data.conceptArt[0];
      const conceptArtDataUri = await convertFileToDataUri(file);

      const input: Generate3DModelInput = {
        conceptArtDataUri,
        modelDescription: data.modelDescription,
      };
      // Simulating AI call - replace with actual call
      // const result = await generate3DModel(input);
       // Dummy result for now
      const result: Generate3DModelOutput = {
        modelDataUri: 'data:model/gltf-binary;base64,dummy_model_data', // Placeholder
        textureDataUri: 'data:image/png;base64,dummy_texture_data', // Placeholder
      };
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

      setModelResult(result);
      toast({
          title: "3D Model Generated",
          description: "AI has successfully generated the 3D model assets.",
        });
    } catch (error) {
      console.error('Error generating 3D model:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate 3D model. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Box className="h-6 w-6 text-primary" /> {/* Changed Cube to Box */}
          AI 3D Model & Texture Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="conceptArt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>2D Concept Art</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                       <Button
                         type="button"
                         variant="outline"
                         onClick={() => fileInputRef.current?.click()}
                       >
                         <Upload className="mr-2 h-4 w-4" /> Upload Image
                       </Button>
                       <Input
                         ref={fileInputRef}
                         type="file"
                         accept={ACCEPTED_IMAGE_TYPES.join(',')}
                         onChange={handleFileChange}
                         className="hidden" // Hide the default input
                       />
                       {previewUrl && (
                        <Image
                          src={previewUrl}
                          alt="Concept art preview"
                          width={80}
                          height={80}
                          className="rounded-md object-cover border"
                          data-ai-hint="concept art"
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload a 2D image (JPG, PNG, WEBP, max 5MB). This will be used as the basis for the 3D model.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="modelDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the desired 3D model (e.g., style, key features)..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about the model you want the AI to generate based on the concept art.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Model...
                </>
              ) : (
                'Generate 3D Model & Texture'
              )}
            </Button>
          </form>
        </Form>

        {modelResult && (
          <div className="mt-8 space-y-6">
            <h3 className="text-xl font-semibold">Generated Assets:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="bg-secondary shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">3D Model Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                     {/* Placeholder for 3D viewer */}
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                      <Box className="h-16 w-16 opacity-50" /> {/* Changed Cube to Box */}
                      <span className="ml-2">(3D Model Placeholder)</span>
                    </div>
                    <Button variant="link" className="mt-2 p-0 h-auto" >
                       {/* In a real app, this link would point to the actual model file */}
                       Download Model (GLB/Dummy)
                    </Button>
                  </CardContent>
               </Card>
                <Card className="bg-secondary shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Texture Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                     {/* Placeholder for texture */}
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                       <Image src={`https://picsum.photos/seed/${form.getValues("modelDescription").substring(0,5)}/300/200`} alt="Generated Texture" width={300} height={200} className="rounded-md object-cover" data-ai-hint="abstract texture" />
                    </div>
                     <Button variant="link" className="mt-2 p-0 h-auto" >
                       {/* In a real app, this link would point to the actual texture file */}
                       Download Texture (PNG/Dummy)
                    </Button>
                  </CardContent>
               </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
