'use client';

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Play, Pause, RotateCcw } from 'lucide-react';
import Image from 'next/image';

export const RealtimeRenderer: FC = () => {
  // State for playback, settings etc. would go here in a real implementation
  // For now, it's just a static placeholder UI

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-6 w-6 text-primary" />
          实时渲染预览
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-muted rounded-md mb-4 flex items-center justify-center overflow-hidden">
           {/* Placeholder Image - Replace with actual 3D render canvas */}
           <Image
              src="https://picsum.photos/seed/render/600/338"
              alt="实时渲染预览占位符"
              width={600}
              height={338}
              className="object-cover"
              data-ai-hint="abstract scene"
           />
        </div>
        <p className="text-muted-foreground text-sm mb-4">
          该区域将显示场景的实时预览，即时反映光照、纹理和动画的变化。（占位符界面）
        </p>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Play className="mr-2 h-4 w-4" /> 播放
          </Button>
          <Button variant="outline" size="sm">
            <Pause className="mr-2 h-4 w-4" /> 暂停
          </Button>
           <Button variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" /> 重置视图
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
