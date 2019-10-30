import React from 'react';

const SimilarColors = (props) => {
    const renderColors = props.similarColors.map((color, index) => {
        return (
            <div key={index} className="similar-color" style={{ backgroundColor: color.hex }}>
                <div>
                    <h4>{`${color.brand} ${color.productline}`}</h4>
                    <h2>{color.name.charAt(0).toUpperCase() + color.name.slice(1)}</h2>
                </div>
                <div>
                    <h4 className="delta" onClick={props.onClick}>
                        {`Δ=${parseFloat(Math.round(color.delta * 100) / 100).toFixed(2)}`}
                    </h4>
                </div>
            </div>
        );
    });

    return <section className="similar-colors-wrapper">{renderColors}</section>;
};

export default SimilarColors;
