import cases from '../../data/cases.json';
import slokas from '../../data/slokas.json';
import Accordion from '../ui/Accordion';
import SectionHeader from '../ui/SectionHeader';
import Badge from '../ui/Badge';

export default function CaseStudies() {
  // Use investigation/truth focused śloka for case studies
  const caseStudySloka = slokas.find(s => s.context === 'investigation') || slokas[0];
  const accordionItems = cases.map((caseStudy) => ({
    id: caseStudy.id,
    title: caseStudy.scenario.substring(0, 80) + '...',
    content: (
      <div className="space-y-6">
        <div>
          <h4 className="text-accent-neon font-bold mb-2">Scenario</h4>
          <p className="text-text-secondary">{caseStudy.scenario}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-accent-neon font-bold mb-2">Key Artifacts</h4>
            <ul className="list-disc list-inside text-sm text-text-secondary space-y-1">
              {caseStudy.artifacts.slice(0, 4).map((artifact, idx) => (
                <li key={idx}>
                  <span className="text-text-primary">{artifact.type}:</span> {artifact.description}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-accent-neon font-bold mb-2">Outcomes</h4>
            <ul className="list-disc list-inside text-sm text-text-secondary space-y-1">
              {caseStudy.outcomes.slice(0, 4).map((outcome, idx) => (
                <li key={idx}>{outcome}</li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h4 className="text-accent-neon font-bold mb-2">Investigation Workflow</h4>
          <div className="space-y-3">
            {caseStudy.workflow.slice(0, 3).map((step) => (
              <div key={step.step} className="flex gap-3 items-start bg-bg-dark/30 p-3 rounded border border-border-glass">
                <Badge variant="outline">{step.step}</Badge>
                <div>
                  <p className="text-text-primary text-sm font-medium">{step.action}</p>
                  <p className="text-text-tertiary text-xs mt-1">Tool: {step.tool}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }));

  return (
    <section id="cases" className="py-24 px-4 min-h-screen flex flex-col justify-center">
      <div className="max-w-4xl mx-auto w-full">
        {/* Sanskrit Śloka Banner */}
        <div className="mb-8 glass-panel border border-accent-neon/30 rounded-lg p-6 backdrop-blur-xl bg-gradient-to-r from-accent-neon/5 via-accent-purple/5 to-accent-cyan/5">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="text-5xl" role="img" aria-label={caseStudySloka.symbolMeaning}>
              {caseStudySloka.symbol}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-neon to-accent-cyan mb-1" style={{ textShadow: '0 0 15px rgba(0, 255, 255, 0.4)' }}>
                {caseStudySloka.devanagari}
              </div>
              <div className="text-sm text-accent-neon/70 italic mb-1">
                {caseStudySloka.transliteration}
              </div>
              <div className="text-xs text-text-secondary">
                {caseStudySloka.english}
              </div>
            </div>
          </div>
        </div>

        <SectionHeader 
          title="Real-World Cases" 
          subtitle="Analyze real forensic investigations to understand practical application of concepts."
        />
        
        <Accordion items={accordionItems} allowMultiple />
      </div>
    </section>
  );
}
