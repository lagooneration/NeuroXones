{/* Right column with research direction */}
          <div className="bg-[#0c0d20] rounded-xl p-5">
            <h3 className="text-xl font-bold mb-4 text-white">Neuro-Steered Signal Processing Research</h3>
            <div className="mb-6 relative h-48 overflow-hidden rounded-lg">
              <div className="relative w-full h-0 pb-[56.25%]">
                {/* Using lazy loading with loading="lazy" attribute */}
                <iframe 
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/_wPZ2l12C-o" 
                  title="Signal Processing Research - University of Hamburg"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
            
            <p className="text-gray-300 mb-4 leading-relaxed">
              Recent studies suggest that integrating neural signals with speech enhancement algorithms represents a 
              promising research direction.
            </p>
            
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-[#3a29ff] mr-2 flex-shrink-0">→</span>
                <span className="text-gray-300">Potential for neural decoding to identify attended audio streams in multi-speaker environments</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#3a29ff] mr-2 flex-shrink-0">→</span>
                <span className="text-gray-300">Theoretical framework for combining neural data with nonlinear spatial filtering techniques</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#3a29ff] mr-2 flex-shrink-0">→</span>
                <span className="text-gray-300">Preliminary investigations into low-latency processing for potential real-time applications</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#3a29ff] mr-2 flex-shrink-0">→</span>
                <span className="text-gray-300">Ongoing challenges in electrode count reduction while maintaining attention detection accuracy</span>
              </li>
            </ul>
          </div>