import React, { useState } from 'react';
import type { DashboardMetricDto } from '@sih26019/shared-types';

interface MetricCardProps {
  metric: DashboardMetricDto;
  onNavigate?: (path: string) => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric, onNavigate }) => {
  const [showDefinition, setShowDefinition] = useState(false);

  const formattedValue =
    typeof metric.value === 'number'
      ? new Intl.NumberFormat('en-IN').format(metric.value)
      : (metric.value ?? '—');

  const formatUnit = (unit: string): string => {
    switch (unit) {
      case 'tonnes_co2e':
        return 't CO₂e/yr';
      case 'hectares':
        return 'ha';
      default:
        return unit;
    }
  };

  return (
    <div
      className="metric-card"
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        position: 'relative',
      }}
      data-testid={`metric-card-${metric.key}`}
    >
      <div>
        {/* Header Badges */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
            gap: '0.5rem',
          }}
        >
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              background: metric.region.scope === 'REGIONAL' ? '#fef3c7' : '#e0f2fe',
              color: metric.region.scope === 'REGIONAL' ? '#92400e' : '#0369a1',
            }}
          >
            {metric.region.scope === 'REGIONAL' ? 'Regional' : 'National'}
          </span>

          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            {metric.sampleFlag && (
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  padding: '0.1rem 0.35rem',
                  borderRadius: '4px',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: '1px solid #cbd5e1',
                }}
                title="Derived from verified prototype demonstration records"
              >
                Sample
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowDefinition((prev) => !prev)}
              aria-label={`Definition for ${metric.label}`}
              title="Show metric definition"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: '#64748b',
                padding: '0.1rem 0.3rem',
                borderRadius: '50%',
              }}
            >
              ℹ️
            </button>
          </div>
        </div>

        {/* Metric Label */}
        <h4
          style={{
            fontSize: '0.925rem',
            fontWeight: 600,
            color: '#334155',
            margin: '0 0 0.5rem 0',
            lineHeight: 1.3,
          }}
        >
          {metric.label}
        </h4>

        {/* Value & Unit */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.4rem',
            marginBottom: '0.75rem',
          }}
        >
          <span
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
            data-testid={`metric-value-${metric.key}`}
          >
            {formattedValue}
          </span>
          <span
            style={{
              fontSize: '0.85rem',
              color: '#64748b',
              fontWeight: 500,
            }}
          >
            {formatUnit(metric.unit)}
          </span>
        </div>

        {/* Expandable Definition */}
        {showDefinition && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '0.6rem',
              fontSize: '0.775rem',
              color: '#475569',
              marginBottom: '0.75rem',
              lineHeight: 1.4,
            }}
            role="note"
          >
            {metric.definition}
          </div>
        )}
      </div>

      {/* Footer: Source and Action */}
      <div
        style={{
          borderTop: '1px solid #f1f5f9',
          paddingTop: '0.6rem',
          marginTop: '0.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span
          style={{
            fontSize: '0.725rem',
            color: '#64748b',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={`Source: ${metric.source}`}
        >
          {metric.source}
        </span>

        {metric.detailPath && onNavigate && (
          <button
            type="button"
            data-testid={`metric-explore-${metric.key}`}
            onClick={() => onNavigate(metric.detailPath!)}
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#0284c7',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.2rem 0.4rem',
              whiteSpace: 'nowrap',
            }}
          >
            Explore →
          </button>
        )}
      </div>
    </div>
  );
};
