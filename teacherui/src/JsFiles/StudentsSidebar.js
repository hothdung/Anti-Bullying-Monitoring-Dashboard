import React, { useState, useEffect } from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

function StudentsSidebar(props) {

    const [query, setQuery] = useState("");
    const [heading, setHeading] = useState("Class " + props.students[0].studentsClassname);
    const [searchRes, setSearchRes] = useState([]);
    const handleChange = event => {
        setQuery((event.target.value).toLowerCase());
    };


    const { onNavigate } = props;

    useEffect(() => {
        var tmpSrc = props.students.filter((student, index) => {
            if (index == 0) {
                return false;
            }
            return true;
        }
        )
        const results = tmpSrc.filter(student =>
            student.label.toLowerCase().includes(query));
        setSearchRes(results);
    }, [query]);

    const handleClick = headingElem => event => {
        setHeading(headingElem);
        props.onNavigate(headingElem);
    }

    props.students.sort((a, b) => b.alert - a.alert);
    return (
        <div className="studentsSidebar">
            <List disablePadding dense>
                {props.stateScreen === 'individual' ? <div><h4 key={0}>{props.studentVal}</h4></div> : <div><h4 key={0}>{heading}</h4></div>}
                <input
                    className="search-students"
                    type="text"
                    placeholder="Search ..."
                    style={{ width: "100%", fontSize: 12 }}
                    value={query}
                    onChange={handleChange}
                />
                {searchRes.map((searchItem, index) => (
                    <ListItem key={searchItem.id} button style={{ backgroundColor: getColor(searchItem.alert, props.students), borderRadius: 4, marginTop: 2 }} onClick={handleClick(searchItem.label)}>
                        <ListItemText key={index}>{searchItem.label}</ListItemText>
                    </ListItem>
                ))}
            </List>
        </div >
    )
}


function getMax(arr, prop) {
    var max;
    for (var i = 1; i < arr.length; i++) {
        if (max == null || parseInt(arr[i][prop]) > parseInt(max[prop]))
            max = arr[i];
    }
    return max;
}

function getMin(arr, prop) {
    var min;
    for (var i = 1; i < arr.length; i++) {
        if (min == null || parseInt(arr[i][prop]) < parseInt(min[prop]))
            min = arr[i];
    }
    return min;
}

function getColor(props, students) {
    var max = getMax(students, "alert")
    console.log(max)
    var min = getMin(students, "alert")
    var grad = ((1 - (props / (max.alert - min.alert))) * 120).toString(10)

    console.log("Value is" + grad);

    return ["hsl(", grad, ",100%,50%)"].join("");
}

export default StudentsSidebar;