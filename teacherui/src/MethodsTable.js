import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import AddBoxIcon from '@material-ui/icons/AddBox';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import DoneIcon from '@material-ui/icons/Done';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';

const columns = [
    {
        id: 'interventionType',
        label: 'Intervention type',
        minWidth: 100
    },
    {
        id: 'place',
        label: 'Place',
        minWidth: 100

    },
    {
        id: 'students',
        label: 'Involved Students',
        minWidth: 100

    },
    {
        id: 'date',
        label: 'Date',
        minWidth: 100

    },
    {
        id: 'time',
        label: 'Time',
        minWidth: 100

    },
    {
        id: 'severity',
        label: 'Severity',
        minWidth: 100

    },
    {
        id: 'teachers',
        label: 'Teacher(s)',
        minWidth: 100


    }
];


function createData(interventionType, place, students, date, time, severity, teachers) {

    if (!(date === "")) {
        // date formatter
        let inter_date = new Date(date);
        date = inter_date.toDateString();
    }

    return { interventionType, place, students, date, time, severity, teachers };
}


function sendingData(dataObj) {
    fetch('http://147.46.215.219:8080/interventions', {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            interventionType: dataObj.interventionType,
            place: dataObj.place,
            students: dataObj.students,
            date: dataObj.date,
            time: dataObj.time,
            severity: dataObj.severity,
            teachers: dataObj.teachers
        }),
    }).then(res => res.json()).then(data => console.log(data)).catch(error =>
        console.log(error))
}


// array for incoming data
var rowsInitial = [];

const useStyles = makeStyles({
    root: {
        width: window.width,
    },
    container: {
        maxHeight: 440,
    },
});

function MethodsTable(props) {

    for (var i = 0; i < props.methods.length; i++) {
        var obj = props.methods[i];
        var item = (createData(obj.interventionType, obj.place, obj.students, obj.date, obj.time, obj.severity, obj.teachers));
        rowsInitial[i] = item;
    }

    const classes = useStyles();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [rows, setRows] = useState(rowsInitial);
    const [editIdx, setEditIdx] = useState(-1);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = event => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    // adding row 
    const addRow = () => {
        const dataItem = createData("", "", "", "", "", "", "");
        setRows([...rows, dataItem])
    }


    // delete specific row
    const deleteCertainRow = (index) => {

        let items = rows.filter((row, i) => i !== index);
        setRows(items);

    }

    const handleEdit = (i) => {
        setEditIdx(i);

    }

    const stopEdit = (row) => {
        // create JSObject
        let tableData = {};
        setEditIdx(-1);
        columns.map(column => {
            // add table entries to JSObject
            return tableData[column.id] = row[column.id];
        })
        // posting data to server
        sendingData(tableData);
    }

    // eventlistener
    const handleChange = (e, nameVal, i) => {
        // get value of textfield
        const { value } = e.target;
        let items = rows.map((row, j) => (j === i ? { ...row, [nameVal]: value } : row));
        setRows(items);
    }

    return (
        <div className="reportingTable" style={{ width: window.innerWidth - 200, paddingTop: 5 }}>
            <div className="addRow">
                <Button
                    variant="contained"
                    color="secondary"
                    className={classes.button}
                    startIcon={<AddBoxIcon />}
                    id="addBtn"
                    onClick={addRow}>
                    Add Row
                </Button>
            </div>
            <Paper className={classes.root}>
                <TableContainer className={classes.container}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {columns.map(column => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                                <TableCell />
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {

                                // current on that index editing on specific row
                                const currentEditing = editIdx === index;
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={index} id={index}>
                                        {columns.map(column => {
                                            const val = row[column.id];
                                            return (
                                                <TableCell key={column.id} align={column.align}>
                                                    {currentEditing ? <TextField name={column.id} onChange={(e) => handleChange(e, column.id, index)} value={val} /> : val}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell>
                                            {currentEditing ? <DoneIcon onClick={() => stopEdit(row)} /> : <EditIcon onClick={() => handleEdit(index)} />}
                                        </TableCell>
                                        <TableCell><DeleteIcon onClick={function () { return deleteCertainRow(index) }} /></TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </Paper>
        </div>
    );
}
export default MethodsTable;