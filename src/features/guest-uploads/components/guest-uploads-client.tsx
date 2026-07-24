"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadSharePanel } from "@/features/guest-uploads/components/upload-share-panel";
import { GuestUploadGallery } from "@/features/guest-uploads/components/guest-upload-gallery";

interface Props {
  weddingId: string;
  initialEnabled: boolean;
  initialUrl: string | null;
  initialQr: string | null;
}

export function GuestUploadsClient({
  weddingId,
  initialEnabled,
  initialUrl,
  initialQr,
}: Props) {
  const [total, setTotal] = React.useState(0);
  const onTotalChange = React.useCallback((next: number) => {
    setTotal((prev) => (prev === next ? prev : next));
  }, []);

  return (
    <Tabs defaultValue="share">
      <TabsList>
        <TabsTrigger value="share">Share</TabsTrigger>
        <TabsTrigger value="gallery">Gallery ({total})</TabsTrigger>
      </TabsList>
      <TabsContent value="share" className="mt-6">
        <UploadSharePanel
          initialEnabled={initialEnabled}
          initialUrl={initialUrl}
          initialQr={initialQr}
        />
      </TabsContent>
      <TabsContent value="gallery" className="mt-6">
        <GuestUploadGallery weddingId={weddingId} onTotalChange={onTotalChange} />
      </TabsContent>
    </Tabs>
  );
}
