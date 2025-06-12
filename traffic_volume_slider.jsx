// Add this slider inside the AudioController component UI
<div className="absolute bottom-4 left-0 right-0 flex items-center justify-center z-20">
  <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-full flex items-center space-x-3">
    <span className="text-sm font-medium">Traffic Volume:</span>
    <input 
      type="range" 
      min="0" 
      max="0.5" 
      step="0.01" 
      value={trafficVolume} 
      onChange={(e) => setTrafficVolume(parseFloat(e.target.value))}
      className="w-24 sm:w-32 md:w-40 h-2 rounded-lg appearance-none bg-gray-700 outline-none cursor-pointer"
      style={{
        backgroundImage: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${trafficVolume * 200}%, #374151 ${trafficVolume * 200}%, #374151 100%)`
      }}
    />
    <span className="text-xs opacity-70">{Math.round(trafficVolume * 100)}%</span>
  </div>
</div>
