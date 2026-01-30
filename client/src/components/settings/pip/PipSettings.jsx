import React, { useEffect, useState } from 'react';
import {
  Settings,
  Move,
  Maximize,
  RotateCcw,
  Monitor,
  Smartphone
} from 'lucide-react';
import { usePipStore } from './usePipStore';
import { useWidgetStore } from '../../../stores/useWidgetStore';
import Button from '../../sharable/Button';
import { useNavigate } from 'react-router-dom';

import '../carousel/CarouselSettings.css';
import usePipSettings from './usePipSettings';

const getProgressStyle = (value, min, max) => {
  const val = Number(value);
  const minVal = Number(min);
  const maxVal = Number(max);
  const percent = ((val - minVal) / (maxVal - minVal)) * 100;
  return { '--progress': `${percent}%` };
};

const PipSettings = () => {
  const { settings, updateSetting, resetSettings, initializeSettings } = usePipStore();
  const [isMobileView, setIsMobileView] = useState(false);

  const selectedWidgetId = useWidgetStore((state) => state.selectedWidgetId);
  const { mutate: updateSettings } = usePipSettings();
  const widgetsData = useWidgetStore(state => state.widgetsData);
  const currentWidget = widgetsData?.find(widget => widget._id === selectedWidgetId);
  const navigate = useNavigate();

  const getValue = (key) => {
    return isMobileView ? settings.mobile?.[key] : settings[key];
  };

  const handleUpdate = (key, value) => {
    updateSetting(key, value, isMobileView);
  };

  useEffect(() => {
    if (!selectedWidgetId) navigate('/video/pages');
  }, [selectedWidgetId, navigate]);

  const handleSave = () => {
    updateSettings({
      widgetId: selectedWidgetId,
      newSettings: settings
    });
  };

  const pageContainerStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9fa',
    overflowY: 'auto',
    padding: '24px'
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    marginBottom: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    border: "1px solid #e5e7eb"
  };

  useEffect(() => {
    initializeSettings(currentWidget?.pipSettings)
  }, [])

  console.log(settings, "settings in pip")

  return (
    <div style={pageContainerStyle}>
      <div style={{ width: '100%' }}>

        <div style={headerStyle}>
          <div>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>Pip Widget</p>
            <p style={{ fontSize: "18px", fontWeight: 600, color: "#111827", margin: 0 }}>{currentWidget?.name}</p>
          </div>
          <Button onClick={handleSave} style={{ padding: "8px 16px", fontWeight: 500 }}>
            Save Settings
          </Button>
        </div>

        <div style={{ display: 'flex', gap: '4px', padding: '4px', background: '#e5e7eb', borderRadius: '8px', marginBottom: '24px', width: 'fit-content' }}>
          <button
            onClick={() => setIsMobileView(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '6px',
              border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '14px',
              background: !isMobileView ? 'white' : 'transparent',
              color: !isMobileView ? '#111827' : '#6b7280',
              boxShadow: !isMobileView ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <Monitor size={16} /> Desktop
          </button>
          <button
            onClick={() => setIsMobileView(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '6px',
              border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '14px',
              background: isMobileView ? 'white' : 'transparent',
              color: isMobileView ? '#111827' : '#6b7280',
              boxShadow: isMobileView ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <Smartphone size={16} /> Mobile
          </button>
        </div>

        <div className="settings-section">

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Move size={20} color="#667eea" />
            <h4 style={{ margin: 0, border: 'none', padding: 0 }}>
              {isMobileView ? 'Mobile Placement' : 'Desktop Placement'}
            </h4>
          </div>

          <div className="form-group">
            <div className="input-group" style={{ width: '100%' }}>
              <label style={{ marginBottom: '12px' }}>Choose Corner</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
                {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => {
                  const currentPos = getValue('position') || 'bottom-right';
                  const isActive = currentPos === pos;

                  return (
                    <button
                      key={pos}
                      onClick={() => handleUpdate('position', pos)}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        border: isActive ? '2px solid #667eea' : '1px solid #e5e7eb',
                        background: isActive ? '#eef2ff' : '#ffffff',
                        color: isActive ? '#4f46e5' : '#374151',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: '14px',
                        textTransform: 'capitalize',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                        boxShadow: isActive ? '0 2px 4px rgba(99, 102, 241, 0.1)' : 'none'
                      }}
                    >
                      {pos.replace('-', ' ')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ margin: '32px 0', borderTop: '2px dashed #e5e7eb' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Maximize size={20} color="#667eea" />
            <h4 style={{ margin: 0, border: 'none', padding: 0 }}>
              {isMobileView ? 'Mobile Dimensions' : 'Desktop Dimensions'}
            </h4>
          </div>

          <div className="form-group">

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={getValue('circle')}
                onChange={(e) => handleUpdate('circle', e.target.checked)}
              />
              <span> Circle Video </span>
            </label>

            <div className="grid-2" style={{ width: '100%' }}>

              <div className="input-group">
                <label>Video Size (% of screen)</label>
                <input
                  type="range"
                  min="10"
                  max="20"
                  value={getValue('size') || 20}
                  style={getProgressStyle(getValue('size') || 20, 10, 20)}
                  onChange={(e) => handleUpdate('size', parseInt(e.target.value))}
                />
                <span className="value-display">{getValue('size') || 20}%</span>
              </div>

              <div className="input-group">
                <label>Edge Spacing (px)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={getValue('margin') || 0}
                  style={getProgressStyle(getValue('margin') || 0, 0, 100)}
                  onChange={(e) => handleUpdate('margin', parseInt(e.target.value))}
                />
                <span className="value-display">{getValue('margin') || 0}px</span>
              </div>

              {
                !getValue('circle') && <div className="input-group">
                  <label>Border Radius %</label>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={getValue('borderRadius') || 0}
                    style={getProgressStyle(getValue('borderRadius') || 0, 0, 15)}
                    onChange={(e) => handleUpdate('borderRadius', parseInt(e.target.value))}
                  />
                  <span className="value-display">{getValue('borderRadius') || 0}%</span>
                </div>
              }

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PipSettings;