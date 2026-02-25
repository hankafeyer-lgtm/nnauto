import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  children: ReactNode;
  title?: string;
  description?: string;
}

export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 1000 * 1024 * 1024, // 1000MB default
  allowedFileTypes,
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  buttonVariant = "default",
  children,
  title = "Upload File",
  description = "Select a file to upload",
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const uppyRef = useRef<Uppy | null>(null);

  useEffect(() => {
    if (showModal && dashboardRef.current) {
      const uppy = new Uppy({
        restrictions: {
          maxNumberOfFiles,
          maxFileSize,
          allowedFileTypes,
        },
        autoProceed: false,
      })
        .use(AwsS3, {
          shouldUseMultipart: false,
          getUploadParameters: onGetUploadParameters,
        })
        .use(Dashboard, {
          target: dashboardRef.current,
          inline: true,
          proudlyDisplayPoweredByUppy: false,
        })
        .on("complete", (result) => {
          onComplete?.(result);
          setShowModal(false);
        });

      uppyRef.current = uppy;

      return () => {
        if (uppy) {
          uppy.cancelAll();
          uppy.clear();
        }
        uppyRef.current = null;
      };
    }
  }, [showModal, maxNumberOfFiles, maxFileSize, allowedFileTypes, onGetUploadParameters, onComplete]);

  return (
    <>
      <Button 
        onClick={() => setShowModal(true)} 
        className={buttonClassName}
        variant={buttonVariant}
        data-testid="button-upload"
      >
        {children}
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          <div ref={dashboardRef} />
        </DialogContent>
      </Dialog>
    </>
  );
}
