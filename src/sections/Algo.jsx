import Carousel from '../components/Carousel';
import { useState } from 'react';

const Algo = () => {
    const [currentAlgorithm, setCurrentAlgorithm] = useState(0);
    
    const algorithmItems = [
        {
            title: "Demcus",
            description: "Deep End-to-end Multi-Channel Speech Separation algorithm that isolates individual speakers from overlapping audio.",
            id: 1,
        },
        {
            title: "ConvTasNet",
            description: "Convolutional Time-domain Audio Separation Network that uses advanced neural processing to separate audio streams.",
            id: 2,
        },
        {
            title: "AAD",
            description: "Auditory Attention Detection precisely tracks neural activity to identify which audio stream a listener is focusing on.",
            id: 3,
        },
        {
            title: "DPRNN",
            description: "Dual-Path Recurrent Neural Network offers unprecedented precision in audio stream separation and attention tracking.",
            id: 4,
        }
    ];

    const algorithmDetails = [
        {
            title: "Demcus: Speech Separation",
            description: "Demcus employs deep neural networks to separate mixed audio streams, isolating individual speakers from complex soundscapes. It allows our system to create distinct audio channels that can be selectively enhanced based on user attention.",
            benefits: ["Isolates individual speakers in crowded environments", "Reduces background noise by up to 85%", "Works with multiple overlapping voices"]
        },
        {
            title: "ConvTasNet: Real-time Processing",
            description: "ConvTasNet is our core audio separation technology, using time-domain convolutional networks for ultra-low latency performance. It enables natural listening experiences by processing audio faster than human perception can detect.",
            benefits: ["Achieves separation in milliseconds", "Adapts to changing acoustic environments", "Preserves natural sound quality"]
        },
        {
            title: "AAD: Neural Tracking",
            description: "Auditory Attention Detection monitors neural signals in real-time to determine which audio stream you're focusing on. This breakthrough technology bridges the gap between brain activity and sound enhancement.",
            benefits: ["Tracks attention shifts within 300ms", "Works with non-invasive EEG sensors", "Continuously improves with machine learning"]
        },
        {
            title: "DPRNN: Computational Efficiency",
            description: "Dual-Path Recurrent Neural Networks provide our platform with the computational efficiency needed for mobile applications. This algorithm optimizes resource usage while maintaining exceptional audio quality.",
            benefits: ["Reduces power consumption by 60%", "Enables all-day wearable use", "Scales processing based on environmental complexity"]
        }
    ];

    // Track which algorithm is currently shown
    const handleAlgorithmChange = (index) => {
        setCurrentAlgorithm(index);
    };return (
        <div className="c-space max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-16">
                <h2 className="text-4xl font-bold text-center mt-8 text-white">Core Algorithms</h2>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-12">
                    <div style={{ width: '400px', height: '400px', position: 'relative' }}>                        
                        <Carousel
                            items={algorithmItems}
                            baseWidth={400}
                            autoplay={true}
                            autoplayDelay={5000}
                            pauseOnHover={true}
                            loop={true}
                            round={false}
                            onSlideChange={handleAlgorithmChange}
                        />
                    </div>
                      <div className="max-w-lg bg-[#0a0b1a] border border-[#1a1a2e] mt-10 rounded-xl p-8 shadow-xl">
                        {/* <h3 className="text-2xl font-bold mt-2 text-white">
                            {algorithmDetails[currentAlgorithm].title}
                        </h3> */}
                        <p className="text-gray-300 mb-6 leading-relaxed">
                            {algorithmDetails[currentAlgorithm].description}
                        </p>
                        
                        <h4 className="text-xl font-semibold mb-3 text-white">Key Benefits:</h4>
                        <ul className="space-y-2">
                            {algorithmDetails[currentAlgorithm].benefits.map((benefit, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-[#3a29ff] mr-2">•</span>
                                    <span className="text-gray-300">{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                </div>
            </div>
        </div>
    );
};

export default Algo;