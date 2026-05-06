// Itara Post a Listing Modal Feature
(() => {
  const { useState, useRef } = React;

  // Listing Modal Component
  function ListingModal({ isOpen, onClose, user, supabase }) {
    const [step, setStep] = useState(1);
    const [images, setImages] = useState([]);
    const [formData, setFormData] = useState({
      title: '',
      category: 'Digital Assets',
      pricingType: 'Fixed Price',
      price: '',
      description: '',
      tags: [],
      licenseType: 'MIT',
      compatibleFrameworks: '',
      demoUrl: '',
      deliveryMethod: 'Instant Download',
    });
    const [tagInput, setTagInput] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const modalStyle = {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      display: isOpen ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      backdropFilter: 'blur(8px)',
    };

    const contentStyle = {
      backgroundColor: '#F8F7F3',
      borderRadius: '16px',
      border: '2px solid #6C5CE7',
      padding: '40px',
      maxWidth: '650px',
      width: '90vw',
      maxHeight: '80vh',
      overflowY: 'auto',
      boxShadow: '0 25px 80px rgba(108,92,231,0.2)',
    };

    const titleStyle = {
      color: '#0A0A0C',
      fontSize: '28px',
      fontWeight: 700,
      marginBottom: '8px',
    };

    const subtitleStyle = {
      color: 'rgba(10,10,12,0.6)',
      fontSize: '13px',
      marginBottom: '24px',
      fontWeight: 600,
    };

    const progressStyle = {
      height: '6px',
      backgroundColor: 'rgba(108,92,231,0.1)',
      borderRadius: '3px',
      marginBottom: '24px',
      overflow: 'hidden',
    };

    const progressFillStyle = {
      height: '100%',
      background: 'linear-gradient(90deg, #6C5CE7, #A78BFA)',
      width: `${(step / 3) * 100}%`,
      transition: 'width 0.3s',
    };

    const buttonStyle = {
      backgroundColor: '#6C5CE7',
      color: '#F8F7F3',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 16px',
      fontSize: '12px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'inline-block',
    };

    const secondaryButtonStyle = {
      ...buttonStyle,
      backgroundColor: 'rgba(108,92,231,0.1)',
      color: '#6C5CE7',
    };

    const inputStyle = {
      width: '100%',
      padding: '10px 12px',
      backgroundColor: '#FFFFFF',
      border: '1px solid rgba(108,92,231,0.2)',
      borderRadius: '6px',
      color: '#0A0A0C',
      fontSize: '13px',
      marginBottom: '12px',
      fontFamily: 'inherit',
    };

    const labelStyle = {
      display: 'block',
      color: '#0A0A0C',
      fontSize: '12px',
      fontWeight: 700,
      marginBottom: '6px',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    };

    const handleDrop = (e) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      const newImages = files.map(f => ({
        file: f,
        preview: URL.createObjectURL(f),
        isCover: images.length === 0,
      }));
      setImages([...images, ...newImages].slice(0, 10));
    };

    const handleFileSelect = (e) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        const newImages = files.map(f => ({
          file: f,
          preview: URL.createObjectURL(f),
          isCover: images.length === 0,
        }));
        setImages([...images, ...newImages].slice(0, 10));
      }
    };

    const handleAddTag = (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const newTag = tagInput.trim();
        if (newTag && !formData.tags.includes(newTag)) {
          setFormData({ ...formData, tags: [...formData.tags, newTag] });
          setTagInput('');
        }
      }
    };

    const removeTag = (idx) => {
      setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== idx) });
    };

    const removeImage = (idx) => {
      const updated = images.filter((_, i) => i !== idx);
      if (updated.length > 0 && images[idx].isCover) {
        updated[0].isCover = true;
      }
      setImages(updated);
    };

    const handleSubmit = async () => {
      if (!user) {
        alert('Please sign in to post a listing');
        return;
      }

      setLoading(true);
      try {
        const { data: listing, error: listingError } = await supabase
          .from('listings')
          .insert({
            seller_id: user.id,
            title: formData.title,
            category: formData.category,
            pricing_type: formData.pricingType,
            price: formData.price ? parseFloat(formData.price) : null,
            description: formData.description,
            tags: formData.tags,
            license_type: formData.licenseType,
            compatible_frameworks: formData.compatibleFrameworks,
            demo_url: formData.demoUrl,
            delivery_method: formData.deliveryMethod,
            status: 'active',
          })
          .select()
          .single();

        if (listingError) throw listingError;

        for (const img of images) {
          const fileName = `${user.id}/${listing.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;

          const { error: uploadError } = await supabase.storage
            .from('listings')
            .upload(fileName, img.file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('listings')
            .getPublicUrl(fileName);

          await supabase
            .from('listing_images')
            .insert({
              listing_id: listing.id,
              image_url: publicUrl,
              storage_path: fileName,
              is_cover: img.isCover,
            });
        }

        alert('Listing posted successfully!');
        onClose();
        setStep(1);
        setImages([]);
        setFormData({
          title: '',
          category: 'Digital Assets',
          pricingType: 'Fixed Price',
          price: '',
          description: '',
          tags: [],
          licenseType: 'MIT',
          compatibleFrameworks: '',
          demoUrl: '',
          deliveryMethod: 'Instant Download',
        });
      } catch (error) {
        console.error('Error posting listing:', error);
        alert('Failed to post listing: ' + (error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    return (
      <div style={modalStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div style={contentStyle}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={titleStyle}>✨ Post a Listing</div>
              <div style={subtitleStyle}>Step {step} of 3</div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#0A0A0C', fontSize: '24px', cursor: 'pointer' }}>✕</button>
          </div>

          {/* Progress bar */}
          <div style={progressStyle}>
            <div style={progressFillStyle} />
          </div>

          {/* Step 1: Images, Title, Category, Price */}
          {step === 1 && (
            <div>
              <label style={labelStyle}>Photos (up to 10)</label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                style={{
                  border: '2px dashed #6C5CE7',
                  borderRadius: '8px',
                  padding: '24px',
                  textAlign: 'center',
                  marginBottom: '20px',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(108, 92, 231, 0.05)',
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
                <div style={{ color: '#0A0A0C', fontSize: '13px', fontWeight: 600 }}>Drop images here or click to browse</div>
                <div style={{ color: 'rgba(10,10,12,0.5)', fontSize: '12px', marginTop: '4px' }}>{images.length} / 10 images</div>
              </div>

              {images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
                  {images.map((img, i) => (
                    <div key={i} style={{ position: 'relative', aspectRatio: '1' }}>
                      <img src={img.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: img.isCover ? '2px solid #6C5CE7' : '1px solid rgba(108,92,231,0.1)' }} />
                      <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: '4px', right: '4px', background: '#E63946', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                      {img.isCover && <div style={{ position: 'absolute', top: '4px', left: '4px', background: '#6C5CE7', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '3px', fontWeight: 600 }}>COVER</div>}
                    </div>
                  ))}
                </div>
              )}

              <label style={labelStyle}>Title *</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="What are you selling?" maxLength="120" style={inputStyle} />
              <div style={{ fontSize: '11px', color: 'rgba(10,10,12,0.5)', marginBottom: '16px' }}>{formData.title.length} / 120</div>

              <label style={labelStyle}>Category *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                {['Digital Assets', 'Compute Hub', 'Hardware'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFormData({ ...formData, category: cat })}
                    style={{
                      ...buttonStyle,
                      backgroundColor: formData.category === cat ? '#6C5CE7' : '#FFFFFF',
                      color: formData.category === cat ? '#F8F7F3' : '#6C5CE7',
                      border: formData.category === cat ? '2px solid #6C5CE7' : '2px solid rgba(108,92,231,0.2)',
                      padding: '8px 12px',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Pricing Type *</label>
                  <select value={formData.pricingType} onChange={(e) => setFormData({ ...formData, pricingType: e.target.value })} style={inputStyle}>
                    <option value="Fixed Price">Fixed Price</option>
                    <option value="Bidding">Bidding</option>
                    <option value="Subscription">Subscription</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Price (USD) *</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" min="0" step="0.01" disabled={formData.pricingType === 'Bidding'} style={{ ...inputStyle, opacity: formData.pricingType === 'Bidding' ? 0.5 : 1 }} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Description, Tags, License */}
          {step === 2 && (
            <div>
              <label style={labelStyle}>Description *</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe what you're selling..." maxLength="2000" rows="4" style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }} />
              <div style={{ fontSize: '11px', color: 'rgba(10,10,12,0.5)', marginBottom: '16px' }}>{formData.description.length} / 2000</div>

              <label style={labelStyle}>Tags / Keywords</label>
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="Add tags (press Enter)" style={inputStyle} />
              {formData.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {formData.tags.map((tag, i) => (
                    <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', backgroundColor: 'rgba(108, 92, 231, 0.15)', borderRadius: '16px', fontSize: '12px', color: '#6C5CE7' }}>
                      {tag}
                      <button onClick={() => removeTag(i)} style={{ background: 'none', border: 'none', color: '#6C5CE7', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              <label style={labelStyle}>License Type *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
                {['MIT', 'Apache 2.0', 'Commercial', 'Personal Use Only'].map((lic) => (
                  <button
                    key={lic}
                    onClick={() => setFormData({ ...formData, licenseType: lic })}
                    style={{
                      ...buttonStyle,
                      backgroundColor: formData.licenseType === lic ? '#6C5CE7' : '#FFFFFF',
                      color: formData.licenseType === lic ? '#F8F7F3' : '#6C5CE7',
                      border: formData.licenseType === lic ? '2px solid #6C5CE7' : '2px solid rgba(108,92,231,0.2)',
                      padding: '8px 12px',
                    }}
                  >
                    {lic}
                  </button>
                ))}
              </div>

              <label style={labelStyle}>Compatible Frameworks</label>
              <input type="text" value={formData.compatibleFrameworks} onChange={(e) => setFormData({ ...formData, compatibleFrameworks: e.target.value })} placeholder="e.g., PyTorch, TensorFlow, GPT-4" style={inputStyle} />

              <label style={labelStyle}>Demo URL (Optional)</label>
              <input type="url" value={formData.demoUrl} onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })} placeholder="https://..." style={inputStyle} />
            </div>
          )}

          {/* Step 3: Delivery Method & Preview */}
          {step === 3 && (
            <div>
              <label style={labelStyle}>Delivery Method *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '20px' }}>
                {[
                  { id: 'Instant Download', label: 'Instant Download', icon: '⚡' },
                  { id: 'Manual Delivery', label: 'Manual Delivery', icon: '📦' },
                  { id: 'API Access', label: 'API Access', icon: '🔌' },
                  { id: 'Physical Shipping', label: 'Physical Shipping', icon: '🚚' },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setFormData({ ...formData, deliveryMethod: method.id })}
                    style={{
                      ...buttonStyle,
                      backgroundColor: formData.deliveryMethod === method.id ? 'rgba(108, 92, 231, 0.2)' : '#FFFFFF',
                      color: '#0A0A0C',
                      border: formData.deliveryMethod === method.id ? '2px solid #6C5CE7' : '1px solid rgba(108,92,231,0.1)',
                      padding: '12px',
                      textAlign: 'left',
                      height: 'auto',
                      display: 'block',
                    }}
                  >
                    <div style={{ fontSize: '16px', marginBottom: '4px' }}>{method.icon}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>{method.label}</div>
                  </button>
                ))}
              </div>

              <div style={{ backgroundColor: '#FFFFFF', border: '2px solid rgba(108,92,231,0.1)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#0A0A0C', marginBottom: '8px' }}>Preview</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0A0A0C', marginBottom: '4px' }}>{formData.title || 'Untitled'}</div>
                <div style={{ fontSize: '12px', color: 'rgba(10,10,12,0.7)', marginBottom: '4px' }}>{formData.category}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#6C5CE7' }}>${formData.price || '0.00'}{formData.pricingType === 'Subscription' && '/mo'}</div>
              </div>

              <div style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', border: '2px solid rgba(76, 175, 80, 0.3)', borderRadius: '8px', padding: '12px', display: 'flex', gap: '8px' }}>
                <div style={{ fontSize: '16px' }}>🛡️</div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#2E7D32' }}>Protected by WhichAI Escrow</div>
                  <div style={{ fontSize: '11px', color: 'rgba(10,10,12,0.6)', marginTop: '2px' }}>Payment held securely until buyer confirms delivery</div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} style={secondaryButtonStyle} disabled={loading}>
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} style={buttonStyle} disabled={loading}>
                Next →
              </button>
            ) : (
              <button onClick={handleSubmit} style={buttonStyle} disabled={loading}>
                {loading ? 'Publishing...' : 'Publish Listing'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  window.LISTING = { ListingModal };
})();
