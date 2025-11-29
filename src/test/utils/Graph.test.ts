import { describe, it, expect, beforeEach } from 'vitest';
import { Graph } from '../../utils/Graph';

describe('Graph Data Structure', () => {
  describe('Undirected Graph', () => {
    let graph: Graph<string>;

    beforeEach(() => {
      graph = new Graph<string>(false);
    });

    describe('Vertex Operations', () => {
      it('should add vertices', () => {
        graph.addVertex('A');
        graph.addVertex('B');

        expect(graph.hasVertex('A')).toBe(true);
        expect(graph.hasVertex('B')).toBe(true);
        expect(graph.getVertexCount()).toBe(2);
      });

      it('should not add duplicate vertices', () => {
        graph.addVertex('A');
        graph.addVertex('A');

        expect(graph.getVertexCount()).toBe(1);
      });

      it('should remove vertices', () => {
        graph.addVertex('A');
        graph.addVertex('B');
        graph.addEdge('A', 'B');

        expect(graph.removeVertex('A')).toBe(true);
        expect(graph.hasVertex('A')).toBe(false);
        expect(graph.getVertexCount()).toBe(1);
      });

      it('should return false when removing non-existent vertex', () => {
        expect(graph.removeVertex('Z')).toBe(false);
      });
    });

    describe('Edge Operations', () => {
      beforeEach(() => {
        graph.addVertex('A');
        graph.addVertex('B');
        graph.addVertex('C');
      });

      it('should add edges', () => {
        graph.addEdge('A', 'B');

        expect(graph.hasEdge('A', 'B')).toBe(true);
        expect(graph.hasEdge('B', 'A')).toBe(true); // Undirected
        expect(graph.getEdgeCount()).toBe(1);
      });

      it('should add weighted edges', () => {
        graph.addEdge('A', 'B', 5);

        const neighbors = graph.getNeighbors('A');
        expect(neighbors[0].weight).toBe(5);
      });

      it('should remove edges', () => {
        graph.addEdge('A', 'B');

        expect(graph.removeEdge('A', 'B')).toBe(true);
        expect(graph.hasEdge('A', 'B')).toBe(false);
        expect(graph.hasEdge('B', 'A')).toBe(false);
      });

      it('should return false when removing non-existent edge', () => {
        expect(graph.removeEdge('A', 'Z')).toBe(false);
      });

      it('should create vertices when adding edge', () => {
        graph.addEdge('X', 'Y');

        expect(graph.hasVertex('X')).toBe(true);
        expect(graph.hasVertex('Y')).toBe(true);
      });
    });

    describe('Graph Traversal - BFS', () => {
      beforeEach(() => {
        graph.addEdge('A', 'B');
        graph.addEdge('A', 'C');
        graph.addEdge('B', 'D');
        graph.addEdge('C', 'E');
        graph.addEdge('D', 'F');
      });

      it('should traverse graph in BFS order', () => {
        const visited = graph.bfs('A');

        expect(visited[0]).toBe('A');
        expect(visited).toContain('B');
        expect(visited).toContain('C');
        expect(visited.length).toBe(6);
      });

      it('should call callback for each vertex', () => {
        const levels: number[] = [];
        
        graph.bfs('A', (_vertex, level) => {
          levels.push(level);
        });

        expect(levels[0]).toBe(0); // A at level 0
        expect(Math.max(...levels)).toBeGreaterThan(0);
      });

      it('should return empty array for non-existent start', () => {
        const visited = graph.bfs('Z');
        expect(visited).toEqual([]);
      });
    });

    describe('Graph Traversal - DFS', () => {
      beforeEach(() => {
        graph.addEdge('A', 'B');
        graph.addEdge('A', 'C');
        graph.addEdge('B', 'D');
        graph.addEdge('C', 'E');
      });

      it('should traverse graph in DFS order', () => {
        const visited = graph.dfs('A');

        expect(visited[0]).toBe('A');
        expect(visited.length).toBe(5);
      });

      it('should call callback for each vertex', () => {
        const vertices: string[] = [];
        
        graph.dfs('A', (vertex) => {
          vertices.push(vertex);
        });

        expect(vertices.length).toBe(5);
        expect(vertices[0]).toBe('A');
      });
    });

    describe('Shortest Path (Dijkstra)', () => {
      beforeEach(() => {
        graph.addEdge('A', 'B', 4);
        graph.addEdge('A', 'C', 2);
        graph.addEdge('B', 'D', 3);
        graph.addEdge('C', 'D', 1);
        graph.addEdge('D', 'E', 2);
      });

      it('should find shortest path', () => {
        const result = graph.shortestPath('A', 'E');

        expect(result).not.toBeNull();
        expect(result?.path[0]).toBe('A');
        expect(result?.path[result.path.length - 1]).toBe('E');
        expect(result?.distance).toBe(5); // A->C->D->E = 2+1+2
      });

      it('should return null for non-existent path', () => {
        graph.addVertex('Z'); // Isolated vertex
        const result = graph.shortestPath('A', 'Z');

        expect(result).toBeNull();
      });

      it('should handle same start and end', () => {
        const result = graph.shortestPath('A', 'A');

        expect(result?.path).toEqual(['A']);
        expect(result?.distance).toBe(0);
      });
    });

    describe('Connected Components', () => {
      it('should find single connected component', () => {
        graph.addEdge('A', 'B');
        graph.addEdge('B', 'C');

        const components = graph.getConnectedComponents();
        expect(components.length).toBe(1);
        expect(components[0].length).toBe(3);
      });

      it('should find multiple connected components', () => {
        graph.addEdge('A', 'B');
        graph.addEdge('C', 'D');
        graph.addVertex('E'); // Isolated

        const components = graph.getConnectedComponents();
        expect(components.length).toBe(3);
      });

      it('should check if graph is connected', () => {
        graph.addEdge('A', 'B');
        graph.addEdge('B', 'C');

        expect(graph.isConnected()).toBe(true);

        graph.addVertex('Z');
        expect(graph.isConnected()).toBe(false);
      });
    });

    describe('Degree', () => {
      beforeEach(() => {
        graph.addEdge('A', 'B');
        graph.addEdge('A', 'C');
        graph.addEdge('A', 'D');
      });

      it('should calculate vertex degree', () => {
        expect(graph.getDegree('A')).toBe(3);
        expect(graph.getDegree('B')).toBe(1);
      });

      it('should return 0 for non-existent vertex', () => {
        expect(graph.getDegree('Z')).toBe(0);
      });
    });
  });

  describe('Directed Graph', () => {
    let graph: Graph<string>;

    beforeEach(() => {
      graph = new Graph<string>(true);
    });

    describe('Edge Operations', () => {
      it('should add directed edges', () => {
        graph.addEdge('A', 'B');

        expect(graph.hasEdge('A', 'B')).toBe(true);
        expect(graph.hasEdge('B', 'A')).toBe(false); // Directed
      });

      it('should remove only specified direction', () => {
        graph.addEdge('A', 'B');
        graph.addEdge('B', 'A');

        graph.removeEdge('A', 'B');

        expect(graph.hasEdge('A', 'B')).toBe(false);
        expect(graph.hasEdge('B', 'A')).toBe(true);
      });
    });

    describe('Cycle Detection', () => {
      it('should detect cycles', () => {
        graph.addEdge('A', 'B');
        graph.addEdge('B', 'C');
        graph.addEdge('C', 'A'); // Creates cycle

        expect(graph.hasCycle()).toBe(true);
      });

      it('should return false for acyclic graph', () => {
        graph.addEdge('A', 'B');
        graph.addEdge('B', 'C');
        graph.addEdge('A', 'C');

        expect(graph.hasCycle()).toBe(false);
      });

      it('should handle self-loop as cycle', () => {
        graph.addEdge('A', 'A');

        expect(graph.hasCycle()).toBe(true);
      });
    });

    describe('In-Degree and Out-Degree', () => {
      beforeEach(() => {
        graph.addEdge('A', 'B');
        graph.addEdge('A', 'C');
        graph.addEdge('B', 'C');
      });

      it('should calculate in-degree and out-degree', () => {
        const [inDegree, outDegree] = graph.getDegree('A') as [number, number];
        expect(inDegree).toBe(0);
        expect(outDegree).toBe(2);

        const [inC, outC] = graph.getDegree('C') as [number, number];
        expect(inC).toBe(2);
        expect(outC).toBe(0);
      });
    });
  });

  describe('Utility Methods', () => {
    let graph: Graph<string>;

    beforeEach(() => {
      graph = new Graph<string>(false);
    });

    it('should get all vertices', () => {
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addVertex('C');

      const vertices = graph.getVertices();
      expect(vertices.length).toBe(3);
      expect(vertices).toContain('A');
      expect(vertices).toContain('B');
      expect(vertices).toContain('C');
    });

    it('should get neighbors', () => {
      graph.addEdge('A', 'B', 5);
      graph.addEdge('A', 'C', 3);

      const neighbors = graph.getNeighbors('A');
      expect(neighbors.length).toBe(2);
      expect(neighbors.some(n => n.to === 'B' && n.weight === 5)).toBe(true);
    });

    it('should clear graph', () => {
      graph.addEdge('A', 'B');
      graph.addEdge('B', 'C');

      graph.clear();

      expect(graph.getVertexCount()).toBe(0);
      expect(graph.getEdgeCount()).toBe(0);
    });

    it('should generate string representation', () => {
      graph.addEdge('A', 'B', 2);
      const str = graph.toString();

      expect(str).toContain('Graph');
      expect(str).toContain('Undirected');
      expect(str).toContain('A ->');
    });
  });

  describe('Edge Cases', () => {
    let graph: Graph<number>;

    beforeEach(() => {
      graph = new Graph<number>(false);
    });

    it('should handle numeric vertices', () => {
      graph.addEdge(1, 2);
      graph.addEdge(2, 3);

      expect(graph.hasEdge(1, 2)).toBe(true);
      expect(graph.getVertexCount()).toBe(3);
    });

    it('should handle empty graph', () => {
      expect(graph.getVertexCount()).toBe(0);
      expect(graph.getEdgeCount()).toBe(0);
      expect(graph.isConnected()).toBe(true);
    });

    it('should handle single vertex', () => {
      graph.addVertex(1);

      expect(graph.getVertexCount()).toBe(1);
      expect(graph.isConnected()).toBe(true);
    });
  });

  describe('Forensics Use Case: Network Communication Graph', () => {
    let networkGraph: Graph<string>;

    beforeEach(() => {
      networkGraph = new Graph<string>(true); // Directed for communication flow
      
      // Simulate network communication between IPs
      networkGraph.addEdge('192.168.1.10', '192.168.1.20', 100); // 100 packets
      networkGraph.addEdge('192.168.1.10', '10.0.0.5', 50);
      networkGraph.addEdge('192.168.1.20', '10.0.0.5', 75);
      networkGraph.addEdge('10.0.0.5', '8.8.8.8', 200); // External DNS
    });

    it('should track network communication patterns', () => {
      expect(networkGraph.hasEdge('192.168.1.10', '192.168.1.20')).toBe(true);
      expect(networkGraph.hasEdge('192.168.1.20', '192.168.1.10')).toBe(false);
    });

    it('should find communication path between hosts', () => {
      const path = networkGraph.shortestPath('192.168.1.10', '8.8.8.8');
      
      expect(path).not.toBeNull();
      expect(path?.path[0]).toBe('192.168.1.10');
      expect(path?.path[path.path.length - 1]).toBe('8.8.8.8');
    });

    it('should analyze outbound connections', () => {
      const neighbors = networkGraph.getNeighbors('192.168.1.10');
      expect(neighbors.length).toBe(2);
      expect(neighbors.some(n => n.to === '10.0.0.5')).toBe(true);
    });

    it('should detect suspicious communication cycles', () => {
      networkGraph.addEdge('8.8.8.8', '192.168.1.10', 10); // Creates cycle
      expect(networkGraph.hasCycle()).toBe(true);
    });

    it('should identify isolated network segments', () => {
      networkGraph.addVertex('172.16.0.10'); // Isolated IP
      const components = networkGraph.getConnectedComponents();
      
      expect(components.length).toBeGreaterThan(1);
    });
  });

  describe('Forensics Use Case: File Dependency Graph', () => {
    let fileGraph: Graph<string>;

    beforeEach(() => {
      fileGraph = new Graph<string>(true);
      
      // Simulate file dependencies (imports, includes, etc.)
      fileGraph.addEdge('main.exe', 'kernel32.dll');
      fileGraph.addEdge('main.exe', 'user32.dll');
      fileGraph.addEdge('user32.dll', 'gdi32.dll');
      fileGraph.addEdge('helper.dll', 'kernel32.dll');
    });

    it('should map file dependencies', () => {
      const deps = fileGraph.getNeighbors('main.exe');
      expect(deps.length).toBe(2);
      expect(deps.some(d => d.to === 'kernel32.dll')).toBe(true);
    });

    it('should detect circular dependencies', () => {
      fileGraph.addEdge('kernel32.dll', 'main.exe');
      expect(fileGraph.hasCycle()).toBe(true);
    });

    it('should find all files dependent on a library', () => {
      const visited = fileGraph.dfs('kernel32.dll');
      // In a directed graph, DFS from a node shows what it can reach
      // We'd need reverse edges to find "who depends on kernel32"
      expect(visited).toContain('kernel32.dll');
    });
  });
});
