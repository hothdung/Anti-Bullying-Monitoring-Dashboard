import React, { Component } from 'react';
import * as d3 from 'd3';


class AtmosphereChart extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: this.props.emotionsVal,
            yAxisAttribute: "nameEmotion",
            xAxisAttribute: "percentage",
            xAxisAttribute2: "total",
            img: "image",
            width: 400,
            height: 350,
            legendWidth: 250,
            legendHeight: 25,
        }
        this.chartRef = React.createRef();
        this.drawChart = this.drawChart.bind(this);
    }

    drawChart() {

        var colors = ['#FF0000', '#5588ff', '#993299', '#A3A319', '#19D219'];

        var color = d3.scaleOrdinal().range(colors);

        let margin = {
            top: 60, right: 30, bottom: 40, left: 90
        }, width = this.state.width - margin.left - margin.right,
            height = this.state.height - margin.top - margin.bottom;

        let x = d3.scaleLinear()
            .domain([0, 100])
            .range([0, width]);

        // y axis 
        let y = d3.scaleBand()
            .range([0, height])
            .domain(this.state.data.map((d) =>
                d[this.state.yAxisAttribute]))
            .padding(0.1)

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
            .text("Class atmosphere")

        svg.append('g')
            .attr('class', 'yaxis')
            .call(d3.axisLeft(y))

        // creating overlapping bar chart to create filling a static bar with certain percentage
        svg.selectAll("totalBar")
            .data(this.state.data)
            .enter().append('rect')
            .attr("id", function (d, i) {
                return "total" + i;
            })
            .attr('x', 0)
            .attr('y', (d) => y(d[this.state.yAxisAttribute]))
            .attr('width', (d) => x(d[this.state.xAxisAttribute2]))
            .attr('height', y.bandwidth() - 10)
            .attr('fill', '#F6F4FF')
            .style('stroke', 'black')
            .style('stroke-width', 1)




        // creating the overview

        var curr_percentage = 0,
            prev_percentage = 0;
        svg.selectAll(".bar1")
            .data(this.state.data[0].ePercentage)
            .enter()
            .append('rect')
            .attr("x", function (d) {
                prev_percentage = curr_percentage;
                var calc_percentage = x(d);
                curr_percentage = curr_percentage + calc_percentage;
                return prev_percentage;
            })
            .attr("y", 4)
            .attr('width', (d) => x(d))
            .attr("height", y.bandwidth() - 10)
            .attr('fill', function (d, i) {
                return color(i);
            })
            .style('stroke', 'black')
            .style('stroke-width', 0.4);

        svg.append("text")
            .attr("x", 0)
            .attr("y", 30)
            .attr("dy", "1em")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text("0 %")

        svg.append("text")
            .attr("x", prev_percentage + 20)
            .attr("y", 30)
            .attr("dy", "1em")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text("100 %")



        // to skip first element of json --> to render percentages
        var percentageData = this.state.data.slice(1);

        svg.selectAll("percentageBar")
            .data(percentageData)
            .enter()
            .append('rect')
            .attr('opacity', '0')
            .attr('x', x(0))
            .attr('y', (d) => y(d[this.state.yAxisAttribute]))
            .attr('height', y.bandwidth() - 10)
            .attr('fill', function (d, i) {
                return color(i);
            })
            .transition().delay((d, i) => { return i * 2000 })
            .duration(2000)
            .attr('width', (d) => x(d[this.state.xAxisAttribute]))
            .attr('opacity', 1)
            .style('stroke', 'black')
            .style('stroke-width', 0.1);

        svg.append('defs')
            .selectAll('pattern')
            .data(percentageData)
            .enter()
            .append('pattern')
            .attr('id', (d) => d[this.state.yAxisAttribute])
            .attr('width', 70)
            .attr('height', 90)
            .append('image')
            .attr("xlink:href", (d) => d[this.state.img]
            )
            .attr('width', 40)
            .attr('height', 40)
            .attr("x", 0)
            .attr("y", 0)


        // attaching circle to percentage bars
        svg.selectAll('circle')
            .data(percentageData)
            .enter()
            .append('circle')
            .attr('opacity', '0')
            .attr('cx', x(0.5))
            .attr('cy', (d) => y(d[this.state.yAxisAttribute]) + 15)
            .attr('r', 20)
            .style("stroke", function (d, i) {
                return color(i);
            })
            .style("stroke-width", 4.5)
            .attr('fill', (d) => "url(#" + d[this.state.yAxisAttribute] + ")")
            .transition().delay((d, i) => {
                return i * 2000;
            })
            .duration(2000)
            .attr("cx", (d) => x(d[this.state.xAxisAttribute]))
            .attr('opacity', 1)

    }



    componentDidMount() {
        this.drawChart();
    }

    render() {
        return (
            <div id='classAtmosphere' ref="canvas">
            </div>
        )
    }

}

export default AtmosphereChart;