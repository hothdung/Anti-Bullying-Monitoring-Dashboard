import React, { Component } from 'react';
import { Container, Row, Col, Navbar, Nav, NavbarText } from 'reactstrap';
import VisibilityRoundedIcon from '@material-ui/icons/VisibilityRounded';
import StudentData from './data/schoolClass.json'
import StudentsSidebar from './StudentsSidebar';
import WarningFrequency from './WarningFrequency';
import FrequencyData from './data/warningSample.json';
import InterventionsData from './data/interventions.json';
import MethodsTable from './MethodsTable';

class Overview extends Component {

    render() {

        return (
            <Container fluid={true}>
                <Row>
                    <Col lg="12" className="navCol">
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
                <Row noGutters={true}>
                    <Col lg='1'>
                        <StudentsSidebar students={StudentData}
                            onNavigate={this.props.onNavigate} />
                    </Col>
                    <Col lg='11'>
                        <WarningFrequency warningVal={FrequencyData} />
                        <MethodsTable methods={InterventionsData} />
                    </Col>
                </Row>
            </Container >
        )
    }
}

export default Overview;