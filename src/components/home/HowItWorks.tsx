import { Badge } from '@/components/ui/badge';

export function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Create Account',
      description: 'Sign up and complete our quick verification process to get started.',
    },
    {
      step: '02',
      title: 'Browse Properties',
      description: 'Explore our curated selection of premium real estate investment opportunities.',
    },
    {
      step: '03',
      title: 'Invest',
      description: 'Purchase property tokens starting from just $100 and become a real estate investor.',
    },
    {
      step: '04',
      title: 'Earn Returns',
      description: 'Receive regular rental income distributions and benefit from property appreciation.',
    },
  ];

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get started with real estate investing in four simple steps
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.step} className="relative text-center">
              <div className="mb-4">
                <Badge variant="secondary" className="text-lg px-4 py-2 rounded-full">
                  {step.step}
                </Badge>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-full w-full h-0.5 bg-border transform -translate-y-1/2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}