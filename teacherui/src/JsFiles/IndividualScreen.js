import React from "react";
import { Container, Row, Col, Navbar, Nav, NavbarText } from 'reactstrap';
import StudentData from './data/schoolClass.json'
import StudentsSidebar from './StudentsSidebar';
import WarningFrequency from './WarningFrequency';
import FrequencyData from './data/warningSample.json';
import ReportingChart from './ReportingChart';
import ReportingData from './data/reportMethods.json';
import InterventionsData from './data/interventions.json';
import MethodsTable from './MethodsTable';
import DepressiveInfo from './data/depressionDuration.json';
import DepressionComponent from './DepressionComponent';
import EmotionVals from "./data/posNegEmotionValues.json";
import PosNegChart from "./PosNegChart";
import VisibilityRoundedIcon from '@material-ui/icons/VisibilityRounded';

function IndividualScreen(props) {
    return (
        <Container fluid={true}>
            <Row noGutters={true}>
                <Col lg='12' className="navCol">
                    <Navbar color="dark" style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        <Nav className="navBarIn">
                            <NavbarText style={{ fontWeight: 'bold', color: 'white', fontSize: "18px" }}>
                                <VisibilityRoundedIcon /> Anti-Bullying Monitoring Dashboard: {props.studentVal}
                            </NavbarText>
                        </Nav>
                    </Navbar>
                </Col>
            </Row>
            <Row noGutters={true}>
                <Col lg='1'>
                    <StudentsSidebar students={StudentData}
                        onNavigate={props.onNavigate}
                        stateScreen={props.stateScreen}
                        studentVal ={props.studentVal} />
                </Col>
                <Col lg='7'>
                    <WarningFrequency warningVal={FrequencyData} />
                    <ReportingChart reportingMethods={ReportingData} />
                    <MethodsTable methods={InterventionsData} />
                </Col>
                <Col lg='3'>
                    <PosNegChart posNegEmotionVal={EmotionVals} />
                    <DepressionComponent depressiveInfo={DepressiveInfo} />
                </Col>
            </Row>
        </Container>
    )
}

export default IndividualScreen;