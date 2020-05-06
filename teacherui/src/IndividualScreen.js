import React from "react";
import { Container, Row, Col, Navbar, Nav, NavbarText } from 'reactstrap';
import StudentData from './data/schoolClass.json'
import StudentsSidebar from './StudentsSidebar';
import MultipleWarnings from './MultipleWarnings';
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
import WarningsIndividual from './warningData/WarningIndividual';


function IndividualScreen(props) {

    var warning_inData = [WarningsIndividual.Warning0, WarningsIndividual.Warning1, WarningsIndividual.Warning2, WarningsIndividual.Warning3, WarningsIndividual.Warning4, WarningsIndividual.Warning5, WarningsIndividual.Warning6, WarningsIndividual.Warning7, WarningsIndividual.Warning8, WarningsIndividual.Warning9, WarningsIndividual.Warning10, WarningsIndividual.Warning11, WarningsIndividual.Warning12, WarningsIndividual.Warning13, WarningsIndividual.Warning14, WarningsIndividual.Warning15, WarningsIndividual.Warning16, WarningsIndividual.Warning17, WarningsIndividual.Warning18, WarningsIndividual.Warning19, WarningsIndividual.Warning20, WarningsIndividual.Warning21, WarningsIndividual.Warning22, WarningsIndividual.Warning23, WarningsIndividual.Warning24];
    return (
        <Container fluid={true}>
            <Row noGutters={true}>
                <Col lg='12' className="navCol">
                    <Navbar color="dark" fixed="top">
                        <Nav className="ml-auto">
                            <NavbarText style={{ fontWeight: 'bold', color: 'white', fontSize: "18px" }}>
                                <VisibilityRoundedIcon /> Anti-Bullying Monitoring Dashboard
                            </NavbarText>
                        </Nav>
                        <Nav className="ml-auto"><span style={{ fontWeight: 'bold', color: 'white', fontSize: "18px" }}>{props.studentVal}</span></Nav>
                    </Navbar>
                </Col>
            </Row>
            <Row noGutters={true}>
                <Col lg='1'>
                    <StudentsSidebar students={StudentData}
                        onNavigate={props.onNavigate}
                        stateScreen={props.stateScreen}
                        studentVal={props.studentVal} />
                </Col>
                <Col lg='7'>
                    <MultipleWarnings warningVal={FrequencyData} warningIndividual={warning_inData[props.index]}
                        colorVal={props.colorVal}
                    />
                    <ReportingChart reportingMethods={ReportingData} />
                    <MethodsTable methods={InterventionsData} />
                </Col>
                <Col lg='3'>
                    <PosNegChart posNegEmotionVal={EmotionVals} />
                    <DepressionComponent depressiveInfo={DepressiveInfo} studentVal={props.studentVal} />
                </Col>
            </Row>
        </Container>
    )
}


export default IndividualScreen;