import React from 'react';
import TextPressure from '../components/TextPressure';

const Attention = () => {
    return (
        <div style={{width: '100%', height: '260px', position: 'relative', margin: '12px' }}>
            <TextPressure
                text="ATTENTION!"
                flex={true}
                alpha={false}
                stroke={false}
                width={true}
                weight={true}
                italic={true}
                textColor="#ffffff"
                strokeColor="#ff0000"
                minFontSize={36}
            />
        </div>
    );
};

export default Attention;