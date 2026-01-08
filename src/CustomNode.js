import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const nodeStyle = {
    padding: '10px 20px',
    borderRadius: '15px',
    width: '250px',
    height: '100px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontFamily: 'Inter, sans-serif',
    fontSize: '20px',
    fontWeight: 'bold',
    textAlign: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
};

const maleGradient = {
    background: 'linear-gradient(to bottom right, #00E3AE, #0097E6)',
};

const femaleGradient = {
    background: 'linear-gradient(to bottom right, #FF9F43, #FF6B6B)',
};

const defaultGradient = {
    background: 'linear-gradient(to bottom right, #bdc3c7, #2c3e50)',
};

const CustomNode = ({ data }) => {
    let style = { ...nodeStyle };

    if (data.gender && data.gender.toLowerCase() === 'female') {
        style = { ...style, ...femaleGradient };
    } else if (data.gender && data.gender.toLowerCase() === 'male') {
        style = { ...style, ...maleGradient };
    } else {
        style = { ...style, ...defaultGradient };
    }

    return (
        <div style={style}>
            <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
            <div>{data.label}</div>
            <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
        </div>
    );
};

export default memo(CustomNode);
