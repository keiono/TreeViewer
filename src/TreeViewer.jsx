import React, {Component, PropTypes} from 'react'

import * as d3Hierarchy from 'd3-hierarchy'
import * as d3Trans from 'd3-transition'
import * as d3Select from 'd3-selection'
import * as d3Zoom from 'd3-zoom'
import * as d3Drag from 'd3-drag'


import Link from './Link'
import Node from './Node'


// Presets (constants)

// For SVG scaling
const MIN_SCALE = 0.2
const MAX_SCALE = 20.0
const ZOOM_STEP = .01
const UP = 1
const DOWN = -1
const DEF_SCALE = 1.0


/**
 *
 * Simple tree data renderer for D3.js style tree data.
 *
 */
class TreeViewer extends Component {

  constructor(props) {
    super(props);


    this.state = {
      scale: DEF_SCALE,
      x: 0,
      y: 0,
      xLast: null,
      yLast: null
    }
  }


  layoutTree = () => {
    const {data, style} = this.props
    const width = style.width
    const height = style.height

    // Create D3 instance of the tree
    const cluster = d3Hierarchy.cluster()
      .size([height, width]);

    cluster.nodeSize([40, 260])
    const root = d3Hierarchy.hierarchy(data, d => (d.children));

    cluster(root)
    this.setState({
      root: root,
      cluster: cluster,
      y: height/2.0
    })

  }
  /**
   * Pre-render tree using D3
   */
  componentWillMount() {
    this.layoutTree()
  }

  componentWillReceiveProps(nextProps) {
    // this.layoutTree()
  }


  render() {

    console.log('************* 222 TREE RENDERING )))))))))))))))))))))))))))))')

    const links = this.getLinks(this.state.root);
    const nodes = this.getNodes(this.state.root);

    const areaStyle = {
      fill: 'none',
      pointerEvents: 'all'
    }

    return (
      <svg
        width={this.props.style.width}
        height={this.props.style.height}
      >
        <defs>
          <marker
            id="type1"
            markerUnits="strokeWidth"
            markerWidth="12"
            markerHeight="12"
            viewBox="0 0 10 10"
            refX="12"
            refY="5"
            orient="auto">

            <polygon
              points="0,0 5,5 0,10 10,5"
              id="arrow1"
              fill="#888888"
            />
          </marker>
        </defs>
        <rect
          width={this.props.style.width}
          height={this.props.style.height}
          style={areaStyle}
        >
        </rect>


        <g id="root"
        >
            {links}
            {nodes}
        </g>
      </svg>
    )
  }



  getNodes(node) {

    const children = node.children;
    let nodes = [];

    const rootStyle = {
      fill: 'white',
      stroke: '#888888',
      strokeOpacity: 1,
      strokeWidth: 2
    }


    if(children === undefined) {
      return [];
    } else {
      if(node === this.state.root) {
        nodes.push(
          <Node
            node={node}
            nodeSize="15"
            fontSize='1.2em'
            label={this.props.label}
            shapeStyle={rootStyle}
          />);
      }

      children.forEach(childNode => {
        nodes.push(
          <Node
            node={childNode}
            nodeSize={this.getSize(childNode)}
            fontSize='1em'
            label={this.props.label}
            shapeStyle={this.getShapeStyle(childNode)}
          />);
        nodes = nodes.concat(this.getNodes(childNode));
      });

      return nodes;
    }
  }

  getSize = (node) => {

    const score = node.data.score

    if(score >= 1) {
      return 10
    }

    return score * 50

  }


  getLinks(node) {
    const children = node.children;
    let links = [];

    if(children === undefined) {
      return [];
    } else {
      children.forEach(childNode => {
        links.push(
          <Link
            node={childNode}
            style={this.getLinkStyle(childNode)}
          />)
        links = links.concat(this.getLinks(childNode));
      });

      return links;
    }
  }


  // This should be an injectable function
  getShapeStyle = node => {


    const namespace = node.data.namespace

    const style = {
      fill: '#aaaaaa'
    }

    if(namespace === 'biological_process') {
      style.fill = '#4393C3'
    } else if (namespace === 'cellular_component') {
      style.fill = '#F57C00'
    }

    return style
  }

  getLinkStyle = childNode => {

    const data = childNode.data
    const namespace = data.namespace

    const defStyle = {
      fill: 'none',
      stroke: '#aaaaaa',
      strokeOpacity: 0.8,
      strokeWidth: '0.1em'
    }

    if(namespace === undefined || namespace === '') {
      return defStyle
    } else if(namespace === 'biological_process') {
      defStyle.stroke = '#4393C3'
    } else if (namespace === 'cellular_component') {
      defStyle.stroke = '#F57C00'
    }

    return defStyle

  }



  zoomed = () => {
    console.log("---------- D3 ZOOM2 -----------")
    const treeArea = d3Select.select('#root')
    const t = d3Select.event.transform
    treeArea.attr("transform", t);
  }

  componentDidMount() {

    console.log("---------- D3 AREA2 -----------")

    const zoom = d3Zoom.zoom()
      .scaleExtent([1 / 3, 10])
      .on('zoom', this.zoomed)

    // TODO: any better way to avoid selection?
    const zoomArea = d3Select
      .select('rect')
      .call(zoom)

    // Move to initial location
    zoomArea.call(zoom.transform, d3Zoom.zoomIdentity.translate(50, this.state.y));
  }

}


TreeViewer.propTypes = {

  // Style of the area used by the D3.js renderer
  style: PropTypes.object,

  // Tree data in D3.js tree format
  data: PropTypes.object,

  // Key property name for the label
  label: PropTypes.string,

  // Size of tree node
  nodeWidth: PropTypes.number
}

TreeViewer.defaultProps = {
  data: {},
  style: {
    width: 1500,
    height: 1000,
    background: '#FFFFFF'
  },
  label: 'name',
  nodeSize: 10
}

export default TreeViewer