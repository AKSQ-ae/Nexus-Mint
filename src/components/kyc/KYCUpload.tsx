import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getKYCDocuments, uploadKYCDocument, uploadFileToStorage } from '@/lib/services/user-service';
import { FileText, Upload, CheckCircle, Clock, XCircle, AlertTriangle, Shield } from 'lucide-react';
import { LoadingSpinner, ProcessStep } from '@/components/ui/enhanced-loading';
import { ErrorDisplay } from '@/components/ui/enhanced-error-handling';
import { enhancedToast } from '@/components/ui/enhanced-toast';

const documentTypes = [
  { key: 'passport', label: 'Passport', required: true },
  { key: 'proof_of_address', label: 'Proof of Address', required: true },
  { key: 'bank_statement', label: 'Bank Statement', required: false },
  { key: 'drivers_license', label: 'ID', required: false },
];

export function KYCUpload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const data = await getKYCDocuments(user!.id);
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    
    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }
    
    if (!allowedTypes.includes(file.type)) {
      return 'File must be JPG, PNG, or PDF format';
    }
    
    return null;
  };

  const handleFileUpload = async (file: File, documentType: string) => {
    if (!user) return;

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setErrors(prev => ({ ...prev, [documentType]: validationError }));
      enhancedToast.error({
        title: 'Upload Error',
        description: validationError
      });
      return;
    }

    setUploading(documentType);
    setErrors(prev => ({ ...prev, [documentType]: '' }));
    setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[documentType] || 0;
          if (current < 90) {
            return { ...prev, [documentType]: current + 10 };
          }
          return prev;
        });
      }, 200);

      // Upload file to storage
      const fileName = `${user.id}/${documentType}/${Date.now()}_${file.name}`;
      const fileData = await uploadFileToStorage(file, 'kyc-documents', fileName);

      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [documentType]: 100 }));

      // Save document record
      await uploadKYCDocument({
        user_id: user.id,
        document_type: documentType,
        file_url: fileData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        status: 'pending'
      });

      enhancedToast.kyc.documentUploaded(
        documentTypes.find(dt => dt.key === documentType)?.label || documentType
      );

      // Refresh documents list
      await fetchDocuments();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      const errorMessage = error.message || 'Failed to upload document';
      setErrors(prev => ({ ...prev, [documentType]: errorMessage }));
      
      enhancedToast.error({
        title: 'Upload Failed',
        description: errorMessage,
        action: {
          label: 'Try Again',
          onClick: () => handleFileUpload(file, documentType)
        }
      });
    } finally {
      setUploading(null);
      setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
    }
  };

  const getDocumentStatus = (documentType: string) => {
    const doc = documents.find(d => d.document_type === documentType);
    return doc?.status || 'not_uploaded';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Upload className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: 'default',
      pending: 'secondary',
      rejected: 'destructive',
      not_uploaded: 'outline'
    };

    const labels = {
      approved: 'Approved',
      pending: 'Under Review',
      rejected: 'Rejected',
      not_uploaded: 'Not Uploaded'
    };

    return (
      <Badge variant={variants[status] as any}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getOverallProgress = () => {
    const required = documentTypes.filter(dt => dt.required);
    const approved = required.filter(dt => getDocumentStatus(dt.key) === 'approved');
    return (approved.length / required.length) * 100;
  };

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">Loading your documents...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          KYC Document Verification
        </CardTitle>
        <CardDescription>
          Upload the required documents to verify your identity and start investing
        </CardDescription>
        
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Verification Progress</span>
            <span>{Math.round(getOverallProgress())}% Complete</span>
          </div>
          <Progress value={getOverallProgress()} className="h-2" />
          {getOverallProgress() === 100 && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              All required documents uploaded!
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {documentTypes.map((docType) => {
          const status = getDocumentStatus(docType.key);
          const isUploading = uploading === docType.key;
          const currentProgress = uploadProgress[docType.key] || 0;
          const error = errors[docType.key];

          return (
            <div key={docType.key} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(status)}
                  <div>
                    <h4 className="font-medium">
                      {docType.label}
                      {docType.required && <span className="text-red-500 ml-1">*</span>}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {docType.key === 'passport' && 'Clear photo of your passport information page'}
                      {docType.key === 'proof_of_address' && 'Utility bill or bank statement (max 3 months old)'}
                      {docType.key === 'bank_statement' && 'Recent bank statement (optional)'}
                      {docType.key === 'drivers_license' && 'Front and back of your ID'}
                    </p>
                  </div>
                </div>
                {getStatusBadge(status)}
              </div>

              {/* Error Display */}
              {error && (
                <ErrorDisplay
                  title="Upload Error"
                  message={error}
                  variant="inline"
                  onRetry={() => {
                    setErrors(prev => ({ ...prev, [docType.key]: '' }));
                    document.getElementById(`file-${docType.key}`)?.click();
                  }}
                  retryLabel="Try Again"
                />
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{currentProgress}%</span>
                  </div>
                  <Progress value={currentProgress} className="h-2" />
                </div>
              )}

              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  id={`file-${docType.key}`}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, docType.key);
                    }
                  }}
                />
                <Button
                  variant={status === 'approved' ? 'default' : 'outline'}
                  onClick={() => document.getElementById(`file-${docType.key}`)?.click()}
                  disabled={isUploading || status === 'approved'}
                >
                  {isUploading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Uploading...
                    </>
                  ) : status === 'approved' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approved
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </>
                  )}
                </Button>

                {status === 'rejected' && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Document rejected. Please upload a new document.</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Document Requirements:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Documents must be clear and legible</li>
            <li>• Accepted formats: JPG, PNG, PDF</li>
            <li>• Maximum file size: 10MB per document</li>
            <li>• Documents must be valid and not expired</li>
            <li>• Review process typically takes 1-3 business days</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}