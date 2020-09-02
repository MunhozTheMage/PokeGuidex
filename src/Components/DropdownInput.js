import React, { useState, useEffect } from 'react';

export default function DropdownInput(props) {
    var {choices = [], keyPrefix = '', label='', setValue, value} = props;

    const [ choicesState, set_choicesState ] = useState(
        choices.map((v) => {
        if(typeof v === 'object') return v;

        return {text: v, value: v};
    }));

    useEffect(() => {
        setValue(choicesState[0].value);
    }, [choicesState]);

    function onChange(e) {
        setValue(e.target.value);
    }

    return (
        <div className='dropdownInput'>
            {label !== '' ? <label>{label}</label> : null}
            <select value={value} onChange={onChange}>
                {
                    choicesState.map((v, i) => {
                        return <option value={v.value} key={`${keyPrefix}_${i}`}>{v.text}</option>
                    })
                }
            </select>
        </div>
    );
}