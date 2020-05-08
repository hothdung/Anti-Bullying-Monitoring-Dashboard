import React, { Component } from 'react';
import * as d3 from 'd3';


class DepressionComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: this.props.depressiveInfo,
            studentName: this.props.studentVal,
            width: 400,
            height: 200
        }
        this.chartRef = React.createRef();
        this.drawChart = this.drawChart.bind(this);
    }


    drawChart() {
        let dimensions = {
            margin: {
                top: 0,
                right: 15,
                bottom: 0,
                left: 20,
            }
        }

        dimensions.boundedWidth = this.state.width - dimensions.margin.left - dimensions.margin.right;
        dimensions.boundedHeight = this.state.height - dimensions.margin.top - dimensions.margin.bottom;

        const wrapper = d3.select(this.refs.canvas)
            .append("svg")
            .attr("width", this.state.width)
            .attr("height", this.state.height)

        const bounds = wrapper.append("g")
            .style("transform", `translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`);

        var states = ["normal", "mild", "help needed", "depressive"],
            segmentWidth = 60;

        var colors = ['#39ff14', '#FFFF00', '#ffae19', '#ff0000'];
        var color = d3.scaleOrdinal()
            .domain(states)
            .range(colors);

        var startVal = 1;

        // appending the text with depressive state duration
        bounds.append('g')
            .selectAll("durationinf")
            .data(this.state.data)
            .enter()
            .append("text")
            .attr("class", "statusD")
            .attr("fill", "black")
            .attr("x", 0)
            .attr("y", 50)
            .attr("text-anchor", "start")
            .style("font-size", "10px")
            .style("font-weight", "bold")
            .text(this.state.studentName + "' s depressive state lasts for"
            )

        var text = bounds.append('g')
            .selectAll("durationinf2")
            .data(this.state.data)
            .enter()
            .append("text")
            .attr("class", "duration")
            .attr("fill", "black")
            .attr("x", 0)
            .attr("y", 80)
            .attr("text-anchor", "start")
            .style("font-size", "10px")
            .style("font-weight", "bold")
            .text(startVal);

        text.transition()
            .tween('text', function (d) {
                var selection = d3.select(this);
                var end = d.days;
                var interpolator = d3.interpolateNumber(startVal, end);

                return function (k) {
                    selection.text(Math.round(interpolator(k)));
                }
            }).duration(5000);

        bounds.append('g')
            .append("text")
            .attr("class", "duration")
            .attr("fill", "black")
            .attr("x", 30)
            .attr("y", 80)
            .attr("text-anchor", "start")
            .style("font-size", "10px")
            .style("font-weight", "bold")
            .text("days.");

        bounds.append('rect')
            .attr("class", "initialRect")
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("fill", "#b1b1b1")
            .attr("height", 15)
            .attr("width", function () {
                return segmentWidth * states.length;
            })
            .attr("x", 0)
            .attr("y", 100);


        var progressBar = bounds.selectAll("progressB")
            .data(this.state.data)
            .enter()
            .append("rect")
            .attr("class", "progress-bar")
            .attr('height', 15)
            .attr('rx', 10)
            .attr('ry', 10)
            .attr('x', 0)
            .attr("y", 100);

        bounds.selectAll("statusText")
            .data(this.state.data)
            .enter()
            .append("text")
            .attr("class", "statusT")
            .attr("fill", "black")
            .attr("x", function () {
                return (segmentWidth * states.length) - 100;
            })
            .attr("y", 135)
            .attr("text-anchor", "start")
            .style("font-size", "9px")
            .style("font-weight", "bold")
            .text(function (d) {
                return d.status;
            })

        progressBar.transition()
            .duration(1500)
            .attr("fill", function (d) {
                return color(d.status);
            })
            .attr('width', function (d) {
                var index = states.indexOf(d.status);
                console.log("This is the index" + index);
                return (index + 1) * segmentWidth;
            })

    }


    componentDidMount() {
        this.drawChart();

    }
    render() {
        return (
            <div id='depressiveInfo' ref="canvas" style={{ width: 100, height: 50 }}></div>
        )
    }
}
export default DepressionComponent;