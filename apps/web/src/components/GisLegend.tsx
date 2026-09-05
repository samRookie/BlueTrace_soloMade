import React from 'react';
import type { GisLayerDto } from '@sih26019/shared-types';

interface GisLegendProps {
  layers: GisLayerDto[];
  activeLayerIds: Set<string>;
  onToggleLayer: (layerId: string) => void;
}

export const GisLegend: React.FC<GisLegendProps> = ({ layers, activeLayerIds, onToggleLayer }) => {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '1rem',
        marginTop: '1rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
        }}
      >
        <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>
          🗺️ Layer Legend &amp; Controls
        </h4>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          {activeLayerIds.size} / {layers.length} Active
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {layers.map((layer) => {
          const isActive = activeLayerIds.has(layer.id);
          const color = layer.legend?.color || '#0284c7';
          const stroke = layer.legend?.strokeColor || '#0369a1';

          return (
            <label
              key={layer.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: '#334155',
                cursor: 'pointer',
                padding: '0.35rem 0.5rem',
                borderRadius: '4px',
                background: isActive ? '#f8fafc' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? '#e2e8f0' : 'transparent',
              }}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => onToggleLayer(layer.id)}
                style={{ cursor: 'pointer' }}
              />
              <span
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: layer.geometryType === 'Point' ? '50%' : '2px',
                  backgroundColor: color,
                  border: `2px solid ${stroke}`,
                  flexShrink: 0,
                  display: 'inline-block',
                }}
              />
              <div
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontWeight: isActive ? 600 : 400 }}>{layer.name}</span>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {layer.layerType} &bull; {layer.geometryType} &bull; {layer.featureCount} features
                </div>
              </div>
              {layer.visibility === 'INTERNAL' && (
                <span
                  style={{
                    fontSize: '0.65rem',
                    background: '#fef3c7',
                    color: '#92400e',
                    padding: '0.1rem 0.35rem',
                    borderRadius: '4px',
                    fontWeight: 600,
                  }}
                  title="Internal restricted layer"
                >
                  🔒 INTERNAL
                </span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
};
