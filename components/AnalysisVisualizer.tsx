import { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { UserDrivenResponse } from '../types';

interface AnalysisVisualizerProps {
  response: UserDrivenResponse;
  theme: 'light' | 'dark';
}

const AnalysisVisualizer: React.FC<AnalysisVisualizerProps> = ({ response, theme }) => {
  // Convert analysis data to nodes and edges
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];
    
    // Problem node (center)
    nodes.push({
      id: 'problem',
      type: 'input',
      data: { 
        label: (
          <div style={{ padding: '16px' }}>
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '11px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              color: theme === 'dark' ? '#9ca3af' : '#000000',
              marginBottom: '8px'
            }}>
              Problem Statement
            </div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              lineHeight: '1.4',
              color: theme === 'dark' ? '#e5e5e5' : '#000000'
            }}>
              {response.refined_problem.substring(0, 120)}...
            </div>
          </div>
        )
      },
      position: { x: 400, y: 50 },
      style: {
        background: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        color: theme === 'dark' ? '#e5e5e5' : '#1a1a1a',
        border: `2px solid ${theme === 'dark' ? '#4a4a4a' : '#9ca3af'}`,
        borderRadius: '12px',
        width: 320,
        boxShadow: theme === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
      },
    });

    // Analysis chunks as nodes
    response.chunks.forEach((chunk, index) => {
      const angle = (index * 2 * Math.PI) / response.chunks.length;
      const radius = 300;
      const x = 550 + radius * Math.cos(angle);
      const y = 250 + radius * Math.sin(angle);

      nodes.push({
        id: `chunk-${chunk.id}`,
        data: { 
          label: (
            <div style={{ padding: '12px' }}>
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: '14px', 
                marginBottom: '8px',
                color: theme === 'dark' ? '#60a5fa' : '#000000'
              }}>
                {chunk.title}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: theme === 'dark' ? '#9ca3af' : '#000000',
                marginBottom: '8px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {chunk.analysis.substring(0, 90)}...
              </div>
              <div style={{ 
                fontSize: '12px', 
                fontWeight: '500',
                color: theme === 'dark' ? '#6b7280' : '#000000',
                marginTop: '8px',
                paddingTop: '8px',
                borderTop: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
              }}>
                {chunk.key_insights.length} key insights
              </div>
            </div>
          )
        },
        position: { x, y },
        style: {
          background: theme === 'dark' ? '#1e1e1e' : '#ffffff',
          color: theme === 'dark' ? '#e5e5e5' : '#1a1a1a',
          border: `2px solid ${theme === 'dark' ? '#3a3a3a' : '#e5e7eb'}`,
          borderRadius: '12px',
          width: 260,
          boxShadow: theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
        },
      });

      // Key insights as child nodes
      chunk.key_insights.forEach((insight, insightIndex) => {
        const childAngle = angle + ((insightIndex - (chunk.key_insights.length - 1) / 2) * 0.3);
        const childRadius = radius + 200;
        const childX = 550 + childRadius * Math.cos(childAngle);
        const childY = 250 + childRadius * Math.sin(childAngle);

        nodes.push({
          id: `insight-${chunk.id}-${insightIndex}`,
          data: { 
            label: (
              <div style={{ padding: '8px' }}>
                <div style={{ 
                  fontSize: '11px', 
                  lineHeight: '1.4',
                  color: theme === 'dark' ? '#d1d5db' : '#000000'
                }}>
                  {insight.substring(0, 70)}...
                </div>
              </div>
            )
          },
          position: { x: childX, y: childY },
          style: {
            background: theme === 'dark' ? '#2a2a2a' : '#f9fafb',
            color: theme === 'dark' ? '#d1d5db' : '#4b5563',
            border: `1px solid ${theme === 'dark' ? '#4a4a4a' : '#d1d5db'}`,
            borderRadius: '8px',
            width: 190,
            fontSize: '11px',
            boxShadow: theme === 'dark' ? '0 1px 4px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.05)',
          },
        });
      });
    });

    // Solution guide node
    nodes.push({
      id: 'solution',
      type: 'output',
      data: { 
        label: (
          <div style={{ padding: '16px' }}>
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '11px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              marginBottom: '8px',
              color: theme === 'dark' ? '#86efac' : '#000000'
            }}>
              Solution Guide
            </div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '500',
              color: theme === 'dark' ? '#86efac' : '#000000'
            }}>
              {response.synthesis.solution_guide.length} MVP Steps
            </div>
          </div>
        )
      },
      position: { x: 450, y: 700 },
      style: {
        background: theme === 'dark' ? '#1a2e1a' : '#dcfce7',
        color: theme === 'dark' ? '#86efac' : '#166534',
        border: `2px solid ${theme === 'dark' ? '#22c55e' : '#16a34a'}`,
        borderRadius: '12px',
        width: 220,
        boxShadow: theme === 'dark' ? '0 4px 12px rgba(34, 197, 94, 0.2)' : '0 4px 12px rgba(22, 163, 74, 0.2)',
      },
    });

    return nodes;
  }, [response, theme]);

  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];

    // Connect problem to all chunks
    response.chunks.forEach((chunk) => {
      edges.push({
        id: `problem-chunk-${chunk.id}`,
        source: 'problem',
        target: `chunk-${chunk.id}`,
        animated: true,
        style: { 
          stroke: theme === 'dark' ? '#4a4a4a' : '#9ca3af',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: theme === 'dark' ? '#4a4a4a' : '#9ca3af',
        },
      });

      // Connect chunks to their insights
      chunk.key_insights.forEach((_, insightIndex) => {
        edges.push({
          id: `chunk-${chunk.id}-insight-${insightIndex}`,
          source: `chunk-${chunk.id}`,
          target: `insight-${chunk.id}-${insightIndex}`,
          style: { 
            stroke: theme === 'dark' ? '#3a3a3a' : '#e5e7eb',
            strokeWidth: 1.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: theme === 'dark' ? '#3a3a3a' : '#e5e7eb',
          },
        });
      });

      // Connect chunks to solution
      edges.push({
        id: `chunk-${chunk.id}-solution`,
        source: `chunk-${chunk.id}`,
        target: 'solution',
        animated: true,
        style: { 
          stroke: theme === 'dark' ? '#22c55e' : '#16a34a',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: theme === 'dark' ? '#22c55e' : '#16a34a',
        },
      });
    });

    return edges;
  }, [response, theme]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when theme changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div 
      className="w-full h-[700px] rounded-xl overflow-hidden border border-gray-300 dark:border-white/20 shadow-lg"
      style={{ 
        background: theme === 'dark' ? '#0a0a0a' : '#ffffff' 
      }}
    >
      <style>{`
        /* Canvas Background */
        .react-flow__pane {
          background: ${theme === 'dark' ? '#0a0a0a' : '#ffffff'} !important;
        }
        
        /* Viewport/Canvas Wrapper */
        .react-flow__viewport {
          background: ${theme === 'dark' ? '#0a0a0a' : '#ffffff'} !important;
        }
        
        /* Node Styling */
        .react-flow__node {
          background: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'} !important;
          color: ${theme === 'dark' ? '#e5e5e5' : '#1a1a1a'} !important;
        }
        
        /* Edge Styling */
        .react-flow__edge-path {
          stroke: ${theme === 'dark' ? '#4a4a4a' : '#9ca3af'} !important;
        }
        
        /* Controls */
        .react-flow__controls {
          background: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'} !important;
          border: 1px solid ${theme === 'dark' ? '#4a4a4a' : '#d1d5db'} !important;
          border-radius: 8px !important;
          box-shadow: ${theme === 'dark' ? '0 4px 6px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.1)'} !important;
        }
        .react-flow__controls button {
          background: ${theme === 'dark' ? '#2a2a2a' : '#ffffff'} !important;
          border-bottom: 1px solid ${theme === 'dark' ? '#4a4a4a' : '#d1d5db'} !important;
          color: ${theme === 'dark' ? '#e5e5e5' : '#374151'} !important;
          transition: background 0.2s ease !important;
        }
        .react-flow__controls button:hover {
          background: ${theme === 'dark' ? '#3a3a3a' : '#f3f4f6'} !important;
        }
        .react-flow__controls button:last-child {
          border-bottom: none !important;
        }
        .react-flow__controls button path {
          fill: ${theme === 'dark' ? '#e5e5e5' : '#374151'} !important;
        }
        .react-flow__controls button svg {
          fill: ${theme === 'dark' ? '#e5e5e5' : '#374151'} !important;
        }
        
        /* MiniMap */
        .react-flow__minimap {
          background: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'} !important;
          border: 1px solid ${theme === 'dark' ? '#4a4a4a' : '#d1d5db'} !important;
          border-radius: 8px !important;
          box-shadow: ${theme === 'dark' ? '0 4px 6px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.1)'} !important;
        }
        .react-flow__minimap-mask {
          fill: ${theme === 'dark' ? 'rgba(26, 26, 26, 0.6)' : 'rgba(255, 255, 255, 0.6)'} !important;
        }
        .react-flow__minimap-node {
          fill: ${theme === 'dark' ? '#2a2a2a' : '#f9fafb'} !important;
          stroke: ${theme === 'dark' ? '#4a4a4a' : '#d1d5db'} !important;
        }
        
        /* Selection Box */
        .react-flow__selection {
          background: ${theme === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(37, 99, 235, 0.1)'} !important;
          border: 1px solid ${theme === 'dark' ? '#60a5fa' : '#2563eb'} !important;
        }
        
        /* Node Selection */
        .react-flow__node.selected {
          box-shadow: ${theme === 'dark' ? '0 0 0 2px #60a5fa' : '0 0 0 2px #2563eb'} !important;
        }
        
        /* Edge Selection */
        .react-flow__edge.selected .react-flow__edge-path {
          stroke: ${theme === 'dark' ? '#60a5fa' : '#2563eb'} !important;
        }
        
        /* Hide Attribution */
        .react-flow__attribution {
          display: none !important;
        }
        
        /* Background Pattern */
        .react-flow__background {
          background-color: ${theme === 'dark' ? '#0a0a0a' : '#ffffff'} !important;
        }
      `}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
        minZoom={0.3}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        attributionPosition="bottom-left"
        panOnScroll
        zoomOnScroll
        zoomOnPinch
        panOnDrag
      >
        <Controls 
          showZoom
          showFitView
          showInteractive
          position="bottom-right"
        />
        <MiniMap 
          nodeColor={(node) => {
            if (node.id === 'problem') return theme === 'dark' ? '#1a1a1a' : '#f9fafb';
            if (node.id === 'solution') return theme === 'dark' ? '#1a2e1a' : '#dcfce7';
            if (node.id.startsWith('chunk-')) return theme === 'dark' ? '#1e1e1e' : '#ffffff';
            return theme === 'dark' ? '#2a2a2a' : '#f3f4f6';
          }}
          maskColor={theme === 'dark' ? 'rgba(10, 10, 10, 0.8)' : 'rgba(249, 250, 251, 0.8)'}
          position="bottom-left"
          zoomable
          pannable
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={16} 
          size={1}
          color={theme === 'dark' ? '#333' : '#e5e7eb'}
        />
      </ReactFlow>
    </div>
  );
};

export default AnalysisVisualizer;
