import React from 'react';
import { Box } from '@chakra-ui/react';

// A minimal brand mark referencing the dikenga (Kongo cosmogram): a circle
// crossed at the four cardinal points, marking the cycle the dictionary
// itself performs — word, meaning, relation, and back to word.
const DikengaMark = ({ boxSize = '28px', color = 'blue.400', ...rest }) => (
  <Box as="span" display="inline-block" boxSize={boxSize} color={color} {...rest}>
    <svg viewBox="0 0 40 40" width="100%" height="100%" fill="none">
      <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 3v34M3 20h34" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="20" cy="6" r="1.8" fill="currentColor" />
      <circle cx="20" cy="34" r="1.8" fill="currentColor" />
      <circle cx="6" cy="20" r="1.8" fill="currentColor" />
      <circle cx="34" cy="20" r="1.8" fill="currentColor" />
    </svg>
  </Box>
);

export default DikengaMark;
