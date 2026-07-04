import { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';

const WaveformVisualizer = ({
    audioStream = null,
    isRecording = false,
    height = 80,
    color = '#38B2AC' // teal.500
}) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const analyserRef = useRef(null);
    const audioContextRef = useRef(null);

    useEffect(() => {
        if (!audioStream || !isRecording) {
            // Stop animation when not recording
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            // Clear canvas
            if (canvasRef.current) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            // Clean up audio context
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
            return;
        }

        // Create audio context and analyser
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(audioStream);

            analyser.fftSize = 2048;
            analyser.smoothingTimeConstant = 0.8;
            source.connect(analyser);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            // Start visualization
            visualize();
        } catch (error) {
            console.error('Error setting up audio visualization:', error);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, [audioStream, isRecording]);

    const visualize = () => {
        const canvas = canvasRef.current;
        if (!canvas || !analyserRef.current) return;

        const ctx = canvas.getContext('2d');
        const analyser = analyserRef.current;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);

            analyser.getByteTimeDomainData(dataArray);

            // Set canvas size to match container (for responsiveness)
            const rect = canvas.getBoundingClientRect();
            if (canvas.width !== rect.width || canvas.height !== rect.height) {
                canvas.width = rect.width;
                canvas.height = rect.height;
            }

            const width = canvas.width;
            const height = canvas.height;

            // Clear canvas
            ctx.fillStyle = 'rgb(245, 245, 245)';
            ctx.fillRect(0, 0, width, height);

            // Draw waveform
            ctx.lineWidth = 2;
            ctx.strokeStyle = color;
            ctx.beginPath();

            const sliceWidth = width / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = (v * height) / 2;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            ctx.lineTo(width, height / 2);
            ctx.stroke();

            // Add glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
            ctx.stroke();
        };

        draw();
    };

    return (
        <Box
            w="100%"
            h={`${height}px`}
            borderRadius="md"
            overflow="hidden"
            bg="gray.50"
            _dark={{ bg: 'gray.700' }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block'
                }}
            />
        </Box>
    );
};

export default WaveformVisualizer;
