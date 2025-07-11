import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getKYCDocuments, uploadKYCDocument, uploadFileToStorage } from '@/lib/services/user-service';
import { FileText, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';

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

  const handleFileUpload = async (file: File, documentType: string) => {
    if (!user) return;

    setUploading(documentType);
    try {
      // Upload file to storage
      const fileName = `${user.id}/${documentType}/${Date.now()}_${file.name}`;
      const fileData = await uploadFileToStorage(file, 'kyc-documents', fileName);

      // Save document record
      await uploadKYCDocument({
        user_id: user.id,
        document_type: documentType,
        file_url: fileData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        status: 'pending'
      });

      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded and is under review.",
      });

      // Refresh documents list
      await fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(null);
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

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Loading documents...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          KYC Document Verification
        </CardTitle>
        <CardDescription>
          Upload the required documents to verify your identity and start investing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {documentTypes.map((docType) => {
          const status = getDocumentStatus(docType.key);
          const isUploading = uploading === docType.key;

          return (
            <div key={docType.key} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
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
                  variant="outline"
                  onClick={() => document.getElementById(`file-${docType.key}`)?.click()}
                  disabled={isUploading || status === 'approved'}
                >
                  {isUploading ? 'Uploading...' : status === 'approved' ? 'Approved' : 'Upload Document'}
                </Button>

                {status === 'rejected' && (
                  <p className="text-sm text-red-600">
                    Document rejected. Please upload a new document.
                  </p>
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