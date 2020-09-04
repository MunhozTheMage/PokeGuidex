import React from 'react';

export default function NavArrowButton(props) {
    var { 
        modifier = 1,
        set = () => {},
        currentVal = 0,
        limitValue = 0,
        text = ''
    } = props;

    var condition = (
    modifier > 0 ? 
    currentVal < limitValue : 
    currentVal > limitValue);

    if(text === '') {
        text = modifier > 0 ? '>' : '<';
    }

    return (
        <button 
        className={condition ? 'navButton navButtonActive' : 'navButton navButtonInactive'}
        onClick={condition ?
        () => {
            set(currentVal + modifier);
        }
        : () => {}}
        >
        {text}
        </button>
    );
}