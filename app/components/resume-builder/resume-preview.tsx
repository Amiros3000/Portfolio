"use client";

import { PDFViewer } from "@react-pdf/renderer";
import ResumePdfDocument from "./resume-pdf-document";
import type { ResumeContent } from "@/app/lib/resume-content";

type ResumePreviewProps = {
  resumeContent: ResumeContent;
};

export default function ResumePreview({ resumeContent }: ResumePreviewProps) {
  return (
    <div className="sticky top-24 h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-accent/22">
      <PDFViewer width="100%" height="100%" showToolbar={false}>
        <ResumePdfDocument content={resumeContent} />
      </PDFViewer>
    </div>
  );
}
