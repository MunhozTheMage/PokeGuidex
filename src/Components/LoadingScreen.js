import React from 'react';

export default function LoadingScreen(props) {
    var { evalFunction } = props;

    return (
        evalFunction() ?
            <div className='loading'>
                <h1>Loading...</h1>
            </div>
        : null
    )
}