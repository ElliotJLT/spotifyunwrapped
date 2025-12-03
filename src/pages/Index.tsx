import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Dashboard } from '@/components/Dashboard';

const Index = () => {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string> | null>(null);
  const [rawJsonFiles, setRawJsonFiles] = useState<string[]>([]);

  const handleFilesUploaded = (files: Record<string, string>, jsonFiles?: string[]) => {
    setUploadedFiles(files);
    if (jsonFiles) {
      setRawJsonFiles(jsonFiles);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {!uploadedFiles ? (
        <FileUpload onFilesUploaded={handleFilesUploaded} />
      ) : (
        <Dashboard files={uploadedFiles} rawJsonFiles={rawJsonFiles} />
      )}
    </main>
  );
};

export default Index;
