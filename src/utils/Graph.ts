/**
 * Graph Data Structure with common algorithms
 * 
 * Use cases in Digital Forensics:
 * - Network topology analysis
 * - Call graph analysis (who communicated with whom)
 * - File system dependency graphs
 * - Malware propagation tracking
 * - Social network analysis
 * - Timeline relationship mapping
 * 
 * Supports:
 * - Directed and undirected graphs
 * - Weighted and unweighted edges
 * - BFS (Breadth-First Search)
 * - DFS (Depth-First Search)
 * - Shortest path (Dijkstra's algorithm)
 * - Cycle detection
 * - Connected components
 */

export interface Edge<T> {
  to: T;
  weight: number;
}

export class Graph<T = string> {
  private adjacencyList: Map<T, Edge<T>[]>;
  private isDirected: boolean;
  private vertexCount: number;
  private edgeCount: number;

  constructor(isDirected: boolean = false) {
    this.adjacencyList = new Map();
    this.isDirected = isDirected;
    this.vertexCount = 0;
    this.edgeCount = 0;
  }

  /**
   * Add a vertex to the graph
   * @param vertex - The vertex to add
   */
  addVertex(vertex: T): void {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
      this.vertexCount++;
    }
  }

  /**
   * Add an edge between two vertices
   * @param from - Source vertex
   * @param to - Destination vertex
   * @param weight - Edge weight (default: 1)
   */
  addEdge(from: T, to: T, weight: number = 1): void {
    // Ensure both vertices exist
    this.addVertex(from);
    this.addVertex(to);

    // Add edge from -> to
    const fromEdges = this.adjacencyList.get(from)!;
    
    // Check if edge already exists
    const existingEdge = fromEdges.find(e => e.to === to);
    if (!existingEdge) {
      fromEdges.push({ to, weight });
      this.edgeCount++;
    } else {
      // Update weight if edge exists
      existingEdge.weight = weight;
    }

    // For undirected graphs, add reverse edge
    if (!this.isDirected) {
      const toEdges = this.adjacencyList.get(to)!;
      const existingReverseEdge = toEdges.find(e => e.to === from);
      if (!existingReverseEdge) {
        toEdges.push({ to: from, weight });
      } else {
        existingReverseEdge.weight = weight;
      }
    }
  }

  /**
   * Remove a vertex and all its edges
   * @param vertex - The vertex to remove
   * @returns true if removed, false if vertex didn't exist
   */
  removeVertex(vertex: T): boolean {
    if (!this.adjacencyList.has(vertex)) {
      return false;
    }

    // Remove all edges to this vertex
    for (const [, edges] of this.adjacencyList) {
      const index = edges.findIndex(e => e.to === vertex);
      if (index !== -1) {
        edges.splice(index, 1);
        this.edgeCount--;
      }
    }

    // Remove the vertex itself
    const edgeCount = this.adjacencyList.get(vertex)!.length;
    this.edgeCount -= edgeCount;
    this.adjacencyList.delete(vertex);
    this.vertexCount--;

    return true;
  }

  /**
   * Remove an edge between two vertices
   * @param from - Source vertex
   * @param to - Destination vertex
   * @returns true if removed, false if edge didn't exist
   */
  removeEdge(from: T, to: T): boolean {
    const fromEdges = this.adjacencyList.get(from);
    if (!fromEdges) {
      return false;
    }

    const index = fromEdges.findIndex(e => e.to === to);
    if (index === -1) {
      return false;
    }

    fromEdges.splice(index, 1);
    this.edgeCount--;

    // For undirected graphs, remove reverse edge
    if (!this.isDirected) {
      const toEdges = this.adjacencyList.get(to);
      if (toEdges) {
        const reverseIndex = toEdges.findIndex(e => e.to === from);
        if (reverseIndex !== -1) {
          toEdges.splice(reverseIndex, 1);
        }
      }
    }

    return true;
  }

  /**
   * Get all neighbors of a vertex
   * @param vertex - The vertex
   * @returns Array of edges (neighbors with weights)
   */
  getNeighbors(vertex: T): Edge<T>[] {
    return this.adjacencyList.get(vertex) || [];
  }

  /**
   * Get all vertices in the graph
   */
  getVertices(): T[] {
    return Array.from(this.adjacencyList.keys());
  }

  /**
   * Get number of vertices
   */
  getVertexCount(): number {
    return this.vertexCount;
  }

  /**
   * Get number of edges
   */
  getEdgeCount(): number {
    return this.edgeCount;
  }

  /**
   * Check if vertex exists
   */
  hasVertex(vertex: T): boolean {
    return this.adjacencyList.has(vertex);
  }

  /**
   * Check if edge exists
   */
  hasEdge(from: T, to: T): boolean {
    const edges = this.adjacencyList.get(from);
    return edges ? edges.some(e => e.to === to) : false;
  }

  /**
   * Breadth-First Search (BFS)
   * @param start - Starting vertex
   * @param callback - Function to call for each visited vertex
   */
  bfs(start: T, callback?: (vertex: T, level: number) => void): T[] {
    if (!this.adjacencyList.has(start)) {
      return [];
    }

    const visited = new Set<T>();
    const queue: Array<{ vertex: T; level: number }> = [{ vertex: start, level: 0 }];
    const result: T[] = [];

    while (queue.length > 0) {
      const { vertex, level } = queue.shift()!;

      if (visited.has(vertex)) {
        continue;
      }

      visited.add(vertex);
      result.push(vertex);

      if (callback) {
        callback(vertex, level);
      }

      const neighbors = this.getNeighbors(vertex);
      for (const edge of neighbors) {
        if (!visited.has(edge.to)) {
          queue.push({ vertex: edge.to, level: level + 1 });
        }
      }
    }

    return result;
  }

  /**
   * Depth-First Search (DFS)
   * @param start - Starting vertex
   * @param callback - Function to call for each visited vertex
   */
  dfs(start: T, callback?: (vertex: T) => void): T[] {
    if (!this.adjacencyList.has(start)) {
      return [];
    }

    const visited = new Set<T>();
    const result: T[] = [];

    const dfsHelper = (vertex: T) => {
      visited.add(vertex);
      result.push(vertex);

      if (callback) {
        callback(vertex);
      }

      const neighbors = this.getNeighbors(vertex);
      for (const edge of neighbors) {
        if (!visited.has(edge.to)) {
          dfsHelper(edge.to);
        }
      }
    };

    dfsHelper(start);
    return result;
  }

  /**
   * Find shortest path using Dijkstra's algorithm
   * @param start - Starting vertex
   * @param end - Ending vertex
   * @returns Object with path and distance, or null if no path exists
   */
  shortestPath(
    start: T,
    end: T
  ): { path: T[]; distance: number } | null {
    if (!this.adjacencyList.has(start) || !this.adjacencyList.has(end)) {
      return null;
    }

    const distances = new Map<T, number>();
    const previous = new Map<T, T | null>();
    const unvisited = new Set<T>();

    // Initialize distances
    for (const vertex of this.adjacencyList.keys()) {
      distances.set(vertex, vertex === start ? 0 : Infinity);
      previous.set(vertex, null);
      unvisited.add(vertex);
    }

    while (unvisited.size > 0) {
      // Find vertex with minimum distance
      let minVertex: T | null = null;
      let minDistance = Infinity;

      for (const vertex of unvisited) {
        const distance = distances.get(vertex)!;
        if (distance < minDistance) {
          minDistance = distance;
          minVertex = vertex;
        }
      }

      if (minVertex === null || minDistance === Infinity) {
        break; // No path exists
      }

      unvisited.delete(minVertex);

      if (minVertex === end) {
        break; // Found shortest path to end
      }

      // Update distances to neighbors
      const neighbors = this.getNeighbors(minVertex);
      for (const edge of neighbors) {
        if (unvisited.has(edge.to)) {
          const newDistance = distances.get(minVertex)! + edge.weight;
          if (newDistance < distances.get(edge.to)!) {
            distances.set(edge.to, newDistance);
            previous.set(edge.to, minVertex);
          }
        }
      }
    }

    // Reconstruct path
    const path: T[] = [];
    let current: T | null = end;

    while (current !== null) {
      path.unshift(current);
      current = previous.get(current) ?? null;
    }

    if (path[0] !== start) {
      return null; // No path exists
    }

    return {
      path,
      distance: distances.get(end)!,
    };
  }

  /**
   * Detect if graph has a cycle
   * @returns true if cycle exists, false otherwise
   */
  hasCycle(): boolean {
    const visited = new Set<T>();
    const recursionStack = new Set<T>();

    const hasCycleHelper = (vertex: T): boolean => {
      visited.add(vertex);
      recursionStack.add(vertex);

      const neighbors = this.getNeighbors(vertex);
      for (const edge of neighbors) {
        if (!visited.has(edge.to)) {
          if (hasCycleHelper(edge.to)) {
            return true;
          }
        } else if (recursionStack.has(edge.to)) {
          return true;
        }
      }

      recursionStack.delete(vertex);
      return false;
    };

    for (const vertex of this.adjacencyList.keys()) {
      if (!visited.has(vertex)) {
        if (hasCycleHelper(vertex)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Find all connected components (for undirected graphs)
   * @returns Array of arrays, where each inner array is a connected component
   */
  getConnectedComponents(): T[][] {
    const visited = new Set<T>();
    const components: T[][] = [];

    for (const vertex of this.adjacencyList.keys()) {
      if (!visited.has(vertex)) {
        const component: T[] = [];
        
        // BFS to find all vertices in this component
        const queue: T[] = [vertex];
        while (queue.length > 0) {
          const current = queue.shift()!;
          
          if (visited.has(current)) {
            continue;
          }

          visited.add(current);
          component.push(current);

          const neighbors = this.getNeighbors(current);
          for (const edge of neighbors) {
            if (!visited.has(edge.to)) {
              queue.push(edge.to);
            }
          }
        }

        components.push(component);
      }
    }

    return components;
  }

  /**
   * Check if graph is connected (all vertices reachable from any vertex)
   */
  isConnected(): boolean {
    if (this.vertexCount === 0) {
      return true;
    }

    const vertices = this.getVertices();
    const visited = this.bfs(vertices[0]);

    return visited.length === this.vertexCount;
  }

  /**
   * Get the degree of a vertex
   * For directed graphs: returns [inDegree, outDegree]
   * For undirected graphs: returns degree
   */
  getDegree(vertex: T): number | [number, number] {
    if (!this.adjacencyList.has(vertex)) {
      return this.isDirected ? [0, 0] : 0;
    }

    const outDegree = this.adjacencyList.get(vertex)!.length;

    if (!this.isDirected) {
      return outDegree;
    }

    // Calculate in-degree for directed graphs
    let inDegree = 0;
    for (const [, edges] of this.adjacencyList) {
      if (edges.some(e => e.to === vertex)) {
        inDegree++;
      }
    }

    return [inDegree, outDegree];
  }

  /**
   * Clear the entire graph
   */
  clear(): void {
    this.adjacencyList.clear();
    this.vertexCount = 0;
    this.edgeCount = 0;
  }

  /**
   * Get a string representation of the graph
   */
  toString(): string {
    let result = `Graph (${this.isDirected ? 'Directed' : 'Undirected'})\n`;
    result += `Vertices: ${this.vertexCount}, Edges: ${this.edgeCount}\n\n`;

    for (const [vertex, edges] of this.adjacencyList) {
      result += `${vertex} -> `;
      result += edges.map(e => `${e.to}(${e.weight})`).join(', ');
      result += '\n';
    }

    return result;
  }
}

export default Graph;
