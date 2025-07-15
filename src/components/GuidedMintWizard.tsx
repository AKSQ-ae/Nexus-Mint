import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Info, CheckCircle, AlertTriangle, BookOpen, Shield, Scale } from 'lucide-react';

interface MintStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<MintStepProps>;
  validation?: (data: MintData) => boolean;
  shariaTerms: ShariaTerm[];
}

interface MintStepProps {
  data: MintData;
  onUpdate: (updates: Partial<MintData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface MintData {
  tokenName: string;
  tokenSymbol: string;
  totalSupply: string;
  tokenType: 'musharaka' | 'mudaraba' | 'ijara' | 'sukuk' | 'wakala';
  purpose: string;
  profitSharing: {
    enabled: boolean;
    ratio: string;
  };
  compliance: {
    shariaApproved: boolean;
    auditRequired: boolean;
    communityVote: boolean;
  };
  metadata: {
    description: string;
    website: string;
    documentation: string;
  };
  terms: {
    accepted: boolean;
    shariaCompliant: boolean;
    riskAcknowledged: boolean;
  };
}

interface ShariaTerm {
  term: string;
  definition: string;
  example: string;
  importance: string;
}

const shariaTerms: Record<string, ShariaTerm[]> = {
  musharaka: [
    {
      term: 'Musharaka',
      definition: 'A partnership contract where two or more parties contribute capital to a business venture and share profits and losses according to agreed ratios.',
      example: 'Two partners invest in a real estate project, sharing 60% and 40% of profits and losses respectively.',
      importance: 'Ensures fair risk-sharing and aligns with Islamic principles of partnership.'
    },
    {
      term: 'Riba',
      definition: 'Interest or usury, which is strictly prohibited in Islamic finance.',
      example: 'Charging 5% interest on a loan is considered riba and is forbidden.',
      importance: 'Avoiding riba ensures compliance with Islamic financial principles.'
    }
  ],
  mudaraba: [
    {
      term: 'Mudaraba',
      definition: 'A profit-sharing partnership where one party provides capital and another provides expertise and management.',
      example: 'An investor provides capital for a business, while an entrepreneur manages it, sharing profits according to agreed terms.',
      importance: 'Promotes entrepreneurship while ensuring fair profit distribution.'
    },
    {
      term: 'Mudarib',
      definition: 'The managing partner who provides expertise and management in a mudaraba contract.',
      example: 'The entrepreneur who manages the business operations.',
      importance: 'Clear role definition ensures proper governance and accountability.'
    }
  ],
  ijara: [
    {
      term: 'Ijara',
      definition: 'A leasing contract where the lessor transfers the right to use an asset to the lessee for a specified period.',
      example: 'Leasing a property for business use with regular rental payments.',
      importance: 'Provides access to assets without interest-based financing.'
    },
    {
      term: 'Gharar',
      definition: 'Excessive uncertainty or ambiguity in contracts, which is prohibited.',
      example: 'Selling a fish that is still in the sea (uncertain existence).',
      importance: 'Avoiding gharar ensures contract clarity and fairness.'
    }
  ],
  sukuk: [
    {
      term: 'Sukuk',
      definition: 'Islamic bonds that represent ownership in tangible assets or services.',
      example: 'Sukuk backed by real estate assets, providing returns from rental income.',
      importance: 'Provides Sharia-compliant investment opportunities.'
    },
    {
      term: 'Asset-Backed',
      definition: 'Securities backed by tangible assets rather than debt obligations.',
      example: 'Sukuk backed by airport infrastructure or real estate projects.',
      importance: 'Ensures real economic activity and asset ownership.'
    }
  ],
  wakala: [
    {
      term: 'Wakala',
      definition: 'An agency contract where one party acts on behalf of another in managing investments.',
      example: 'An investment manager handling client funds according to Islamic principles.',
      importance: 'Provides professional management while maintaining Sharia compliance.'
    },
    {
      term: 'Amanah',
      definition: 'Trust and fiduciary responsibility in managing others\' assets.',
      example: 'A fund manager acting with utmost care and transparency.',
      importance: 'Ensures ethical and responsible asset management.'
    }
  ]
};

const steps: MintStep[] = [
  {
    id: 'token-basics',
    title: 'Token Basics',
    description: 'Define the fundamental properties of your token',
    component: TokenBasicsStep,
    validation: (data) => !!data.tokenName && !!data.tokenSymbol && !!data.totalSupply,
    shariaTerms: []
  },
  {
    id: 'token-type',
    title: 'Token Type & Purpose',
    description: 'Choose the Islamic finance structure for your token',
    component: TokenTypeStep,
    validation: (data) => !!data.tokenType && !!data.purpose,
    shariaTerms: []
  },
  {
    id: 'profit-sharing',
    title: 'Profit Sharing Structure',
    description: 'Configure profit distribution according to Islamic principles',
    component: ProfitSharingStep,
    validation: (data) => !data.profitSharing.enabled || !!data.profitSharing.ratio,
    shariaTerms: []
  },
  {
    id: 'compliance',
    title: 'Sharia Compliance',
    description: 'Ensure your token meets Islamic finance requirements',
    component: ComplianceStep,
    validation: (data) => data.compliance.shariaApproved,
    shariaTerms: []
  },
  {
    id: 'metadata',
    title: 'Token Metadata',
    description: 'Provide detailed information about your token',
    component: MetadataStep,
    validation: (data) => !!data.metadata.description,
    shariaTerms: []
  },
  {
    id: 'review',
    title: 'Review & Deploy',
    description: 'Review your token configuration and deploy',
    component: ReviewStep,
    validation: (data) => data.terms.accepted && data.terms.shariaCompliant && data.terms.riskAcknowledged,
    shariaTerms: []
  }
];

export function GuidedMintWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [mintData, setMintData] = useState<MintData>({
    tokenName: '',
    tokenSymbol: '',
    totalSupply: '',
    tokenType: 'musharaka',
    purpose: '',
    profitSharing: {
      enabled: false,
      ratio: ''
    },
    compliance: {
      shariaApproved: false,
      auditRequired: false,
      communityVote: false
    },
    metadata: {
      description: '',
      website: '',
      documentation: ''
    },
    terms: {
      accepted: false,
      shariaCompliant: false,
      riskAcknowledged: false
    }
  });

  const currentStepData = steps[currentStep];
  const CurrentStepComponent = currentStepData.component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleUpdate = (updates: Partial<MintData>) => {
    setMintData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = currentStepData.validation ? currentStepData.validation(mintData) : true;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Guided Token Minting</h1>
        <p className="text-muted-foreground">
          Create Sharia-compliant tokens with step-by-step guidance
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <Button
            key={step.id}
            variant={index === currentStep ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentStep(index)}
            disabled={index > currentStep}
            className="whitespace-nowrap"
          >
            {step.title}
          </Button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {currentStepData.title}
              </CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <CurrentStepComponent
                data={mintData}
                onUpdate={handleUpdate}
                onNext={handleNext}
                onBack={handleBack}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sharia Terms Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Islamic Finance Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ShariaTermsPanel tokenType={mintData.tokenType} />
            </CardContent>
          </Card>

          {/* Compliance Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ComplianceStatus data={mintData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TokenBasicsStep({ data, onUpdate }: MintStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tokenName">Token Name</Label>
          <Input
            id="tokenName"
            value={data.tokenName}
            onChange={(e) => onUpdate({ tokenName: e.target.value })}
            placeholder="e.g., Real Estate Partnership Token"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tokenSymbol">Token Symbol</Label>
          <Input
            id="tokenSymbol"
            value={data.tokenSymbol}
            onChange={(e) => onUpdate({ tokenSymbol: e.target.value.toUpperCase() })}
            placeholder="e.g., REPT"
            maxLength={10}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="totalSupply">Total Supply</Label>
        <Input
          id="totalSupply"
          type="number"
          value={data.totalSupply}
          onChange={(e) => onUpdate({ totalSupply: e.target.value })}
          placeholder="e.g., 1000000"
        />
        <p className="text-sm text-muted-foreground">
          The total number of tokens that will be created
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Choose a meaningful name and symbol that reflects the Islamic finance structure of your token.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function TokenTypeStep({ data, onUpdate }: MintStepProps) {
  const tokenTypes = [
    { value: 'musharaka', label: 'Musharaka (Partnership)', description: 'Partnership-based token with shared ownership' },
    { value: 'mudaraba', label: 'Mudaraba (Profit-Sharing)', description: 'Profit-sharing token with capital and expertise' },
    { value: 'ijara', label: 'Ijara (Leasing)', description: 'Leasing-based token for asset utilization' },
    { value: 'sukuk', label: 'Sukuk (Islamic Bonds)', description: 'Asset-backed Islamic bonds' },
    { value: 'wakala', label: 'Wakala (Agency)', description: 'Agency-based token for professional management' }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Token Type</Label>
        <Select value={data.tokenType} onValueChange={(value: any) => onUpdate({ tokenType: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select token type" />
          </SelectTrigger>
          <SelectContent>
            {tokenTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{type.label}</span>
                  <span className="text-sm text-muted-foreground">{type.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">Purpose</Label>
        <Textarea
          id="purpose"
          value={data.purpose}
          onChange={(e) => onUpdate({ purpose: e.target.value })}
          placeholder="Describe the purpose and use case of your token..."
          rows={4}
        />
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Each token type has specific Islamic finance requirements and governance structures.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function ProfitSharingStep({ data, onUpdate }: MintStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="profitSharing"
          checked={data.profitSharing.enabled}
          onCheckedChange={(checked) => 
            onUpdate({ 
              profitSharing: { ...data.profitSharing, enabled: checked as boolean } 
            })
          }
        />
        <Label htmlFor="profitSharing">Enable Profit Sharing</Label>
      </div>

      {data.profitSharing.enabled && (
        <div className="space-y-2">
          <Label htmlFor="ratio">Profit Sharing Ratio (%)</Label>
          <Input
            id="ratio"
            type="number"
            value={data.profitSharing.ratio}
            onChange={(e) => onUpdate({ 
              profitSharing: { ...data.profitSharing, ratio: e.target.value } 
            })}
            placeholder="e.g., 60"
            min="0"
            max="100"
          />
          <p className="text-sm text-muted-foreground">
            Percentage of profits to be distributed to token holders
          </p>
        </div>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Profit sharing must be based on actual profits, not guaranteed returns, to comply with Islamic finance principles.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function ComplianceStep({ data, onUpdate }: MintStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="shariaApproved"
            checked={data.compliance.shariaApproved}
            onCheckedChange={(checked) => 
              onUpdate({ 
                compliance: { ...data.compliance, shariaApproved: checked as boolean } 
              })
            }
          />
          <Label htmlFor="shariaApproved">Sharia Compliance Approved</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="auditRequired"
            checked={data.compliance.auditRequired}
            onCheckedChange={(checked) => 
              onUpdate({ 
                compliance: { ...data.compliance, auditRequired: checked as boolean } 
              })
            }
          />
          <Label htmlFor="auditRequired">Require External Audit</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="communityVote"
            checked={data.compliance.communityVote}
            onCheckedChange={(checked) => 
              onUpdate({ 
                compliance: { ...data.compliance, communityVote: checked as boolean } 
              })
            }
          />
          <Label htmlFor="communityVote">Community Governance Vote</Label>
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Sharia compliance approval is mandatory for all Islamic finance tokens.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function MetadataStep({ data, onUpdate }: MintStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={data.metadata.description}
          onChange={(e) => onUpdate({ 
            metadata: { ...data.metadata, description: e.target.value } 
          })}
          placeholder="Provide a detailed description of your token..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={data.metadata.website}
            onChange={(e) => onUpdate({ 
              metadata: { ...data.metadata, website: e.target.value } 
            })}
            placeholder="https://example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="documentation">Documentation</Label>
          <Input
            id="documentation"
            type="url"
            value={data.metadata.documentation}
            onChange={(e) => onUpdate({ 
              metadata: { ...data.metadata, documentation: e.target.value } 
            })}
            placeholder="https://docs.example.com"
          />
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ data, onUpdate }: MintStepProps) {
  const handleDeploy = async () => {
    // Implement deployment logic
    console.log('Deploying token with data:', data);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Token Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Name:</span> {data.tokenName}
          </div>
          <div>
            <span className="font-medium">Symbol:</span> {data.tokenSymbol}
          </div>
          <div>
            <span className="font-medium">Supply:</span> {data.totalSupply}
          </div>
          <div>
            <span className="font-medium">Type:</span> {data.tokenType}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Terms & Conditions</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="termsAccepted"
              checked={data.terms.accepted}
              onCheckedChange={(checked) => 
                onUpdate({ 
                  terms: { ...data.terms, accepted: checked as boolean } 
                })
              }
            />
            <Label htmlFor="termsAccepted">I accept the terms and conditions</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="shariaCompliant"
              checked={data.terms.shariaCompliant}
              onCheckedChange={(checked) => 
                onUpdate({ 
                  terms: { ...data.terms, shariaCompliant: checked as boolean } 
                })
              }
            />
            <Label htmlFor="shariaCompliant">I confirm this token is Sharia compliant</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="riskAcknowledged"
              checked={data.terms.riskAcknowledged}
              onCheckedChange={(checked) => 
                onUpdate({ 
                  terms: { ...data.terms, riskAcknowledged: checked as boolean } 
                })
              }
            />
            <Label htmlFor="riskAcknowledged">I acknowledge the risks involved</Label>
          </div>
        </div>
      </div>

      <Button onClick={handleDeploy} className="w-full" size="lg">
        Deploy Token
      </Button>
    </div>
  );
}

function ShariaTermsPanel({ tokenType }: { tokenType: string }) {
  const terms = shariaTerms[tokenType] || [];

  return (
    <div className="space-y-4">
      {terms.map((term, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{term.term}</Badge>
          </div>
          <p className="text-sm">{term.definition}</p>
          <div className="text-xs text-muted-foreground">
            <strong>Example:</strong> {term.example}
          </div>
          <div className="text-xs text-muted-foreground">
            <strong>Importance:</strong> {term.importance}
          </div>
        </div>
      ))}
    </div>
  );
}

function ComplianceStatus({ data }: { data: MintData }) {
  const checks = [
    { label: 'Token Basics', passed: !!data.tokenName && !!data.tokenSymbol && !!data.totalSupply },
    { label: 'Token Type', passed: !!data.tokenType && !!data.purpose },
    { label: 'Profit Sharing', passed: !data.profitSharing.enabled || !!data.profitSharing.ratio },
    { label: 'Sharia Compliance', passed: data.compliance.shariaApproved },
    { label: 'Metadata', passed: !!data.metadata.description },
    { label: 'Terms Accepted', passed: data.terms.accepted && data.terms.shariaCompliant && data.terms.riskAcknowledged }
  ];

  const passedChecks = checks.filter(check => check.passed).length;
  const totalChecks = checks.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Compliance Score</span>
        <span className="text-sm text-muted-foreground">{passedChecks}/{totalChecks}</span>
      </div>
      
      <div className="space-y-2">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center gap-2">
            {check.passed ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
            <span className="text-sm">{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}