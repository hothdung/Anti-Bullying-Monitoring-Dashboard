import React, { Component } from "react";
import * as d3 from 'd3';


class PosNegChart extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: this.props.posNegEmotionVal,
            width: 600,
            height: 400
        }
        this.chartRef = React.createRef();
        this.drawChart = this.drawChart.bind(this);
    }

    drawChart() {

        let dimensions = {
            margin: {
                top: 20,
                right: 15,
                bottom: 10,
                left: 60,
            }
        }

        dimensions.boundedWidth = this.state.width - dimensions.margin.left - dimensions.margin.right;
        dimensions.boundedHeight = this.state.height - dimensions.margin.top - dimensions.margin.bottom;
        var colors = d3.scaleOrdinal().range(["#3333FF", "#FF3333"]);
        var firstVal = this.state.data[0].date,
            lastVal = Object.values(this.state.data)[Object.values(this.state.data).length - 1].date;
        var keyVal = ["pos", "neg"]

        const wrapper = d3.select(this.refs.canvas)
            .append('svg')
            .attr('width', this.state.width)
            .attr('height', this.state.height)

        const bounds = wrapper.append("g")
            .style("transform", `translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`)

        bounds.append("text")
            .attr("x", (dimensions.boundedWidth / 2))
            .attr("y", 0 - (dimensions.margin.top / 2) + 10)
            .attr("text-anchor", "middle")
            .style("font-size", "15px")
            .style("font-weight", "bold")
            .text(firstVal + " - " + lastVal)

        // data contains positive and negative values
        
        var series = d3.stack()
            .keys(keyVal)
            .offset(d3.stackOffsetDiverging)
            (this.state.data);

        const x = d3.scaleBand()
            .domain(this.state.data.map(function (d) { return d.date; }))
            .rangeRound([dimensions.margin.left, dimensions.boundedWidth - dimensions.margin.right])
            .padding(0.2)


        // y axis
        const y = d3.scaleLinear()
            .domain([d3.min(series, this.stackMin), d3.max(series, this.stackMax)])
            .rangeRound([dimensions.boundedHeight - dimensions.margin.bottom, dimensions.margin.top])

        bounds.append("g")
            .attr("transform", "translate(" + dimensions.margin.left + ",0)")
            .call(d3.axisLeft(y))

        // storing data in tmp, for access
        var tmpData = this.state.data;

        var stackData = keyVal.map(function (val) {
            return tmpData.map(function (d) {
                return { y: d[val] };
            });
        });
        this.barStack(stackData);


        var div = d3.select("body").append("div")
            .attr("class", "posNegtooltip")
            .style("opacity", 0);

        bounds.selectAll(".series").data(stackData)
            .enter().append("g").attr("class", function (d, i) {
                return "rects" + i;
            })
            .style("fill", function (d, i) {
                return colors(i);
            }).selectAll("rect")
            .data(Object)
            .enter().append("rect")
            .style("opacity", 0)
            .attr("x", function (d, i) { return x(x.domain()[i]) })
            .attr("y", function (d) { return y(d.y0) })
            .attr("height", function (d) {
                return y(0) - y(d.size)
            })
            .attr("width", x.bandwidth())
            .on("mouseover", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html(d.y)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);

            })
            .transition().delay(function (d, i) { return i * 400; })
            .duration(400)
            .style('opacity', 1);


        var xAxis = d3.axisBottom(x)
            .tickValues([firstVal, lastVal])

        bounds.append("g")
            .attr("class", "posNegXAxis")
            .attr("transform", "translate(0," + y(0) + ")")
            .call(xAxis)

        // adding legend

        var legend = bounds.append("g")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keyVal)
            .enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(0," + i * 20 + ")";
            })
        var counter = 0;
        legend.append("rect")
            .attr("x", dimensions.boundedWidth - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("id", function (d, i) {
                console.log("legend" + i);
                return "legend" + i;
            })
            .attr("value", 0)
            .attr("fill", colors)
            .on("click", function () {
                d3.select(this).attr("value", function (d, i) {
                    counter += 1;
                    return counter;
                })
                d3.select(this).attr("fill", function (d, i) {
                    // highlight the chosen legend item
                    // retrieve color state of legend item
                    var result;
                    if (d3.select(this).attr("fill") === "#BDBDBD" && d3.select(this).attr("id") === "legend0") {
                        result = colors(i);
                        d3.select('#legend0').style("stroke", "none");
                        d3.select('#legend1').style("stroke", "none");
                        d3.selectAll(".rects0").attr("visibility", "visible");
                        counter = 0;
                    } else if (d3.select(this).attr("fill") === "#BDBDBD" && d3.select(this).attr("id") === "legend1") {
                        result = colors(i + 1);
                        d3.select('#legend0').style("stroke", "none");
                        d3.select('#legend1').style("stroke", "none");
                        d3.selectAll(".rects1").attr("visibility", "visible");
                        counter = 0;
                    }
                    else {
                        if (d3.select(this).attr("id") === "legend0") {
                            d3.select('#legend1').style("stroke", "none");
                            d3.select(this).style("stroke", "black")
                                .style("stroke-width", "2px");
                            d3.selectAll(".rects1").attr("visibility", "hidden");
                            if (d3.select(this).attr("value") === "1") {
                                d3.select('#legend1').attr("fill", "#BDBDBD")
                                result = colors(i);
                            } else {
                                d3.selectAll(".rects1").attr("visibility", "visible");
                                d3.select('#legend1').attr("fill", colors(i + 1))
                                counter = 0;
                                result = colors(i);
                            }

                        } else {
                            d3.select('#legend0').style("stroke", "none");
                            d3.select(this).style("stroke", "black")
                                .style("stroke-width", "2px");
                            d3.selectAll(".rects0").attr("visibility", "hidden");
                            if (d3.select(this).attr("value") === "1") {
                                d3.select('#legend0').attr("fill", "#BDBDBD")
                                result = colors(i + 1);
                            } else {
                                d3.selectAll(".rects0").attr("visibility", "visible");
                                d3.select('#legend0').attr("fill", colors(i))
                                counter = 0;
                                result = colors(i + 1);
                            }
                        }


                    }
                    return result;
                })
            })

        legend.append("text")
            .attr("x", dimensions.boundedWidth - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .style("font-weight", "bold")
            .text(function (d) { return d; })


    }
    componentDidMount() {
        this.drawChart();
    }

    barStack(d) {
        var l = d[0].length
        while (l--) {
            var posBase = 0, negBase = 0;
            d.forEach(function (d) {
                d = d[l]
                d.size = Math.abs(d.y)
                if (d.y < 0) {
                    d.y0 = negBase
                    negBase -= d.size
                } else {
                    d.y0 = posBase = posBase + d.size
                }
            })
        }
        d.extent = d3.extent(d3.merge(d3.merge(d.map(function (e) { return e.map(function (f) { return [f.y0, f.y0 - f.size] }) }))))
        return d
    }

    stackMin(layer) {
        return d3.min(layer, function (d) {
            return d[0];
        })
    }

    stackMax(layer) {
        return d3.max(layer, function (d) {
            return d[1];
        })
    }

    render() {
        return (
            <div id='posNegChart' ref="canvas">
            </div>
        );
    }



}
export default PosNegChart;