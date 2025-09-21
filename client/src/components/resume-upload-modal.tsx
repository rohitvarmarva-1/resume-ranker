import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ResumeUploadModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ResumeUploadModal({ open, onClose }: ResumeUploadModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    skills: string[];
    experienceYears: number;
    summary: string;
  } | null>(null);

  const uploadResumeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("/api/resumes", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to upload resume");
      }

      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Resume Uploaded",
        description: "Your resume has been processed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/candidate"] });
      setExtractedData({
        skills: data.extractedSkills,
        experienceYears: data.experienceYears,
        summary: data.summary,
      });
      setIsProcessing(false);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, DOC, or DOCX file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setExtractedData(null);
    uploadResumeMutation.mutate(file);
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleClose = () => {
    setIsProcessing(false);
    setExtractedData(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg" data-testid="modal-resume-upload">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-file-upload text-blue-600 text-2xl"></i>
          </div>
          <DialogTitle className="text-2xl">Upload Your Resume</DialogTitle>
          <p className="text-muted-foreground mt-2">Our AI will analyze your skills and experience</p>
        </DialogHeader>

        <div className="space-y-6">
          {!extractedData && (
            <>
              {/* Upload Area */}
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                onClick={handleDropZoneClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                data-testid="dropzone-resume"
              >
                <i className="fas fa-cloud-upload-alt text-4xl text-muted-foreground mb-4"></i>
                <p className="text-lg font-medium text-card-foreground">Drop your resume here</p>
                <p className="text-muted-foreground text-sm">or click to browse files</p>
                <p className="text-xs text-muted-foreground mt-2">Supports PDF, DOC, DOCX (Max 5MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileInputChange}
                  data-testid="input-resume-file"
                />
              </div>

              {/* Processing Status */}
              {isProcessing && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg" data-testid="processing-status">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <div>
                      <p className="font-medium text-blue-800">Processing Resume...</p>
                      <p className="text-sm text-blue-600">Our AI is extracting skills and experience</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Extracted Skills Preview */}
          {extractedData && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg" data-testid="extracted-data">
              <h4 className="font-medium text-green-800 mb-3">Extracted Skills & Experience</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-green-800">Technical Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1" data-testid="extracted-skills">
                    {extractedData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-green-100 text-green-800">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-green-800">Experience:</span>
                  <span className="text-sm text-green-700 ml-2" data-testid="extracted-experience">
                    {extractedData.experienceYears} years in {extractedData.summary}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button 
              variant="outline"
              onClick={handleClose}
              data-testid="button-cancel-upload"
            >
              {extractedData ? "Close" : "Cancel"}
            </Button>
            {extractedData && (
              <Button 
                onClick={handleClose}
                data-testid="button-save-resume"
              >
                Done
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
