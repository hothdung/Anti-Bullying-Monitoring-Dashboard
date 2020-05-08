import React, { Component } from 'react';
import { Container, Row, Col, Navbar, Nav, NavbarText } from 'reactstrap';
import VisibilityRoundedIcon from '@material-ui/icons/VisibilityRounded';
import StudentData from './data/schoolClass.json'
import StudentsSidebar from './StudentsSidebar';
import WarningFrequency from './WarningFrequency';
import FrequencyData from './data/warningSample.json';
import InterventionsData from './data/interventions.json';
import MethodsTable from './MethodsTable';
import Navigation from './Navigation';
import { spacing } from '@material-ui/system';
import FeelingsCloud from './FeelingsCloud';
import ReportingChart from './ReportingChart';
import AtmosphereChart from './AtmosphereChart';
import LocationsChart from './LocationsChart';
import FeelingsTag from './data/emotions.json';
import ReportingData from './data/reportMethods.json';
import EmotionData from './data/classAtmosphere.json';
import LocationData from './data/locations.json';
import Paper from '@material-ui/core/Paper';


class Overview extends Component {

    constructor(props) {
        super(props);
        this.state = {
            option: "Overview"
        }

    }


    handleOptionSelected = option => {
        this.setState({
            option
        })
    }
    render() {

        const { option } = this.state;

        return (
            <Container fluid={true} style={{ paddingLeft: 0, paddingRight: 0 }}>
                <Row noGutters={true} style={{ marginLeft: 0, marginRight: 0 }}>
                    <Col lg="12" className="navCol" style={{ paddingLeft: 0, paddingRight: 0 }}>
                        <Navbar color="dark" fixed="top">
                            <Nav className="ml-auto">
                                <NavbarText style={{ fontWeight: 'bold', color: 'white', fontSize: "18px" }}>
                                    <VisibilityRoundedIcon />  Anti-Bullying Monitoring Dashboard Overview
                                    </NavbarText>
                            </Nav>
                            <Nav className="ml-auto"><span style={{ fontWeight: 'bold', color: 'white', fontSize: "18px" }}>Class {this.props.classNameVal[0].studentsClassname}</span></Nav>
                        </Navbar>
                    </Col>
                </Row >
                <Row noGutters={true} style={{ marginLeft: 0, marginRight: 0 }}>
                    <Col lg='1' style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 0 }}>
                        <StudentsSidebar students={StudentData}
                            onNavigate={this.props.onNavigate} />
                    </Col>

                    <Col lg='11' style={{ paddingLeft: 0, paddingRight: 0 }}>
                        <Paper>
                            <Navigation onSelect={this.handleOptionSelected}
                                option={this.state.option}
                                stateScreen={this.props.stateScreen} /></Paper>

                        {this.state.option === "Overview" ?
                            <div><WarningFrequency warningVal={FrequencyData} />
                                <MethodsTable methods={InterventionsData} /></div> :
                            <div>
                                <Col lg='7' style={{ float: "left" }}>
                                    <FeelingsCloud cloudTags={FeelingsTag} />
                                    <ReportingChart reportingMethods={ReportingData} />
                                </Col>
                                <Col lg='3' style={{ float: "left", marginLeft: "80px" }}>
                                    <AtmosphereChart emotionsVal={EmotionData} />
                                    <LocationsChart locations={LocationData} />
                                </Col>
                            </div>
                        }
                    </Col>

                </Row>
            </Container >
        )
    }
}

export default Overview;