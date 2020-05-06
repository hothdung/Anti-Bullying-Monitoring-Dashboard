import React, { Component } from 'react';
import StudentData from './data/schoolClass.json'
import Overview from './Overview';
import FadeIn from "react-fade-in";
import Lottie from "react-lottie";
import "bootstrap/dist/css/bootstrap.css";
import * as Loading from "./data/monitoring.json";
import IndividualScreen from './IndividualScreen';
import { Route } from 'react-router-dom'


var defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: Loading.default,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice"
  }
};


class App extends Component {

  constructor(props) {
    super(props);
    this.setIndividualScreen = this.setIndividualScreen.bind(this);
    this.state = {
      done: undefined,
      screen: 'overview',
      studentName: "",
      color: "",
      dataIndex: 0
    };

  }

  componentDidMount() {
    setTimeout(() => {
      fetch("https://jsonplaceholder.typicode.com/posts")
        .then(response => response.json())
        .then(json => {
          this.setState({ done: true });
        });
    }, 8100);
  }

  setIndividualScreen(name, index, color) {
    this.setState(() => ({
      screen: 'individual',
      studentName: name,
      color: color,
      dataIndex: index
    }))
  }

  // back button functionality included
  render() {
    return (
      <div>
        <Route exact path='/' render={() => (<Overview classNameVal={StudentData}
          onNavigate={this.setIndividualScreen}
        />)} />
        <Route path='/individual' render={() => (
          <IndividualScreen studentVal={this.state.studentName}
            colorVal={this.state.color}
            onNavigate={this.setIndividualScreen}
            stateScreen={this.state.screen}
            index={this.state.dataIndex} />)} />
      </div>
    )
  }

}

export default App;
