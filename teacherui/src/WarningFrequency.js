import React, { Component } from 'react';
import * as d3 from 'd3';


class WarningFrequency extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: this.props.warningVal,
            yAxisAttribute: "warningMax",
            xAxisAttribute: "date",
            width: window.innerWidth - 250,
            height: 250
        }
        this.chartRef = React.createRef();
        this.drawLineChart = this.drawLineChart.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.formatDate = this.formatDate.bind(this);
        this.createJSON = this.createJSON.bind(this);
        this.createCircleData = this.createCircleData.bind(this);
    }

    formatDate(datum) {
        var d = new Date(datum);
        datum = [
            d.getFullYear(),
            ('0' + (d.getMonth() + 1)).slice(-2),
            ('0' + d.getDate()).slice(-2)
        ].join('-');

        return datum;
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

        // append threshold line
        bounds.append("g")
            .attr("transform", "translate(0, " + yScale(22) + ")")
            .append("line")
            .attr("x2", dimensions.boundedWidth)
            .style("stroke", "#000058")
            .style("stroke-dasharray", ("3, 3"))
            .style("stroke-width", "2px")

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
        // Ids of rects = keys Interventions, Consultations
        legend.append("rect")
            .attr("x", dimensions.boundedWidth - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("id", function (d) {
                return d;
            })
            .attr("fill", colors)

        legend.append("text")
            .attr("x", dimensions.boundedWidth - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .style("font-weight", "bold")
            .text(function (d) {
                return d;
            })

        this.fetchData().then((data) => {
            var circleData = this.createJSON(data);

            // distinguish between intervention and consultation marks
            var consultations = [];
            var interventions = [];
            var consultationStr = "Consultation", interventionStr = "Intervention";

            consultations = this.createCircleData(consultationStr, circleData);
            interventions = this.createCircleData(interventionStr, circleData);

            // plotting the consultations
            bounds.append("g")
                .selectAll(".circle")
                .data(consultations)
                .enter()
                .append("circle")
                .attr("class", "consultationCircle")
                .attr("r", 6)
                .attr("cx", function (d) {
                    return xScale(xAccessor(d))
                })
                .attr("cy", function (d) {
                    return yScale(yAccessor(d));
                })
                .style("fill", "#16AFE8")
                .style("opacity", 0);

            // plotting interventions
            bounds.append("g").selectAll(".circle")
                .data(interventions)
                .enter()
                .append("circle")
                .attr("class", "interventionCircle")
                .attr("r", 6)
                .attr("cx", function (d) {
                    return xScale(xAccessor(d))
                })
                .attr("cy", function (d) {
                    return yScale(yAccessor(d));
                })
                .style("fill", "#4CE3CE")
                .style("opacity", 0);

            // adding click events to legend rects
            d3.select("#Consultations").on("click", function () {
                var cOpacity = d3.selectAll(".consultationCircle").style("opacity");
                if (cOpacity == 0) {
                    d3.selectAll(".consultationCircle").style("opacity", 1);
                } else {
                    d3.selectAll(".consultationCircle").style("opacity", 0);
                }
            });


            d3.select("#Interventions").on("click", function () {
                var cOpacity = d3.selectAll(".interventionCircle").style("opacity");
                if (cOpacity == 0) {
                    d3.selectAll(".interventionCircle").style("opacity", 1);
                } else {
                    d3.selectAll(".interventionCircle").style("opacity", 0);
                }
            })

        })

    }

    createCircleData(str, jsonData) {
        var i;
        var methods = [];
        for (i = 0; i < jsonData.length; i++) {
            if (jsonData[i].interventionType === str) {
                methods.push(jsonData[i]);
            }
        }
        return methods;
    }

    createJSON(obj) {
        var arrayObj = [];
        var i, j;

        // length of warning json
        var jsonLength = Object.keys(this.state.data).length;
        for (i = 0; i < obj.length; i++) {
            var methodObj = {};
            methodObj["interventionType"] = obj[i].interventionType;
            var date = this.formatDate(obj[i].date);
            for (j = 0; j < jsonLength; j++) {
                if (date === this.state.data[j].date) {
                    methodObj["date"] = date;
                    methodObj["warningMax"] = this.state.data[j].warningMax;
                    arrayObj.push(methodObj);
                }
            }
        }
        return arrayObj;
    }

    fetchData() {
        return fetch('http://147.46.215.219:8080/posts', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        }).then((response) => {
            if (response.status >= 400) {
                throw new Error("Server bad response!");
            }
            return response.json().then((data) => {
                return data;
            })
        }).catch(error => {
            console.log("Parsing not successful!", error);
        })
    }


    componentDidMount() {
        this.drawLineChart();
    }

    render() {
        return <div className="warningG" ref="canvas"></div>
    }
}

export default WarningFrequency;