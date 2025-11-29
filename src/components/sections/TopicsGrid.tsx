import { useState } from 'react';
import topics from '../../data/topics.json';
import Card from '../ui/Card';
import SectionHeader from '../ui/SectionHeader';
import Modal from '../ui/Modal';
import Canvas3D from '../3d/Canvas3D';
import { ArrowRight, Box } from 'lucide-react';

export default function TopicsGrid() {
  const [selectedModel, setSelectedModel] = useState<{ title: string; asset: string } | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<typeof topics[0] | null>(null);

  return (
    <section id="topics" className="py-24 px-4 relative min-h-screen flex flex-col justify-center">
      <div className="max-w-7xl mx-auto w-full">
        <SectionHeader 
          title="Investigation Modules" 
          subtitle="Explore key areas of digital forensics through our comprehensive learning modules."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <Card 
              key={topic.id}
              title={topic.title}
              subtitle={`${topic.sections.length} Sections`}
              className="h-full group cursor-pointer"
              onClick={() => setSelectedTopic(topic)}
              footer={
                <div className="flex items-center justify-between text-sm text-accent-neon">
                  <span>Start Module</span>
                  <div className="flex gap-2">
                    {topic.assets3D && topic.assets3D.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModel({ title: topic.title, asset: topic.assets3D![0] });
                        }}
                        className="p-1 hover:bg-accent-neon/20 rounded transition-colors"
                        title="View 3D Model"
                        aria-label="View 3D Model"
                      >
                        <Box className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTopic(topic);
                      }}
                      className="p-1 hover:bg-accent-neon/20 rounded transition-colors"
                      title="View Module Details"
                      aria-label="View Module Details"
                    >
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              }
            >
              <p className="text-text-secondary mb-4 line-clamp-3">
                {topic.summary}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {topic.sections.slice(0, 3).map((section, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 rounded bg-bg-dark/50 text-text-tertiary border border-border-glass truncate max-w-[150px]">
                    {section.heading}
                  </span>
                ))}
                {topic.sections.length > 3 && (
                  <span className="text-xs px-2 py-1 rounded bg-bg-dark/50 text-text-tertiary border border-border-glass">
                    +{topic.sections.length - 3}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 3D Model Modal */}
      <Modal
        isOpen={!!selectedModel}
        onClose={() => setSelectedModel(null)}
        title={selectedModel?.title}
      >
        <div className="w-full h-[60vh]">
          {selectedModel && <Canvas3D scene={selectedModel.asset} />}
        </div>
        <div className="mt-4 text-text-secondary text-sm">
          <p>Interactive 3D Visualization. Use mouse to rotate and zoom.</p>
        </div>
      </Modal>

      {/* Topic Details Modal */}
      <Modal
        isOpen={!!selectedTopic}
        onClose={() => setSelectedTopic(null)}
        title={selectedTopic?.title}
      >
        <div className="space-y-6">
          {/* Summary Section */}
          <div>
            <h3 className="text-accent-neon font-bold mb-3 pb-2 relative inline-block">
              <span className="relative">
                Overview
                <span 
                  className="absolute left-0 right-0 h-0.5 bg-accent-neon shadow-[0_0_8px_rgba(57,255,20,0.6)]"
                  style={{ bottom: '-4px' }}
                />
              </span>
            </h3>
            <p className="text-text-secondary leading-relaxed">{selectedTopic?.summary}</p>
          </div>

          {/* Difficulty and Sections Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[rgba(30,30,30,0.6)] p-5 rounded-lg border border-border-glass backdrop-blur-sm">
              <h4 className="text-accent-cyan font-semibold mb-2 text-lg">Difficulty Level</h4>
              <p className="text-white capitalize text-xl font-bold">{selectedTopic?.difficulty}</p>
            </div>
            <div className="bg-[rgba(30,30,30,0.6)] p-5 rounded-lg border border-border-glass backdrop-blur-sm">
              <h4 className="text-accent-cyan font-semibold mb-2 text-lg">Course Modules</h4>
              <p className="text-white text-xl font-bold">{selectedTopic?.sections.length} sections</p>
            </div>
          </div>

          {/* Prerequisites Section */}
          {selectedTopic?.prerequisites && selectedTopic.prerequisites.length > 0 && (
            <div>
              <h3 className="text-accent-neon font-bold mb-3 pb-2 relative inline-block">
                <span className="relative">
                  Prerequisites
                  <span 
                    className="absolute left-0 right-0 h-0.5 bg-accent-neon shadow-[0_0_8px_rgba(57,255,20,0.6)]"
                    style={{ bottom: '-4px' }}
                  />
                </span>
              </h3>
              <ul className="space-y-2 ml-4">
                {selectedTopic.prerequisites.map((prereq, idx) => (
                  <li key={idx} className="text-text-secondary flex items-start">
                    <span className="text-accent-cyan mr-2">•</span>
                    <span>{prereq}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Course Content Section */}
          <div>
            <h3 className="text-accent-neon font-bold mb-4 pb-2 relative inline-block">
              <span className="relative">
                Course Content
                <span 
                  className="absolute left-0 right-0 h-0.5 bg-accent-neon shadow-[0_0_8px_rgba(57,255,20,0.6)]"
                  style={{ bottom: '-4px' }}
                />
              </span>
            </h3>
            <div className="space-y-4">
              {selectedTopic?.sections.map((section, idx) => (
                <div key={idx} className="bg-[rgba(30,30,30,0.5)] p-5 rounded-lg border border-border-glass backdrop-blur-sm hover:border-accent-cyan/30 transition-colors">
                  <h4 className="text-white font-semibold mb-3 text-lg flex items-center gap-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-accent-cyan/20 text-accent-cyan text-sm">
                      {idx + 1}
                    </span>
                    {section.heading}
                  </h4>
                  <p className="text-text-secondary leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* View 3D Model Button */}
          {selectedTopic?.assets3D && selectedTopic.assets3D.length > 0 && (
            <button
              onClick={() => {
                setSelectedModel({ title: selectedTopic.title, asset: selectedTopic.assets3D![0] });
                setSelectedTopic(null);
              }}
              className="w-full py-4 px-6 bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan border-2 border-accent-cyan/50 hover:border-accent-cyan rounded-lg transition-all duration-300 flex items-center justify-center gap-3 font-semibold text-lg shadow-lg hover:shadow-accent-cyan/20"
            >
              <Box className="w-6 h-6" />
              View 3D Visualization
            </button>
          )}
        </div>
      </Modal>
    </section>
  );
}
