import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileType, FileWithPreview } from "@/lib/types";

interface FileUploadProps {
  onContinue: (files: FileWithPreview[]) => void;
}

export default function FileUpload({ onContinue }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Check if file types are supported
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "video/mp4"];
    const invalidFiles = acceptedFiles.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Unsupported file type",
        description: "Only PDF, JPG, PNG and MP4 files are supported.",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    const oversizedFiles = acceptedFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: "Maximum file size is 50MB.",
        variant: "destructive"
      });
      return;
    }
    
    // Add new files to state
    const newFiles = acceptedFiles.map(file => {
      // Create a file type based on mime type
      let fileType: FileType = "unknown";
      
      if (file.type.includes("pdf")) fileType = "pdf";
      else if (file.type.includes("image")) fileType = "image";
      else if (file.type.includes("video")) fileType = "video";
      
      return {
        file,
        id: `${file.name}-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: fileType
      };
    });
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, [toast]);
  
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'video/mp4': ['.mp4']
    }
  });
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const handleContinue = () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload at least one file to continue.",
        variant: "destructive"
      });
      return;
    }
    
    onContinue(uploadedFiles);
  };

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Upload Your Content</CardTitle>
          <p className="text-gray-600">
            Supported file types: PDF, JPG, PNG, MP4. Maximum file size: 50MB.
          </p>
        </CardHeader>
        
        <CardContent>
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}
            `}
          >
            <input {...getInputProps()} />
            
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            
            <div className="mt-4">
              <span className="block text-gray-600">
                {isDragActive 
                  ? "Drop your files here..." 
                  : "Drag and drop your files here, or"
                }
              </span>
              <Button className="mt-2">
                Browse Files
              </Button>
            </div>
          </div>
          
          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Selected Files</h3>
              <ul className="divide-y divide-gray-200">
                {uploadedFiles.map(file => (
                  <li key={file.id} className="py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      {file.type === "pdf" && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                      )}
                      {file.type === "image" && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      )}
                      {file.type === "video" && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                      )}
                      <span className="text-gray-800">{file.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-4">{formatFileSize(file.size)}</span>
                      <button 
                        type="button" 
                        onClick={() => removeFile(file.id)} 
                        className="text-gray-400 hover:text-red-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="mt-4 flex justify-end">
                <Button onClick={handleContinue}>
                  Continue
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
