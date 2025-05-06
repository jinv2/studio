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
import { Loader2, Upload, Box } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const FormSchema = z.object({
  conceptArt: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, '概念艺术图是必需的。')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `最大文件大小为 5MB。`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      '接受 .jpg、.jpeg、.png 和 .webp 文件。'
    ),
  modelDescription: z.string().min(10, {
    message: '模型描述必须至少包含 10 个字符。',
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
          title: "3D 模型已生成",
          description: "AI 已成功生成 3D 模型资产。",
        });
    } catch (error) {
      console.error('Error generating 3D model:', error);
      toast({
        variant: "destructive",
        title: "错误",
        description: "生成 3D 模型失败。请重试。",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Box className="h-6 w-6 text-primary" />
          AI 3D 模型与纹理生成器
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
                  <FormLabel>2D 概念艺术图</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                       <Button
                         type="button"
                         variant="outline"
                         onClick={() => fileInputRef.current?.click()}
                       >
                         <Upload className="mr-2 h-4 w-4" /> 上传图片
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
                          alt="概念艺术图预览"
                          width={80}
                          height={80}
                          className="rounded-md object-cover border"
                          data-ai-hint="concept art"
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    上传一张 2D 图片（JPG, PNG, WEBP，最大 5MB）。这将作为 3D 模型的基础。
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
                  <FormLabel>模型描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="描述所需的 3D 模型（例如，风格、关键特征）..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    提供有关您希望 AI 根据概念艺术图生成的模型的详细信息。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成模型中...
                </>
              ) : (
                '生成 3D 模型和纹理'
              )}
            </Button>
          </form>
        </Form>

        {modelResult && (
          <div className="mt-8 space-y-6">
            <h3 className="text-xl font-semibold">生成的资产：</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="bg-secondary shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">3D 模型预览</CardTitle>
                  </CardHeader>
                  <CardContent>
                     {/* Placeholder for 3D viewer */}
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                      <Box className="h-16 w-16 opacity-50" />
                      <span className="ml-2">(3D 模型占位符)</span>
                    </div>
                    <Button variant="link" className="mt-2 p-0 h-auto" >
                       {/* In a real app, this link would point to the actual model file */}
                       下载模型 (GLB/虚拟)
                    </Button>
                  </CardContent>
               </Card>
                <Card className="bg-secondary shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">纹理预览</CardTitle>
                  </CardHeader>
                  <CardContent>
                     {/* Placeholder for texture */}
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                       <Image src={`https://picsum.photos/seed/${form.getValues("modelDescription").substring(0,5)}/300/200`} alt="生成的纹理" width={300} height={200} className="rounded-md object-cover" data-ai-hint="abstract texture" />
                    </div>
                     <Button variant="link" className="mt-2 p-0 h-auto" >
                       {/* In a real app, this link would point to the actual texture file */}
                       下载纹理 (PNG/虚拟)
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
