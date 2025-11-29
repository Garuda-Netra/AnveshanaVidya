import { useMemo, useState } from 'react';
import tools from '../../data/tools.json';
import Card from '../ui/Card';
import SectionHeader from '../ui/SectionHeader';
import Tabs from '../ui/Tabs';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import Canvas3D from '../3d/Canvas3D';
import { Box } from 'lucide-react';

export default function ToolsShowcase() {
  const [selectedModel, setSelectedModel] = useState<{ title: string; asset: string } | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(tools.map(t => t.category));
    return ['All', ...Array.from(cats)];
  }, []);

  const tabs = categories.map(category => ({
    id: category.toLowerCase().replace(/[\s/]+/g, '-'),
    label: category,
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
        {tools
          .filter(tool => category === 'All' || tool.category === category)
          .map((tool) => (
            <Card 
              key={tool.name}
              title={tool.name}
              subtitle={tool.category}
              className="h-full"
              footer={
                <div className="flex flex-wrap gap-2 items-center justify-between w-full">
                  <div className="flex gap-2">
                    {tool.prosCons.pros.slice(0, 2).map((pro, idx) => (
                      <Badge key={idx} variant="success">{pro}</Badge>
                    ))}
                  </div>
                  {tool.asset3D && (
                    <button
                      onClick={() => setSelectedModel({ title: tool.name, asset: tool.asset3D! })}
                      className="p-1.5 bg-accent-neon/10 text-accent-neon rounded hover:bg-accent-neon/20 transition-colors"
                      title="View Visualization"
                    >
                      <Box className="w-4 h-4" />
                    </button>
                  )}
                </div>
              }
            >
              <p className="text-text-secondary mb-4 text-sm">
                {tool.useCase}
              </p>
              <div className="bg-bg-dark/50 p-3 rounded border border-border-glass text-xs font-mono text-text-tertiary overflow-hidden text-ellipsis whitespace-nowrap">
                <span className="text-accent-neon">$</span> {tool.example.command}
              </div>
            </Card>
          ))}
      </div>
    )
  }));

  return (
    <section id="tools" className="py-24 px-4 bg-bg-darker/50 relative min-h-screen flex flex-col justify-center">
      <div className="max-w-7xl mx-auto w-full">
        <SectionHeader 
          title="Forensic Arsenal" 
          subtitle="Master the industry-standard tools used by digital forensic experts worldwide."
        />
        
        <Tabs tabs={tabs} />
      </div>

      <Modal
        isOpen={!!selectedModel}
        onClose={() => setSelectedModel(null)}
        title={selectedModel?.title}
      >
        <div className="w-full h-[60vh]">
          {selectedModel && <Canvas3D scene={selectedModel.asset} />}
        </div>
        <div className="mt-4 text-text-secondary text-sm">
          <p>Interactive Visualization.</p>
        </div>
      </Modal>
    </section>
  );
}
