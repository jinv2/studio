'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  generateStoryboard,
  type GenerateStoryboardOutput,
  type GenerateStoryboardInput,
} from '@/ai/flows/generate-storyboard';
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Film, Camera, LayoutGrid } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  scriptOutline: z.string().min(10, {
    message: '脚本大纲必须至少包含 10 个字符。',
  }),
});

export const StoryboardGenerator: FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [storyboardResult, setStoryboardResult] =
    useState<GenerateStoryboardOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      scriptOutline: '',
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async (
    data
  ) => {
    setIsLoading(true);
    setStoryboardResult(null);
    try {
      const input: GenerateStoryboardInput = { scriptOutline: data.scriptOutline };
      const result = await generateStoryboard(input);
      setStoryboardResult(result);
      toast({
        title: "故事板已生成",
        description: "AI 已成功生成故事板。",
      });
    } catch (error) {
      console.error('Error generating storyboard:', error);
      toast({
        variant: "destructive",
        title: "错误",
        description: "生成故事板失败。请重试。",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="h-6 w-6 text-primary" />
          AI 故事板生成器
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="scriptOutline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>脚本大纲</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="在此输入您的脚本大纲..."
                      className="resize-y min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    提供您脚本的详细大纲。AI 将建议场景、摄像机角度和布局。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                '生成故事板'
              )}
            </Button>
          </form>
        </Form>

        {storyboardResult && (
          <div className="mt-8 space-y-6">
            <h3 className="text-xl font-semibold">生成的故事板：</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {storyboardResult.storyboard.map((scene, index) => (
                <Card key={index} className="bg-secondary shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">场景 {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                     <p>
                      <strong>场景描述：</strong> {scene.sceneDescription}
                    </p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                       <Camera className="h-4 w-4 text-accent" />
                      <span>摄像机角度：{scene.cameraAngle}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                       <LayoutGrid className="h-4 w-4 text-accent" />
                      <span>场景布局：{scene.sceneLayout}</span>
                    </div>

                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
