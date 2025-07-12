import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/enhanced-loading';
import { ErrorDisplay } from '@/components/ui/enhanced-error-handling';
import { enhancedToast } from '@/components/ui/enhanced-toast';
import { 
  FileText, 
  Download, 
  BarChart3, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Shield,
  Clock,
  DollarSign,
  Target,
  Award
} from 'lucide-react';

interface TokenizationReport {
  id: string;
  process_id: string;
  property_id: string;
  report_type: string;
  report_data: any;
  metrics: any;
  performance_data: any;
  compliance_data: any;
  generated_at: string;
  status: string;
}

interface TokenizationReportsProps {
  processId: string;
  propertyId?: string;
}

export function TokenizationReports({ processId, propertyId }: TokenizationReportsProps) {
  const [reports, setReports] = useState<TokenizationReport[]>([]);
  const [currentReport, setCurrentReport] = useState<TokenizationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, [processId]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tokenization_reports')
        .select('*')
        .eq('process_id', processId)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
      if (data && data.length > 0) {
        setCurrentReport(data[0]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch reports';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType = 'completion_report') => {
    try {
      setGenerating(true);
      const { data, error } = await supabase.functions.invoke('generate-tokenization-report', {
        body: { processId, reportType }
      });

      if (error) throw error;

      setCurrentReport(data.report);
      setReports(prev => [data.report, ...prev]);
      
      enhancedToast.success({
        title: 'Report Generated',
        description: 'Tokenization report has been generated successfully'
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate report';
      enhancedToast.error({
        title: 'Report Generation Failed',
        description: errorMsg
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = (report: TokenizationReport) => {
    const reportContent = JSON.stringify(report, null, 2);
    const blob = new Blob([reportContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tokenization-report-${report.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <LoadingSpinner size="lg" />
          <span className="ml-2">Loading reports...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        title="Failed to Load Reports"
        message={error}
        onRetry={fetchReports}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tokenization Reports
            </div>
            <Button 
              onClick={() => generateReport()}
              disabled={generating}
              className="flex items-center gap-2"
            >
              {generating ? <LoadingSpinner size="sm" /> : <FileText className="h-4 w-4" />}
              {generating ? 'Generating...' : 'Generate Report'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No reports generated yet</p>
              <p className="text-sm text-muted-foreground">Generate your first report to see detailed analytics</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reports.map((report) => (
                  <div key={report.id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium capitalize">
                        {report.report_type.replace('_', ' ')}
                      </h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadReport(report)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Generated: {new Date(report.generated_at).toLocaleDateString()}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-2 w-full"
                      onClick={() => setCurrentReport(report)}
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {currentReport && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Process Status</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {currentReport.report_data?.process_summary?.status || 'Unknown'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {currentReport.report_data?.process_summary?.progress_percentage || 0}% Complete
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Property Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(currentReport.metrics?.property_value || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Market valuation
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(currentReport.performance_data?.success_rate || 0)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Step completion rate
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Process Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">{currentReport.report_data?.property_details?.title}</h3>
                    <p className="text-muted-foreground">{currentReport.report_data?.property_details?.location}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Started:</span>
                      <p>{new Date(currentReport.report_data?.process_summary?.started_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <p>{currentReport.report_data?.process_summary?.duration_hours}h</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Steps:</span>
                      <p>{currentReport.performance_data?.total_steps}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Completed:</span>
                      <p>{currentReport.performance_data?.completed_steps}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className={getScoreColor(currentReport.performance_data?.success_rate || 0)}>
                        {Math.round(currentReport.performance_data?.success_rate || 0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Process Efficiency:</span>
                      <span className={getScoreColor(currentReport.performance_data?.process_efficiency || 0)}>
                        {Math.round(currentReport.performance_data?.process_efficiency || 0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Duration:</span>
                      <span>{currentReport.performance_data?.total_duration_minutes}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Step Duration:</span>
                      <span>{currentReport.performance_data?.average_step_duration}s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Key Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Token Supply:</span>
                      <span>{currentReport.metrics?.token_supply || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Min Investment:</span>
                      <span>{formatCurrency(currentReport.metrics?.minimum_investment || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated ROI:</span>
                      <span>{currentReport.metrics?.estimated_roi || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Market Value:</span>
                      <span>{formatCurrency(currentReport.metrics?.market_value || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {currentReport.report_data?.success_factors && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-500" />
                    Success Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentReport.report_data.success_factors.map((factor: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium capitalize">{factor.step.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">
                            Efficiency: {factor.efficiency}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Compliance Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Audit Score:</span>
                      <Badge className={getScoreColor(currentReport.compliance_data?.audit_score || 0)}>
                        {currentReport.compliance_data?.audit_score || 0}/100
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Compliance Status:</span>
                      <Badge variant="outline">
                        {currentReport.compliance_data?.compliance_status || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Risk Level:</span>
                      <Badge variant="outline">
                        {currentReport.compliance_data?.risk_level || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Regulatory Checks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    {currentReport.compliance_data?.regulatory_checks_passed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    <span>Regulatory Compliance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentReport.compliance_data?.kyc_verification_complete ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    <span>KYC Verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentReport.compliance_data?.legal_review_status === 'approved' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                    <span>Legal Review</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {currentReport.report_data?.recommendations && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {currentReport.report_data.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Step Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {currentReport.report_data?.step_breakdown && (
                  <div className="space-y-3">
                    {currentReport.report_data.step_breakdown.map((step: any, index: number) => (
                      <div key={index} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium capitalize">
                            {step.name.replace('_', ' ')}
                          </h4>
                          <Badge variant="outline">
                            {step.status}
                          </Badge>
                        </div>
                        {step.started_at && (
                          <div className="text-sm text-muted-foreground">
                            <p>Started: {new Date(step.started_at).toLocaleString()}</p>
                            {step.completed_at && (
                              <p>Completed: {new Date(step.completed_at).toLocaleString()}</p>
                            )}
                            {step.duration_seconds && (
                              <p>Duration: {Math.round(step.duration_seconds / 60)}m</p>
                            )}
                          </div>
                        )}
                        {step.error_details && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-600">
                            {step.error_details}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}