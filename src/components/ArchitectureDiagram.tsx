import React from 'react';

export interface ArchNode {
  id: string
  label: string    // ex: "Flutter App"
  tech: string     // ex: "Dart · TFLite"
  x: number        // position en %
  y: number        // position en %
}

export interface ArchEdge {
  from: string
  to: string
  label?: string   // ex: "HTTP/JSON"
}

interface Props {
  nodes: ArchNode[]
  edges: ArchEdge[]
}

const ArchitectureDiagram = ({ nodes, edges }: Props) => (
  <div className="relative w-full overflow-x-auto">
    <svg
      viewBox="0 0 800 300"
      width="100%"
      className="min-w-[400px]"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Définir la flèche */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon
            points="0 0, 8 3, 0 6"
            fill="#2DD4BF"
          />
        </marker>
      </defs>

      {/* Arêtes */}
      {edges.map((edge, i) => {
        const from = nodes.find(n => n.id === edge.from)
        const to = nodes.find(n => n.id === edge.to)
        if (!from || !to) return null

        const x1 = (from.x / 100) * 800
        const y1 = (from.y / 100) * 300
        const x2 = (to.x / 100) * 800
        const y2 = (to.y / 100) * 300
        const mx = (x1 + x2) / 2
        const my = (y1 + y2) / 2

        return (
          <g key={i}>
            <line
              x1={x1} y1={y1}
              x2={x2} y2={y2}
              stroke="#2DD4BF"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              markerEnd="url(#arrowhead)"
            />
            {edge.label && (
              <text
                x={mx} y={my - 6}
                fill="#8B94A3"
                fontSize="10"
                textAnchor="middle"
                fontFamily="JetBrains Mono"
              >
                {edge.label}
              </text>
            )}
          </g>
        )
      })}

      {/* Nœuds */}
      {nodes.map(node => {
        const cx = (node.x / 100) * 800
        const cy = (node.y / 100) * 300

        return (
          <g key={node.id}>
            <rect
              x={cx - 70} y={cy - 25}
              width={140} height={50}
              rx={8}
              fill="#141B22"
              stroke="#2DD4BF"
              strokeWidth="1"
            />
            <text
              x={cx} y={cy - 5}
              fill="#EDEFF2"
              fontSize="12"
              textAnchor="middle"
              fontFamily="Space Grotesk"
              fontWeight="600"
            >
              {node.label}
            </text>
            <text
              x={cx} y={cy + 12}
              fill="#8B94A3"
              fontSize="9"
              textAnchor="middle"
              fontFamily="JetBrains Mono"
            >
              {node.tech}
            </text>
          </g>
        )
      })}
    </svg>
  </div>
)

export default ArchitectureDiagram;
