import React from 'react';

interface StepTwoProps {
  formData: any;
  onFormChange: (field: string, value: any) => void;
}

export default function StepTwo({ formData, onFormChange }: StepTwoProps) {
  const [tagInput, setTagInput] = React.useState('');

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !formData.tags.includes(newTag)) {
        onFormChange('tags', [...formData.tags, newTag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (index: number) => {
    onFormChange('tags', formData.tags.filter((_: string, i: number) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">DESCRIPTION *</label>
        <textarea
          value={formData.description}
          onChange={e => onFormChange('description', e.target.value)}
          placeholder="Describe what you're selling, how it works, what makes it unique, and what the buyer gets..."
          maxLength={2000}
          rows={5}
          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">{formData.description.length} / 2000</p>
      </div>

      {/* Tags / Keywords */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">TAGS / KEYWORDS</label>
        <div className="space-y-2">
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="e.g., GPT-4, marketing, copywriting, prompts (comma-separated)"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
          />

          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag: string, index: number) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-sm text-purple-300"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="text-purple-300 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* License Type */}
      <div>
        <label className="block text-sm font-semibold text-white mb-3">LICENSE TYPE *</label>
        <div className="flex flex-wrap gap-2">
          {['MIT', 'Apache 2.0', 'Commercial', 'Personal Use Only', 'Custom'].map(license => (
            <button
              key={license}
              type="button"
              onClick={() => onFormChange('licenseType', license)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                formData.licenseType === license
                  ? 'border-purple-500 bg-purple-500/20 text-white'
                  : 'border-slate-600 bg-slate-800/30 text-gray-300 hover:border-slate-500'
              }`}
            >
              {license}
            </button>
          ))}
        </div>
      </div>

      {/* Compatible Frameworks / Models */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          COMPATIBLE FRAMEWORKS / MODELS
        </label>
        <input
          type="text"
          value={formData.compatibleFrameworks}
          onChange={e => onFormChange('compatibleFrameworks', e.target.value)}
          placeholder="e.g., PyTorch, TensorFlow, GPT-4, Llama 3, SDXL (comma-separated)"
          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
        />
        <p className="text-xs text-gray-500 mt-1">Optional - helps buyers find compatible items</p>
      </div>

      {/* Demo URL */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          DEMO URL / PREVIEW LINK (OPTIONAL)
        </label>
        <input
          type="url"
          value={formData.demoUrl}
          onChange={e => onFormChange('demoUrl', e.target.value)}
          placeholder="https://your-demo-or-github.com"
          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
        />
        <p className="text-xs text-gray-500 mt-1">Link to preview, demo, or documentation</p>
      </div>
    </div>
  );
}
