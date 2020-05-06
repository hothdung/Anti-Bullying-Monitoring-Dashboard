import React, { Component } from 'react';
import * as d3 from 'd3';

class WarningFrequency extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: this.props.warningVal,
            yAxisAttribute: "warningMax",
            xAxisAttribute: "date",
            width: 700,
            height: 300,
        }
        this.chartRef = React.createRef();
        this.drawLineChart = this.drawLineChart.bind(this);
    }

    drawLineChart() {

        var keys = [
            "Interventions",
            "Consultations"
        ]

        var colors = d3.scaleOrdinal(["#4CE3CE", "#16AFE8"])
        const yAccessor = d => d.warningMax
        const dateParser = d3.timeParse("%Y-%m-%d")
        const xAccessor = d => dateParser(d.date)

        let dimensions = {
            margin: {
                top: 15,
                right: 15,
                bottom: 40,
                left: 60,
            }
        }

        dimensions.boundedWidth = this.state.width - dimensions.margin.left - dimensions.margin.right

        dimensions.boundedHeight = this.state.height - dimensions.margin.top - dimensions.margin.bottom

        const wrapper = d3.select(this.refs.canvas)
            .append("svg")
            .attr("width", this.state.width)
            .attr("height", this.state.height)

        const bounds = wrapper.append("g")
            .style("transform", `translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`)

        const yScale = d3.scaleLinear()
            .domain(d3.extent(this.state.data, yAccessor))
            .range([dimensions.boundedHeight, 0])

        const xScale = d3.scaleTime()
            .domain(d3.extent(this.state.data, xAccessor))
            .range([0, dimensions.boundedWidth])

        const lineGenerator = d3.line()
            .x(d => xScale(xAccessor(d)))
            .y(d => yScale(yAccessor(d)))

        const path = bounds.append("path")
            .attr("d", lineGenerator(this.state.data))
            .attr("fill", "none")
            .attr("stroke", "#6c5ce7")
            .attr("stroke-width", 2)

        // create transition option
        const transitionOption = d3.transition()
            .transition()
            .ease(d3.easeSin)
            .duration(8000);

        // getting total length of svg path
        const pathLength = path.node().getTotalLength();

        path.attr("stroke-dashoffset", pathLength)
            .attr("stroke-dasharray", pathLength);

        path.attr("stroke-dashoffset", pathLength)
            .attr("stroke-dasharray", pathLength)
            .transition(transitionOption)
            .attr("stroke-dashoffset", 0);

        const yAxisGenerator = d3.axisLeft()
            .scale(yScale)

        bounds.append("g")
            .call(yAxisGenerator)

        const xAxisGenerator = d3.axisBottom()
            .scale(xScale)

        bounds.append("g")
            .attr("transform", "translate(0, " + yScale(22) + ")")
            .append("line")
            .attr("x2", dimensions.boundedWidth)
            .style("stroke", "#000058")
            .style("stroke-dasharray", ("3, 3"))
            .style("stroke-width", "1.5px")

        bounds.append("g")
            .call(xAxisGenerator)
            .style("transform", `translateY(${dimensions.boundedHeight}px)`)

        bounds.append("g")
            .append("text")
            .attr("x", dimensions.margin.left + 20)
            .attr("y", 0 - (dimensions.margin.top - 20))
            .style("text-anchor", "middle")
            .style("font-size", "15px")
            .style("font-weight", "bold")
            .text("Warning frequency")


        var legend = bounds.append("g")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys)
            .enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(0," + i * 20 + ")";
            });

        legend.append("rect")
            .attr("x", dimensions.boundedWidth - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", colors)

        legend.append("text")
            .attr("x", dimensions.boundedWidth - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .style("font-weight", "bold")
            .text(function (d) { return d; })

    }
    componentDidMount() {
        this.drawLineChart();
    }

    render() {
        return <div ref="canvas"></div>
    }
}

export default WarningFrequency;