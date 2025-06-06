import React from 'react';
import TextPressure from '../components/TextPressure';

const Attention = () => {
    return (
        <div className="w-full relative mx-3 h-[80px] md:h-[240px] sm:h-[120px] xs:h-[80px]">
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