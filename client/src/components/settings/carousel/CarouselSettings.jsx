import React, { useEffect } from 'react';
import {
  Settings,
  Layout,
  Type,
  Monitor,
  Play,
  MousePointer2,
  Box,
  Layers,
  RotateCcw,
  AppWindow 
} from 'lucide-react';
import { useCarouselStore } from './useCarouselStore';
import './CarouselSettings.css';
import useCarouselSettings from './useCarouselSettings';
import Button from '../../sharable/Button';
import { useWidgetStore } from '../../../stores/useWidgetStore';
import { useNavigate } from 'react-router-dom';

const getProgressStyle = (value, min, max) => {
  const val = Number(value);
  const minVal = Number(min);
  const maxVal = Number(max);
  const percent = ((val - minVal) / (maxVal - minVal)) * 100;
  return { '--progress': `${percent}%` };
};

const CarouselSettings = () => {
  const { settings, initializeSettings } = useCarouselStore();

  const selectedWidgetId = useWidgetStore((state) => state.selectedWidgetId);
  const { mutate: updateSettings } = useCarouselSettings();
  const widgetsData = useWidgetStore(state => state.widgetsData);
  const currentWidget = widgetsData?.find(widget => widget._id === selectedWidgetId);
  const navigate = useNavigate();

  const handleChangeSettings = (selectedWidgetId, settings) => {
    updateSettings({
      widgetId: selectedWidgetId,
      newSettings: settings
    });
  };

  useEffect(() => {
    initializeSettings(currentWidget?.carouselSettings);
  }, []);

  useEffect(() => {
    if (!selectedWidgetId) {
      navigate('/video/pages');
    }
  }, []);

  return (
    <div style={{ padding: "10px 75px" }} className="h-full w-full bg-[#f8f9fa] overflow-y-auto p-6">

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        marginBottom: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",

        position: "sticky",
        top: "10px",      
        zIndex: "50", 
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)" 
      }}>
        <div>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>Carousel</p>
          <p style={{ fontSize: "18px", fontWeight: 600, color: "#111827", margin: 0 }}>{currentWidget?.name}</p>
        </div>
        <Button onClick={() => handleChangeSettings(selectedWidgetId, settings)} style={{ padding: "8px 16px", fontWeight: 500 }}>
          Save Settings
        </Button>
      </div>

        <ResponsiveSettings />
        <GeneralAndNavSettings />
        <LayoutAndDesignSettings />
        <TypographySettings />
        <ModalSettings />
      
    </div>
  );
};

// --- NEW COMPONENT: MODAL SETTINGS ---
const ModalSettings = () => {
  const { settings, updateNestedSetting } = useCarouselStore();

  return (
    <div className="settings-section">

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <AppWindow size={20} color="#667eea" />
        <h4 style={{ margin: 0, border: 'none', padding: 0 }}>Player Layout</h4>
      </div>

      <div className="form-group">
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.modal?.isAutoPlay}
            onChange={(e) => updateNestedSetting('modal.isAutoPlay', e.target.checked)}
          />
          <span> Autoplay images </span>
        </label>

        <label>Autoplay Interval</label>
        <input
          type="range"
          min="1000"
          max="10000"
          step="500"
          value={settings.modal?.autoPlayInterval}
          style={getProgressStyle(settings.modal?.autoPlayInterval || 3000, 1000, 10000)}
          onChange={(e) => updateNestedSetting('modal.autoPlayInterval', parseInt(e.target.value))}
        />
        <span className="value-display">{settings.modal?.autoPlayInterval || 3000}ms</span>
      </div>

      <div style={{ margin: '32px 0', borderTop: '2px dashed #e5e7eb' }}></div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <MousePointer2 size={20} color="#667eea" />
        <h4 style={{ margin: 0, border: 'none', padding: 0 }}>Call to Action (CTA)</h4>
      </div>

      <div className="form-group">
        <div className="input-group">
          <label>Button Text</label>
          <input
            type="text"
            value={settings.modal?.ctaText}
            onChange={(e) => updateNestedSetting('modal.ctaText', e.target.value)}
            placeholder="e.g. Buy Now, Learn More"
          />
        </div>

        <div className="grid-2">
          <div className="input-group">
            <label>Button Color</label>
            <input
              type="color"
              value={settings.modal?.ctaColor}
              onChange={(e) => updateNestedSetting('modal.ctaColor', e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Text Color</label>
            <input
              type="color"
              value={settings.modal?.ctaTextColor}
              onChange={(e) => updateNestedSetting('modal.ctaTextColor', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* <div className="note-box" style={{ marginTop: '20px', padding: '12px', background: '#eef2ff', borderRadius: '8px', fontSize: '13px', color: '#4f46e5' }}>
        <strong>Note:</strong> Fonts and base colors are inherited from the "Typography" tab to ensure consistency.
      </div> */}

    </div>
  );
};

const GeneralAndNavSettings = () => {
  const { settings, updateSetting, updateNestedSetting, resetSettings } = useCarouselStore();

  return (
    <div className="settings-section">

      {/* PART B: NAVIGATION */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <MousePointer2 size={20} color="#667eea" />
        <h4 style={{ margin: 0, border: 'none', padding: 0 }}>Navigation Controls</h4>
      </div>

      <div className="form-group">

        <div className="grid-2">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.navigation.showNavigation}
              onChange={(e) => updateNestedSetting('navigation.showNavigation', e.target.checked)}
            />
            <span>Show Navigation</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.navigation.showDots}
              onChange={(e) => updateNestedSetting('navigation.showDots', e.target.checked)}
            />
            <span>Show Dots</span>
          </label>
        </div>

        <div className="grid-2">
          {settings.navigation.showNavigation && (
            <div className="input-group">
              <label>Navigation Color</label>
              <input
                type="color"
                value={settings.navigation.navColor}
                onChange={(e) => updateNestedSetting('navigation.navColor', e.target.value)}
              />
            </div>
          )}

          <div className="input-group">
            <label>Base Color</label>
            <input
              type="color"
              value={settings.navigation.baseColor}
              onChange={(e) => updateNestedSetting('navigation.baseColor', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Highlight Color</label>
            <input
              type="color"
              value={settings.navigation.highlightColor}
              onChange={(e) => updateNestedSetting('navigation.highlightColor', e.target.value)}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

const LayoutAndDesignSettings = () => {
  const { settings, updateNestedSetting } = useCarouselStore();

  return (
    <div className="settings-section">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Layers size={20} color="#667eea" />
        <h4 style={{ margin: 0, border: 'none', padding: 0 }}>Card Styling</h4>
      </div>

      <div className="form-group">
        <div className="grid-2">
          <div className="input-group">
            <label>Hover Effect</label>
            <select
              value={settings.cardSettings.hoverEffect}
              onChange={(e) => updateNestedSetting('cardSettings.hoverEffect', e.target.value)}
            >
              <option value="none">None</option>
              <option value="scale">Scale</option>
              <option value="lift">Lift</option>
              <option value="glow">Glow</option>
            </select>
          </div>
        </div>

        <div className="grid-2">

          <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ margin: 0 }}>Product Info</label>
            <input
              type="checkbox"
              style={{ width: '20px', height: '20px', margin: 0 }}
              checked={settings.cardSettings.showProductInfo}
              onChange={(e) => updateNestedSetting('cardSettings.showProductInfo', e.target.checked)}
            />
          </div>

          <div className="input-group">
            <label>Padding Top</label>
            <input
              type="range"
              min="0"
              max="50"
              value={settings.cardSettings.paddingTop}
              style={getProgressStyle(settings.cardSettings.paddingTop, 0, 50)}
              onChange={(e) => updateNestedSetting('cardSettings.paddingTop', parseInt(e.target.value))}
            />
            <span className="value-display">{settings.cardSettings.paddingTop}px</span>
          </div>

           <div className="input-group">
            <label>Padding Bottom</label>
            <input
              type="range"
              min="0"
              max="50"
              value={settings.cardSettings.paddingBottom}
              style={getProgressStyle(settings.cardSettings.paddingBottom, 0, 50)}
              onChange={(e) => updateNestedSetting('cardSettings.paddingBottom', parseInt(e.target.value))}
            />
            <span className="value-display">{settings.cardSettings.paddingBottom}px</span>
          </div>

        </div>
      </div>
    </div>
  );
};

const TypographySettings = () => {
  const { settings, updateNestedSetting } = useCarouselStore();

  return (
    <div className="settings-section">

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Type size={20} color="#667eea" />
        <h4 style={{ margin: 0, border: 'none', padding: 0 }}>Header</h4>
      </div>

      <div className="form-group">
        <div className="grid-2">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.header.show}
              onChange={(e) => updateNestedSetting('header.show', e.target.checked)}
            />
            <span>Show Header</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.header.isGradient}
              onChange={(e) => updateNestedSetting('header.isGradient', e.target.checked)}
            />
            <span>Gradient Text</span>
          </label>
        </div>

        {settings.header.show && (
          <>
            <div className="input-group">
              <label>Header Text</label>
              <input
                type="text"
                value={settings.header.text}
                onChange={(e) => updateNestedSetting('header.text', e.target.value)}
                placeholder="Enter header text"
              />
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label>Font Size</label>
                <input
                  type="number"
                  min="12"
                  value={settings.header.fontSize}
                  onChange={(e) => updateNestedSetting('header.fontSize', parseInt(e.target.value))}
                />
              </div>
              <div className="input-group">
                <label>Weight</label>
                <select
                  value={settings.header.fontWeight}
                  onChange={(e) => updateNestedSetting('header.fontWeight', e.target.value)}
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="500">Medium</option>
                  <option value="800">Extra Bold</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label>Alignment</label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={settings.header.alignment}
                  style={getProgressStyle(settings.header.alignment, 0, 90)}
                  onChange={(e) => updateNestedSetting('header.alignment', parseInt(e.target.value))}
                />
               <span className="value-display">{settings.header.alignment}px</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ margin: '32px 0', borderTop: '2px dashed #e5e7eb' }}></div>

      {/* <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Type size={20} color="#667eea" />
        <h4 style={{ margin: 0, border: 'none', padding: 0 }}>Description</h4>
      </div> */}

      {/* <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.description.show}
            onChange={(e) => updateNestedSetting('description.show', e.target.checked)}
          />
          <span>Show Description</span>
        </label>

        {settings.description.show && (
          <>
            <div className="input-group">
              <label>Description Text</label>
              <textarea
                value={settings.description.text}
                onChange={(e) => updateNestedSetting('description.text', e.target.value)}
                placeholder="Enter description text"
                rows="3"
              />
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label>Font Size</label>
                <input
                  type="number"
                  min="12"
                  value={settings.description.fontSize}
                  onChange={(e) => updateNestedSetting('description.fontSize', parseInt(e.target.value))}
                />
              </div>
              <div className="input-group">
                <label>Text Color</label>
                <input
                  type="color"
                  value={settings.description.color}
                  onChange={(e) => updateNestedSetting('description.color', e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Line Height</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={settings.description.lineHeight}
                style={getProgressStyle(settings.description.lineHeight, 1, 3)}
                onChange={(e) => updateNestedSetting('description.lineHeight', parseFloat(e.target.value))}
              />
            </div>
          </>
        )}
      </div> */}
    </div>
  );
};

const ResponsiveSettings = () => {
  const { settings, updateNestedSetting } = useCarouselStore();
  return (
    <div className="settings-section">
      <h4>Responsive Settings</h4>
      <div className="responsive-grid">
        <div className="device-section">
          <div className="device-header">
            <Monitor size={18} />
            <h5>Desktop</h5>
          </div>

          <div className="input-group">
            <label>Cards Number</label>
            <input
              type="range"
              min="3"
              max="6"
              value={settings.responsive.desktop.cardsNumber}
              style={getProgressStyle(settings.responsive.desktop.cardsNumber, 3, 6)}
              onChange={(e) => updateNestedSetting('responsive.desktop.cardsNumber', parseInt(e.target.value))}
            />
            <span className="value-display">{settings.responsive.desktop.cardsNumber}</span>
          </div>
        </div>

        <div className="device-section">
          <div className="device-header">
            <Monitor size={18} />
            <h5> Mobile </h5>
          </div>
          <div className="input-group">
            <label>Cards Number</label>
            <input
              type="range"
              min="1"
              max="3"
              value={settings.responsive.mobile.cardsNumber}
              style={getProgressStyle(settings.responsive.mobile.cardsNumber, 1, 3)}
              onChange={(e) => updateNestedSetting('responsive.mobile.cardsNumber', parseInt(e.target.value))}
            />
            <span className="value-display">{settings.responsive.mobile.cardsNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarouselSettings;