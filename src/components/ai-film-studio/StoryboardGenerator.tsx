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
    message: 'Script outline must be at least 10 characters.',
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
        title: "Storyboard Generated",
        description: "AI has successfully generated the storyboard.",
      });
    } catch (error) {
      console.error('Error generating storyboard:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate storyboard. Please try again.",
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
          AI Storyboard Generator
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
                  <FormLabel>Script Outline</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your script outline here..."
                      className="resize-y min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed outline of your script. The AI will
                    suggest scenes, camera angles, and layouts.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Storyboard'
              )}
            </Button>
          </form>
        </Form>

        {storyboardResult && (
          <div className="mt-8 space-y-6">
            <h3 className="text-xl font-semibold">Generated Storyboard:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {storyboardResult.storyboard.map((scene, index) => (
                <Card key={index} className="bg-secondary shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Scene {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                     <p>
                      <strong>Scene:</strong> {scene.sceneDescription}
                    </p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                       <Camera className="h-4 w-4 text-accent" />
                      <span>{scene.cameraAngle}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                       <LayoutGrid className="h-4 w-4 text-accent" />
                      <span>{scene.sceneLayout}</span>
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
