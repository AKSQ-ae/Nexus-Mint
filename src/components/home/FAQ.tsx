import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    question: "How does tokenization work?",
    answer: "Tokenization converts physical real estate into digital tokens on the blockchain, allowing fractional ownership. Each token represents a share of the property's value and rental income. Smart contracts automate distributions and ensure transparency."
  },
  {
    question: "What are the minimum investment requirements?",
    answer: "You can start investing with as little as AED 500 (approximately $136 USD). This low minimum makes premium real estate accessible to a broader range of investors."
  },
  {
    question: "How are returns distributed?",
    answer: "Returns are distributed quarterly through smart contracts directly to your wallet. Returns come from rental income and property appreciation, with an expected annual yield of 8-15%."
  },
  {
    question: "Is this legally compliant?",
    answer: "Yes, we operate under full regulatory compliance with UAE securities laws and international standards. All properties undergo thorough legal due diligence, and our platform is audited regularly."
  },
  {
    question: "Can I sell my tokens?",
    answer: "Tokens can be traded on our secondary marketplace after the initial holding period. We're also working on integrating with major crypto exchanges for enhanced liquidity."
  },
  {
    question: "What happens if a property is sold?",
    answer: "When a property is sold, proceeds are distributed proportionally to token holders based on their ownership percentage. The distribution is handled automatically through smart contracts."
  },
  {
    question: "How do I track my investments?",
    answer: "Our dashboard provides real-time tracking of your portfolio performance, rental income, property valuations, and transaction history. You'll also receive monthly reports and quarterly statements."
  },
  {
    question: "What are the fees involved?",
    answer: "Our fee structure is transparent: 2% annual management fee, 0.5% transaction fee for purchases, and 1% for sales. There are no hidden fees or surprise charges."
  }
];

export function FAQ() {
  return (
    <section className="py-24 bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold gradient-text mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get answers to common questions about tokenized real estate investment
            </p>
          </div>
          
          <div className="card-premium p-8 rounded-2xl">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqData.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border border-border/50 rounded-lg px-6 hover:shadow-lg transition-shadow"
                >
                  <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}