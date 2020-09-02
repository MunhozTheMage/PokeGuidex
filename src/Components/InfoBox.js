import React from 'react';
import './InfoBox.css';

export default function InfoBox(props) {
    const { title = 'Title', content = null, className = '' } = props;

    return (
        <div className={`infoBox ${className}`}>
            <div className='titleArea'>
                <h3>{title}</h3>
            </div>
            <div className='contentArea'>
                {
                    content
                }
            </div>
        </div>
    );
}