import { memo } from 'react';
import PropTypes from 'prop-types';

// Optimized component for lazy loading images
const LazyImage = memo(({ 
  src, 
  alt, 
  className, 
  style, 
  fetchPriority = 'auto',
  onLoad,
  sizes = '', 
  ...props 
}) => {
  return (
    <img      
    src={src}
      alt={alt || ''}
      className={className}
      style={{
        ...style,
        contentVisibility: 'auto',
        contain: 'content',
      }}
      loading={fetchPriority === 'high' ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={fetchPriority}
      onLoad={onLoad}
      sizes={sizes}
      {...props}
    />
  );
});

LazyImage.displayName = 'LazyImage';

LazyImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  fetchPriority: PropTypes.oneOf(['high', 'low', 'auto']),
  onLoad: PropTypes.func,
  sizes: PropTypes.string,
};

export default LazyImage;
