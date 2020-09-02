//================================================================================
// External:                                                                      
//================================================================================
import React from 'react';

//================================================================================
// Components:                                                                    
//================================================================================
export default function SearchBar(props) {
    var {
        buttonText = '', 
        placeholder = '', 
        type = 'text', 
        onclick = () => {}
    } = props;

    var inputElement;

    function handleInputRef(input) {
        inputElement = input;
    }

    return (
        <div className='searchBar'>
            <input 
            ref={handleInputRef}
            placeholder={placeholder} 
            type={type}
            />

            <button onClick={() => {onclick(inputElement.value)}}>{buttonText}</button>
        </div>
    );
}


