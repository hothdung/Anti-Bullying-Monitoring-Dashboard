import React, { useState, useEffect } from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import { Link } from "react-router-dom";


function StudentsSidebar(props) {

    const [query, setQuery] = useState("");
    const [searchRes, setSearchRes] = useState([]);
    const handleChange = event => {
        setQuery((event.target.value).toLowerCase());
    };


    useEffect(() => {
        var tmpSrc = props.students.filter((student, index) => {
            if (index === 0) {
                return false;
            }
            return true;
        }
        )
        const results = tmpSrc.filter(student =>
            student.label.toLowerCase().includes(query));
        setSearchRes(results);
    }, [query]);

    const handleClick = (index, color) => event => {
        props.onNavigate(index, color);
    }

    props.students.sort((a, b) => b.alert - a.alert);
    return (
        <div className="studentsSidebar">
            <List disablePadding dense>
                <input
                    className="search-students"
                    type="text"
                    placeholder="Class 7c ..."
                    style={{ width: "100%", fontSize: 12 }}
                    value={query}
                    onChange={handleChange}
                />
                {searchRes.map((searchItem, index) => (
                    <Link key={searchItem.id} to='/individual' style={{ textDecoration: 'none' }}>
                        <ListItem button className="students" style={{ backgroundColor: getColor(searchItem.alert, props.students), borderRadius: 4, marginTop: 2 }} onClick={handleClick(searchItem.label, index, getColor(searchItem.alert, props.students))}>
                            <ListItemText key={index} style={{ color: 'black' }}>{searchItem.label}</ListItemText>
                        </ListItem>
                    </Link>
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