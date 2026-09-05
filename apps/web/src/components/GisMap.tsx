import React, { useState, useMemo } from 'react';
import type { GisFeatureDto, GisLayerDto } from '@sih26019/shared-types';

interface GisMapProps {
  features: GisFeatureDto[];
  layers: GisLayerDto[];
  selectedFeatureId: string | null;
  onSelectFeature: (featureId: string) => void;
  simulateFailure: boolean;
  onSwitchToTable: () => void;
}

export const GisMap: React.FC<GisMapProps> = ({
  features,
  layers,
  selectedFeatureId,
  onSelectFeature,
  simulateFailure,
  onSwitchToTable,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredFeature, setHoveredFeature] = useState<GisFeatureDto | null>(null);

  // SVG canvas dimensions
  const width = 800;
  const height = 500;
  const padding = 40;

  // Build layer lookup for colors
  const layerMap = useMemo(() => {
    const map = new Map<string, GisLayerDto>();
    layers.forEach((l) => map.set(l.id, l));
    return map;
  }, [layers]);

  // Compute spatial bounding box from all features coordinates
  const bbox = useMemo(() => {
    let minLon = Infinity;
    let maxLon = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    const ingestCoord = (coord: [number, number]) => {
      const [lon, lat] = coord;
      if (typeof lon === 'number' && typeof lat === 'number' && !isNaN(lon) && !isNaN(lat)) {
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
    };

    features.forEach((feat) => {
      if (!feat.geometry || !feat.geometry.coordinates) return;
      const geom = feat.geometry;
      if (geom.type === 'Point') {
        ingestCoord(geom.coordinates as [number, number]);
      } else if (geom.type === 'LineString') {
        (geom.coordinates as [number, number][]).forEach(ingestCoord);
      } else if (geom.type === 'Polygon') {
        (geom.coordinates as [number, number][][]).forEach((ring) => ring.forEach(ingestCoord));
      } else if (geom.type === 'MultiPolygon') {
        (geom.coordinates as [number, number][][][]).forEach((poly) =>
          poly.forEach((ring) => ring.forEach(ingestCoord)),
        );
      }
    });

    if (minLon === Infinity) {
      // Default to Coringa Mangrove Sanctuary approximate bounds
      return { minLon: 82.25, maxLon: 82.42, minLat: 16.82, maxLat: 17.02 };
    }

    // Add 10% margin
    const dLon = (maxLon - minLon) * 0.1 || 0.02;
    const dLat = (maxLat - minLat) * 0.1 || 0.02;
    return {
      minLon: minLon - dLon,
      maxLon: maxLon + dLon,
      minLat: minLat - dLat,
      maxLat: maxLat + dLat,
    };
  }, [features]);

  // Transform Lon/Lat to SVG X/Y coordinates
  const project = (lon: number, lat: number): [number, number] => {
    const lonRange = bbox.maxLon - bbox.minLon || 0.001;
    const latRange = bbox.maxLat - bbox.minLat || 0.001;
    const x = padding + ((lon - bbox.minLon) / lonRange) * (width - 2 * padding);
    const y = padding + ((bbox.maxLat - lat) / latRange) * (height - 2 * padding);
    return [x, y];
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.3, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.3, 0.7));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (simulateFailure) {
    return (
      <div
        role="alert"
        style={{
          height: `${height}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fef2f2',
          border: '2px dashed #ef4444',
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#991b1b', fontSize: '1.2rem' }}>
          Simulated Map Provider Failure
        </h3>
        <p
          style={{
            margin: '0 0 1.25rem 0',
            color: '#7f1d1d',
            maxWidth: '480px',
            fontSize: '0.875rem',
          }}
        >
          The spatial vector rendering engine is currently simulating an outage or offline map
          condition. Please use the accessible spatial records table fallback below to browse
          features and regional cross-module links.
        </p>
        <button
          type="button"
          onClick={onSwitchToTable}
          style={{
            padding: '0.6rem 1.2rem',
            background: '#dc2626',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          📋 Switch to Accessible Table View
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        background: '#0f172a',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #334155',
      }}
      role="region"
      aria-label="Interactive GIS Spatial Map"
    >
      {/* Top Overlay Banner */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(4px)',
          border: '1px solid #334155',
          borderRadius: '6px',
          padding: '0.4rem 0.75rem',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#fbbf24',
          }}
        >
          ⚠️ Prototype / Sample GIS Data &bull; Synthetic Spatial Coordinates
        </span>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Visible Features: {features.length}
        </span>
      </div>

      {/* Map Controls */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          style={{
            width: '32px',
            height: '32px',
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #475569',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          +
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          style={{
            width: '32px',
            height: '32px',
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #475569',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          &minus;
        </button>
        <button
          type="button"
          onClick={handleResetZoom}
          title="Reset View"
          style={{
            width: '32px',
            height: '32px',
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #475569',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.7rem',
          }}
        >
          ⟲
        </button>
      </div>

      {/* Hover Info Tooltip */}
      {hoveredFeature && (
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid #38bdf8',
            borderRadius: '6px',
            padding: '0.4rem 0.8rem',
            color: '#f8fafc',
            fontSize: '0.75rem',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontWeight: 600, color: '#38bdf8' }}>
            {hoveredFeature.properties?.name
              ? String(hoveredFeature.properties.name)
              : hoveredFeature.id}
          </div>
          <div style={{ color: '#94a3b8' }}>
            Layer: {hoveredFeature.layerName} &bull; Type: {hoveredFeature.geometry.type}
          </div>
        </div>
      )}

      {/* Native SVG Vector Canvas */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{
          width: '100%',
          height: `${height}px`,
          display: 'block',
          cursor: 'grab',
          background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)',
        }}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
          </pattern>
        </defs>

        {/* Background Grid */}
        <rect width={width} height={height} fill="url(#grid)" />

        {/* Coordinate Reference Axes Outline */}
        <rect
          x={padding}
          y={padding}
          width={width - 2 * padding}
          height={height - 2 * padding}
          fill="none"
          stroke="#334155"
          strokeDasharray="4 4"
        />

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {features.map((feat) => {
            const layer = layerMap.get(feat.layerId);
            const fillColor = layer?.legend?.color || '#0284c7';
            const strokeColor = layer?.legend?.strokeColor || '#38bdf8';
            const isSelected = selectedFeatureId === feat.id;
            const geom = feat.geometry;

            if (!geom || !geom.coordinates) return null;

            if (geom.type === 'Polygon') {
              const rings = geom.coordinates as [number, number][][];
              if (!rings.length || !rings[0]) return null;
              const pointsStr = rings[0]
                .map((coord) => {
                  const [px, py] = project(coord[0], coord[1]);
                  return `${px},${py}`;
                })
                .join(' ');

              return (
                <polygon
                  key={feat.id}
                  points={pointsStr}
                  fill={fillColor}
                  fillOpacity={isSelected ? 0.85 : 0.45}
                  stroke={isSelected ? '#fde047' : strokeColor}
                  strokeWidth={isSelected ? 3 : 1.5}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={() => setHoveredFeature(feat)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  onClick={() => onSelectFeature(feat.id)}
                />
              );
            }

            if (geom.type === 'LineString') {
              const coords = geom.coordinates as [number, number][];
              const pointsStr = coords
                .map((coord) => {
                  const [px, py] = project(coord[0], coord[1]);
                  return `${px},${py}`;
                })
                .join(' ');

              return (
                <polyline
                  key={feat.id}
                  points={pointsStr}
                  fill="none"
                  stroke={isSelected ? '#fde047' : strokeColor}
                  strokeWidth={isSelected ? 4 : 2.5}
                  strokeDasharray={layer?.layerType === 'DISPUTES' ? '6 3' : undefined}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={() => setHoveredFeature(feat)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  onClick={() => onSelectFeature(feat.id)}
                />
              );
            }

            if (geom.type === 'Point') {
              const [lon, lat] = geom.coordinates as [number, number];
              const [cx, cy] = project(lon, lat);

              return (
                <g
                  key={feat.id}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredFeature(feat)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  onClick={() => onSelectFeature(feat.id)}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 10 : 7}
                    fill={fillColor}
                    stroke={isSelected ? '#fde047' : '#ffffff'}
                    strokeWidth={isSelected ? 3 : 1.5}
                  />
                  {isSelected && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={14}
                      fill="none"
                      stroke="#fde047"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                    />
                  )}
                </g>
              );
            }

            return null;
          })}
        </g>
      </svg>
    </div>
  );
};
