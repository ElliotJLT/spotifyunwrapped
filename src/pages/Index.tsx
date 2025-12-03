import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Dashboard } from '@/components/Dashboard';

const Index = () => {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string> | null>(null);

  return (
    <main className="min-h-screen bg-background">
      {!uploadedFiles ? (
        <FileUpload onFilesUploaded={setUploadedFiles} />
      ) : (
        <Dashboard files={uploadedFiles} />
      )}
    </main>
  );
};

export default Index;
