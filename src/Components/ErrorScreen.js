import React from 'react';

export default function ErrorScreen(props) {
    var { 
        evalFunction = () => {},
        message = "Oops, couldn't find that Pokémon."
    } = props;

    return (
        evalFunction() ?
        <div className='error'>
            <h1>{message}</h1>
        </div>
        : null
    )
}