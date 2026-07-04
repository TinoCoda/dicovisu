import { useState, useRef } from 'react';
import {
    Box,
    Button,
    HStack,
    VStack,
    Text,
    IconButton,
    useToast,
    Input
} from '@chakra-ui/react';
import { FaMicrophone, FaStop, FaUpload, FaTrash, FaPlay } from 'react-icons/fa';

const AudioRecorder = ({ onAudioReady, existingAudioUrl, onDeleteAudio }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(existingAudioUrl || null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const fileInputRef = useRef(null);
    const toast = useToast();

    // Start recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
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

                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);

            toast({
                title: 'Recording started',
                description: 'Speak clearly into your microphone',
                status: 'info',
                duration: 2000,
            });
        } catch (error) {
            console.error('Error accessing microphone:', error);
            toast({
                title: 'Microphone access denied',
                description: 'Please allow microphone access to record audio',
                status: 'error',
                duration: 3000,
            });
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            toast({
                title: 'Recording stopped',
                description: 'You can now preview or upload your recording',
                status: 'success',
                duration: 2000,
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
                });
                return;
            }

            const url = URL.createObjectURL(file);
            setAudioBlob(file);
            setAudioUrl(url);
            onAudioReady(file);

            toast({
                title: 'Audio file loaded',
                description: 'You can now preview or upload your audio',
                status: 'success',
                duration: 2000,
            });
        }
    };

    // Clear audio
    const clearAudio = () => {
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioBlob(null);
        setAudioUrl(existingAudioUrl || null);
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

    return (
        <VStack spacing={4} align="stretch" w="100%">
            <Text fontWeight="bold" fontSize="md">
                Audio Pronunciation
            </Text>

            {/* Recording/Upload Controls */}
            <HStack spacing={3}>
                {!isRecording && !audioBlob && (
                    <>
                        <Button
                            leftIcon={<FaMicrophone />}
                            onClick={startRecording}
                            colorScheme="red"
                            size="sm"
                        >
                            Record
                        </Button>

                        <Button
                            leftIcon={<FaUpload />}
                            onClick={() => fileInputRef.current?.click()}
                            colorScheme="blue"
                            size="sm"
                        >
                            Upload File
                        </Button>

                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept="audio/*"
                            onChange={handleFileUpload}
                            display="none"
                        />
                    </>
                )}

                {isRecording && (
                    <Button
                        leftIcon={<FaStop />}
                        onClick={stopRecording}
                        colorScheme="red"
                        size="sm"
                    >
                        Stop Recording
                    </Button>
                )}
            </HStack>

            {/* Audio Preview */}
            {audioUrl && (
                <Box
                    p={3}
                    borderWidth={1}
                    borderRadius="md"
                    bg="gray.50"
                    _dark={{ bg: 'gray.700' }}
                >
                    <HStack spacing={3} justify="space-between">
                        <audio
                            src={audioUrl}
                            controls
                            style={{ width: '100%', maxWidth: '400px' }}
                        />

                        <HStack>
                            {existingAudioUrl && (
                                <IconButton
                                    icon={<FaTrash />}
                                    onClick={handleDelete}
                                    colorScheme="red"
                                    size="sm"
                                    aria-label="Delete audio"
                                    title="Delete audio"
                                />
                            )}
                            {audioBlob && !existingAudioUrl && (
                                <IconButton
                                    icon={<FaTrash />}
                                    onClick={clearAudio}
                                    colorScheme="gray"
                                    size="sm"
                                    aria-label="Clear audio"
                                    title="Clear audio"
                                />
                            )}
                        </HStack>
                    </HStack>

                    {audioBlob && (
                        <Text fontSize="xs" color="gray.500" mt={2}>
                            {audioBlob.name || 'Recorded audio'} ({Math.round(audioBlob.size / 1024)}KB)
                        </Text>
                    )}
                </Box>
            )}

            <Text fontSize="xs" color="gray.500">
                Supported formats: MP3, WAV, WebM, OGG, M4A (max 5MB)
            </Text>
        </VStack>
    );
};

export default AudioRecorder;
