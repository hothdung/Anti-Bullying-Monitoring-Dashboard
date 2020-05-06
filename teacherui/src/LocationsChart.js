import React, { Component } from 'react';
import * as d3 from 'd3';

class LocationsChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: this.props.locations,
            yAxisAttribute: "location",
            xAxisAttribute: "frequency",
            width: 450,
            height: 300,
        }
        this.chartRef = React.createRef();
        this.drawChart = this.drawChart.bind(this);
    }

    drawChart() {
        let margin = {
            top: 60, right: 30, bottom: 40, left: 90
        }, width = this.state.width - margin.left - margin.right,
            height = this.state.height - margin.top - margin.bottom;

        // append svg object to body of web app
        let svg = d3.select(this.refs.canvas)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        svg.append("text")
            .attr("x", margin.left - 80)
            .attr("y", 0 - (margin.top - 45))
            .attr("text-anchor", "start")
            .style("font-size", "15px")
            .style("font-weight", "bold")
            .text("Locations")

        // X axis

        let x = d3.scaleLinear()
            .domain([0, 100])
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr('class', 'axis x')
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0) rotate(-45)")
            .style("text-anchor", "end");

        // y axis

        let y = d3.scaleBand()
            .range([0, height])
            .domain(this.state.data.map((d) =>
                d[this.state.yAxisAttribute]))
            .padding(.1)
        svg.append("g")
            .attr('class', 'axis y')
            .call(d3.axisLeft(y))
            .selectAll("text")
            .attr("dy", null)

        // adding bars
        svg.selectAll("myRect")
            .data(this.state.data)
            .enter()
            .append("rect")
            .on('mouseover', function () {
                d3.select(this).style('opacity', 0.5)
            })
            .on('mouseout', function () {
                d3.select(this).style('opacity', 1)
            })
            .attr("x", x(0))
            .attr("y", (d) => y(d[this.state.yAxisAttribute]))
            .attr("width", 0)
            .attr("height", y.bandwidth() - 10)
            .attr("fill", "#614ad3")
            .transition(d3.transition().duration(5000))
            .attr("width", (d) => x(d[this.state.xAxisAttribute]))

    }

    componentDidMount() {
        this.drawChart();
    }
    render() {
        return <div ref="canvas">
        </div>
    }
}

export default LocationsChart;