import { StoryboardGenerator } from '@/components/ai-film-studio/StoryboardGenerator';
import { ModelGenerator } from '@/components/ai-film-studio/ModelGenerator';
import { RealtimeRenderer } from '@/components/ai-film-studio/RealtimeRenderer';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <div className="space-y-12">
      {/* AI Storyboard Section */}
      <section aria-labelledby="storyboard-heading">
         <h2 id="storyboard-heading" className="sr-only">AI 故事板生成器</h2>
        <StoryboardGenerator />
      </section>

      <Separator className="my-8" />

      {/* 3D Model Generation Section */}
      <section aria-labelledby="model-gen-heading">
        <h2 id="model-gen-heading" className="sr-only">AI 3D 模型生成器</h2>
        <ModelGenerator />
      </section>

      <Separator className="my-8" />

      {/* Real-time Rendering Section */}
      <section aria-labelledby="renderer-heading">
         <h2 id="renderer-heading" className="sr-only">实时渲染预览</h2>
        <RealtimeRenderer />
      </section>
    </div>
  );
}
