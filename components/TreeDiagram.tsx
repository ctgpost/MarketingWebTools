
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TreeData } from '../types';

interface Props {
  data: TreeData;
}

const TreeDiagram: React.FC<Props> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 90, bottom: 20, left: 90 };

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const treeLayout = d3.tree<TreeData>().size([height - margin.top - margin.bottom, width - margin.left - margin.right]);
    const root = d3.hierarchy(data);
    treeLayout(root);

    // Links
    svg.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal<any, any>()
        .x(d => d.y)
        .y(d => d.x));

    // Nodes
    const node = svg.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("circle")
      .attr("r", 6);

    node.append("text")
      .attr("dy", ".35em")
      .attr("x", d => d.children ? -13 : 13)
      .style("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name)
      .attr("fill", "#1f2937");

  }, [data]);

  return (
    <div className="overflow-x-auto bg-white p-6 rounded-xl shadow-lg border border-pink-100">
      <h3 className="text-xl font-bold text-pink-700 mb-6 text-center">মার্কেটিং স্ট্রাটেজি ট্রি-ডায়াগ্রাম</h3>
      <div className="min-w-[800px]">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
};

export default TreeDiagram;
