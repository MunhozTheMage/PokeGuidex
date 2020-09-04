import React from 'react';

export default function ErrorScreen(props) {
    var { evalFunction } = props;

    return (
        evalFunction() ?
        <div className='error'>
            <h1>Oops, couldn't find that Pokemon.</h1>
        </div>
        : null
    )
}