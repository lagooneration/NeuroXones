import React, { useRef, useEffect, memo, useCallback, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';

const AudioController = memo(React.forwardRef((props, ref) => {
  const { onPositionChange, onBirdHover, onCatHover, onSignHover } = props;
  const trackpadRef = useRef(null);
  const birdIconRef = useRef(null);
  const catIconRef = useRef(null);
  const signIconRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioRefsRef = useRef({
    sign: null,
    birds: null,
    cat: null,
    traffic: null
  });

  // Expose audioRefsRef to parent via ref
  useImperativeHandle(ref, () => audioRefsRef.current, []);

  // Rest of your AudioController implementation here...
  // ...existing code...

  return (
    <div className="relative h-full w-full p-2 sm:p-4 md:p-6 lg:p-8">
      {/* ...existing content... */}
    </div>
  );
}));

AudioController.propTypes = {
  onPositionChange: PropTypes.func,
  onBirdHover: PropTypes.func,
  onCatHover: PropTypes.func,
  onSignHover: PropTypes.func,
  ref: PropTypes.shape({
    current: PropTypes.object
  })
};

export default AudioController;
