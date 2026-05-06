import React, { useRef } from 'react';

interface StepOneProps {
  formData: any;
  onFormChange: (field: string, value: any) => void;
}

export default function StepOne({ formData, onFormChange }: StepOneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    addImages(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addImages(files);
    }
  };

  const addImages = (files: File[]) => {
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isCover: formData.images.length === 0, // First image is cover
    }));

    onFormChange('images', [...formData.images, ...newImages].slice(0, 10));
  };

  const removeImage = (index: number) => {
    const updated = formData.images.filter((_: any, i: number) => i !== index);
    // If we removed the cover, make the first image the cover
    if (updated.length > 0 && formData.images[index].isCover) {
      updated[0].isCover = true;
    }
    onFormChange('images', updated);
  };

  const setCover = (index: number) => {
    const updated = formData.images.map((img: any, i: number) => ({
      ...img,
      isCover: i === index,
    }));
    onFormChange('images', updated);
  };

  return (
    <div className="space-y-6">
      {/* Photos Upload */}
      <div>
        <label className="block text-sm font-semibold text-white mb-3">
          PHOTOS / SCREENSHOTS (UP TO 10)
        </label>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-slate-600 hover:border-purple-500/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex flex-col items-center gap-2"
          >
            <div className="text-3xl">📁</div>
            <p className="text-sm text-gray-300">
              <span className="font-semibold text-white">Add</span> or drag files here
            </p>
            <p className="text-xs text-gray-500">First photo will be the cover. Drag to reorder.</p>
          </button>
        </div>

        {/* Image Previews */}
        {formData.images.length > 0 && (
          <div className="mt-4 grid grid-cols-4 gap-3">
            {formData.images.map((img: any, index: number) => (
              <div key={index} className="relative group">
                <img
                  src={img.preview}
                  alt={`Preview ${index + 1}`}
                  className={`w-full h-24 object-cover rounded-lg border-2 transition-all ${
                    img.isCover
                      ? 'border-purple-500 ring-2 ring-purple-500/50'
                      : 'border-slate-600 group-hover:border-slate-500'
                  }`}
                />

                {img.isCover && (
                  <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-2 py-1 rounded font-semibold">
                    COVER
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                >
                  ✕
                </button>

                {!img.isCover && (
                  <button
                    type="button"
                    onClick={() => setCover(index)}
                    className="absolute bottom-1 left-1 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Set as cover
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2">
          {formData.images.length} / 10 images
        </p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">TITLE *</label>
        <input
          type="text"
          value={formData.title}
          onChange={e => onFormChange('title', e.target.value)}
          placeholder="e.g., GPT-4 Marketing Prompt Pack (50 prompts)"
          maxLength={120}
          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
        />
        <p className="text-xs text-gray-500 mt-1">{formData.title.length} / 120</p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-white mb-3">CATEGORY *</label>
        <div className="grid grid-cols-3 gap-3">
          {['Digital Assets', 'Compute Hub', 'Hardware'].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => onFormChange('category', cat)}
              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                formData.category === cat
                  ? 'border-purple-500 bg-purple-500/20 text-white'
                  : 'border-slate-600 bg-slate-800/30 text-gray-300 hover:border-slate-500'
              }`}
            >
              <div className="text-xl mb-1">
                {cat === 'Digital Assets' && '💾'}
                {cat === 'Compute Hub' && '⚙️'}
                {cat === 'Hardware' && '🖥️'}
              </div>
              <div className="text-xs font-medium">{cat}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-white mb-2">PRICING TYPE *</label>
          <select
            value={formData.pricingType}
            onChange={e => onFormChange('pricingType', e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
          >
            <option value="">Select pricing type...</option>
            <option value="Fixed Price">Fixed Price</option>
            <option value="Bidding">Bidding</option>
            <option value="Subscription">Subscription</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-white mb-2">PRICE (USD)</label>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">$</span>
            <input
              type="number"
              value={formData.price}
              onChange={e => onFormChange('price', e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              disabled={formData.pricingType === 'Bidding'}
              className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50"
            />
          </div>
          {formData.pricingType === 'Bidding' && (
            <p className="text-xs text-gray-500 mt-1">Price set by bids</p>
          )}
        </div>
      </div>
    </div>
  );
}
