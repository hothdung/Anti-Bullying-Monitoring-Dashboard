import React, { Component } from 'react';
import ReactWordcloud from 'react-wordcloud';
import 'd3-transition';
import { select } from 'd3-selection';


const options = {
    colors: ["#FF3333", "#3333FF"],
    fontFamily: "impact",
    deterministic: true,
    fontSizes: [22, 50],
    fontWeight: "normal",
    fontStyle: "normal",
    rotationAngles: [0, 90],
    rotations: 3,
    padding: 1,
    transitionDuration: 1000,

};

function getCallbacks(callback) {

    return function (word, event) {
        const isActive = callback !== "onWordMouseOut";
        const element = event.target;
        const text = select(element);

        text.transition()
            .attr('font-size', isActive ? "300%" : '100%')
            .attr('text-decoration', isActive ? 'underline' : 'none');
    }
}



const callbacks = {
    getWordTooltip: word =>
        `The emotion "${word.text}" appeared in class ${word.value} times.`,
    onWordMouseOut: getCallbacks('onWordMouseOut'),
    onWordMouseOver: getCallbacks('onWordMouseOver')
};


class FeelingsCloud extends Component {

    render() {

        return (
            <div className='tag-cloud' style={{ width: window.innerWidth - 850, height: '300px' }}>
                <h3 style={{ 'textAlign': 'center', 'fontWeight': 'bold', 'fontSize': 15 }}>Feelings</h3>
                <ReactWordcloud callbacks={callbacks} options={options} words={this.props.cloudTags} />
            </div>
        )
    }
}



export default FeelingsCloud;