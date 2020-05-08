import React, { Component } from 'react';
import { Container, Row, Col, Navbar, Nav, NavbarText } from 'reactstrap';
import VisibilityRoundedIcon from '@material-ui/icons/VisibilityRounded';
import StudentData from './data/schoolClass.json'
import StudentsSidebar from './StudentsSidebar';
import LocationsChart from './LocationsChart';
import WarningFrequency from './WarningFrequency';
import FeelingsTag from './data/emotions.json';
import FrequencyData from './data/warningSample.json';
import LocationData from './data/locations.json';
import FeelingsCloud from './FeelingsCloud';
import AtmosphereChart from './AtmosphereChart';
import EmotionData from './data/classAtmosphere.json';
import ReportingChart from './ReportingChart';
import ReportingData from './data/reportMethods.json';
import InterventionsData from './data/interventions.json';
import MethodsTable from './MethodsTable';

class TestView extends Component {

    render() {

        return (
            <Container fluid={true}>
                <Row noGutters={true} style={{ marginLeft: 0, marginRight: 0, marginTop: 0 }}>
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
                </Row>
                <Row noGutters={true}>
                    <Col lg='1'>
                        <StudentsSidebar students={StudentData}
                            onNavigate={this.props.onNavigate} />
                    </Col>
                    <Col lg='7'>
                        <FeelingsCloud cloudTags={FeelingsTag} />
                        <ReportingChart reportingMethods={ReportingData} />
                    </Col>
                    <Col lg='3'>
                        <AtmosphereChart emotionsVal={EmotionData} />
                        <LocationsChart locations={LocationData} />
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default TestView;