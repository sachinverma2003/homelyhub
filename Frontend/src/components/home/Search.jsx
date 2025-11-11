import React, { useState } from 'react';
import { DatePicker, Space } from "antd";
import "react-datepicker/dist/react-datepicker.css";
import "../../css/Home.css";
import { useDispatch } from "react-redux";
import { propertyAction } from "../../store/Property/property-slice";
import { getAllProperties } from '../../store/Property/property-action';

const Search = () => {
    const { RangePicker } = DatePicker;
    const dispatch = useDispatch();

    const [keyword, setKeyword] = useState({
        city: "",
        guests: "",
        dateIn: "",
        dateOut: ""
    });

    const [value, setValue] = useState([]);

    function searchHandler(e) {
        e.preventDefault();
        dispatch(propertyAction.updateSearchParams(keyword));
        dispatch(getAllProperties());
    }

    // --- THIS FUNCTION IS NOW FIXED ---
    function returnDates(date, dateString) {
        // 'date' is an array of dayjs objects, e.g., [dayjs(..), dayjs(..)]
        // 'dateString' is an array of strings, e.g., ["30-12-2025", "31-12-2025"]

        // We set the visual value of the picker
        setValue(date ? [date[0], date[1]] : []);

        // We format the dates into the "YYYY-MM-DD" format for the backend
        const dateInISO = date && date[0] ? date[0].format("YYYY-MM-DD") : "";
        const dateOutISO = date && date[1] ? date[1].format("YYYY-MM-DD") : "";

        // We update the state with the backend-friendly format
        updateKeyword("dateIn", dateInISO);
        updateKeyword("dateOut", dateOutISO);
    }

    const updateKeyword = (field, value) => {
        setKeyword((prevKeyword) => ({
            ...prevKeyword,
            [field]: value
        }));
    };

    return (
        <div className='searchbar'>
            <input
                className='search'
                id='search_destination'
                placeholder='Search destination'
                type='text'
                value={keyword.city}
                onChange={(e) => updateKeyword("city", e.target.value)}
            />
            <Space direction='vertical' size={12} className='search'>
                <RangePicker
                    value={value}
                    format="DD-MM-YYYY" // This only changes the *display* format
                    picker="date"
                    className="date_picker"
                    disabledDate={(current) => {
                        return current && current.isBefore(Date.now(), "day");
                    }}
                    onChange={returnDates} // This now runs our fixed function
                />
            </Space>
            <input
                className='search'
                id="addguest"
                placeholder="Add Guests"
                type='number'
                value={keyword.guests}
                onChange={(e) => updateKeyword("guests", e.target.value)}
            />
            <span className='material-symbols-outlined searchicon' onClick={searchHandler}>
                search
            </span>
        </div>
    );
};

export default Search;