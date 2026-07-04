import { useState, useRef, useEffect } from 'react';
import {
    Box,
    Button,
    HStack,
    VStack,
    Text,
    IconButton,
    useToast,
    Input,
    Progress,
    Flex,
    Badge
} from '@chakra-ui/react';
import { FaMicrophone, FaStop, FaUpload, FaTrash, FaPlay, FaPause } from 'react-icons/fa';
import WaveformVisualizer from './WaveformVisualizer';

const AudioRecorder = ({ onAudioReady, existingAudioUrl, onDeleteAudio }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(existingAudioUrl || null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioStream, setAudioStream] = useState(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const fileInputRef = useRef(null);
    const audioPlayerRef = useRef(null);
    const timerRef = useRef(null);
    const toast = useToast();

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioUrl && !existingAudioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (audioStream) {
                audioStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Update existing audio URL when prop changes
    useEffect(() => {
        if (existingAudioUrl) {
            setAudioUrl(existingAudioUrl);
        }
    }, [existingAudioUrl]);

    // Start recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioStream(stream);

            mediaRecorderRef.current = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioUrl(url);
                onAudioReady(blob);

                // Stop stream
                stream.getTracks().forEach(track => track.stop());
                setAudioStream(null);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

            toast({
                title: 'Recording started',
                description: 'Speak clearly into your microphone',
                status: 'info',
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error accessing microphone:', error);
            toast({
                title: 'Microphone access denied',
                description: 'Please allow microphone access to record audio',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            toast({
                title: 'Recording stopped',
                description: `Duration: ${formatTime(recordingTime)}`,
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
        }
    };

    // Handle file upload
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('audio/')) {
                toast({
                    title: 'Invalid file type',
                    description: 'Please upload an audio file',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: 'File too large',
                    description: 'Please upload a file smaller than 5MB',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            const url = URL.createObjectURL(file);
            setAudioBlob(file);
            setAudioUrl(url);
            onAudioReady(file);

            toast({
                title: 'Audio file loaded',
                description: file.name,
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
        }
    };

    // Clear audio
    const clearAudio = () => {
        if (audioUrl && !existingAudioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioBlob(null);
        setAudioUrl(existingAudioUrl || null);
        setRecordingTime(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Delete existing audio
    const handleDelete = async () => {
        if (onDeleteAudio) {
            await onDeleteAudio();
        }
        clearAudio();
    };

    // Toggle play/pause
    const togglePlayback = () => {
        if (audioPlayerRef.current) {
            if (isPlaying) {
                audioPlayerRef.current.pause();
            } else {
                audioPlayerRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Format time helper
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <VStack spacing={4} align="stretch" w="100%">
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
                <Text fontWeight="bold" fontSize={{ base: 'sm', md: 'md' }}>
                    Audio Pronunciation
                </Text>
                {isRecording && (
                    <Badge colorScheme="red" fontSize="sm" px={3} py={1}>
                        🔴 {formatTime(recordingTime)}
                    </Badge>
                )}
            </Flex>

            {/* Waveform Visualizer - shown during recording */}
            {isRecording && audioStream && (
                <WaveformVisualizer
                    audioStream={audioStream}
                    isRecording={isRecording}
                    height={100}
                    color="#E53E3E"
                />
            )}

            {/* Recording/Upload Controls */}
            {!isRecording && !audioBlob && (
                <VStack spacing={3} w="100%">
                    <Button
                        leftIcon={<FaMicrophone />}
                        onClick={startRecording}
                        colorScheme="red"
                        size={{ base: 'md', md: 'lg' }}
                        w="100%"
                        h={{ base: '50px', md: '60px' }}
                        fontSize={{ base: 'md', md: 'lg' }}
                    >
                        Record Audio
                    </Button>

                    <Button
                        leftIcon={<FaUpload />}
                        onClick={() => fileInputRef.current?.click()}
                        colorScheme="blue"
                        variant="outline"
                        size={{ base: 'md', md: 'lg' }}
                        w="100%"
                        h={{ base: '50px', md: '60px' }}
                        fontSize={{ base: 'md', md: 'lg' }}
                    >
                        Upload Audio File
                    </Button>

                    <Input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        display="none"
                    />
                </VStack>
            )}

            {/* Stop Recording Button */}
            {isRecording && (
                <Button
                    leftIcon={<FaStop />}
                    onClick={stopRecording}
                    colorScheme="red"
                    size={{ base: 'md', md: 'lg' }}
                    w="100%"
                    h={{ base: '50px', md: '60px' }}
                    fontSize={{ base: 'md', md: 'lg' }}
                    animation="pulse 2s infinite"
                >
                    Stop Recording
                </Button>
            )}

            {/* Audio Preview */}
            {audioUrl && !isRecording && (
                <Box
                    p={{ base: 3, md: 4 }}
                    borderWidth={2}
                    borderRadius="lg"
                    bg="gray.50"
                    _dark={{ bg: 'gray.700' }}
                    borderColor="teal.300"
                >
                    <VStack spacing={3}>
                        {/* Custom Audio Player */}
                        <HStack spacing={3} w="100%">
                            <IconButton
                                icon={isPlaying ? <FaPause /> : <FaPlay />}
                                onClick={togglePlayback}
                                colorScheme="teal"
                                size={{ base: 'md', md: 'lg' }}
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                            />

                            <audio
                                ref={audioPlayerRef}
                                src={audioUrl}
                                onEnded={() => setIsPlaying(false)}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                style={{ display: 'none' }}
                            />

                            <Box flex="1">
                                <audio
                                    src={audioUrl}
                                    controls
                                    style={{
                                        width: '100%',
                                        height: '40px'
                                    }}
                                />
                            </Box>

                            <IconButton
                                icon={<FaTrash />}
                                onClick={existingAudioUrl ? handleDelete : clearAudio}
                                colorScheme={existingAudioUrl ? 'red' : 'gray'}
                                size={{ base: 'md', md: 'lg' }}
                                aria-label="Delete audio"
                            />
                        </HStack>

                        {/* File Info */}
                        {audioBlob && (
                            <Text fontSize="xs" color="gray.500" textAlign="center">
                                {audioBlob.name || 'Recorded audio'} • {Math.round(audioBlob.size / 1024)}KB
                                {audioBlob.type && ` • ${audioBlob.type.split('/')[1].toUpperCase()}`}
                            </Text>
                        )}
                    </VStack>
                </Box>
            )}

            {/* Help Text */}
            <Text fontSize="xs" color="gray.500" textAlign="center">
                Supported: MP3, WAV, WebM, OGG, M4A (max 5MB)
            </Text>

            <style>
                {`
                    @keyframes pulse {
                        0%, 100% {
                            opacity: 1;
                        }
                        50% {
                            opacity: 0.7;
                        }
                    }
                `}
            </style>
        </VStack>
    );
};

export default AudioRecorder;
