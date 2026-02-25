import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  useToast,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Progress,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  HStack,
  Divider,
  Card,
  CardHeader,
  CardBody,
  Button,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useGetStatisticsEndpoint } from '../api/words/wordApi';

const StatisticsPage = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const toast = useToast();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Access Denied',
        description: 'You need to be logged in to view statistics.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
      return;
    }

    fetchStatistics();
  }, [isAuthenticated, navigate, toast]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await useGetStatisticsEndpoint();
      
      if (response.success) {
        setStatistics(response.data);
        // Select the first language by default
        if (response.data.byLanguage.length > 0) {
          setSelectedLanguage(response.data.byLanguage[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load statistics. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateCoverage = (lang) => {
    if (lang.uniqueWordsInExamples === 0) return 100;
    const coverage = ((lang.uniqueWordsInExamples - lang.wordsInExamplesNotInDictionary) / lang.uniqueWordsInExamples) * 100;
    return coverage.toFixed(1);
  };

  const exportMissingWords = (langCode, missingWords) => {
    const exportData = {
      languageCode: langCode,
      generatedAt: new Date().toISOString(),
      totalMissingWords: missingWords.length,
      description: "Words that appear in examples but are not yet in the dictionary",
      words: missingWords
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `missing-words-${langCode}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: `Exported ${missingWords.length} missing words for ${langCode}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8}>
          <Spinner size="xl" color={accentColor} />
          <Text>Loading statistics...</Text>
        </VStack>
      </Container>
    );
  }

  if (!statistics) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>No statistics available.</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="xl" mb={2} bgGradient="linear(to-r, cyan.400, blue.500)" bgClip="text">
            Dictionary Statistics
          </Heading>
          <Text color="gray.500">Insights into your multilingual dictionary</Text>
        </Box>

        {/* Overall Statistics */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
            <CardBody>
              <Stat>
                <StatLabel>Total Words</StatLabel>
                <StatNumber color={accentColor}>{statistics.overall.totalWords}</StatNumber>
                <StatHelpText>Entries in dictionary</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
            <CardBody>
              <Stat>
                <StatLabel>Languages</StatLabel>
                <StatNumber color={accentColor}>{statistics.overall.totalLanguages}</StatNumber>
                <StatHelpText>Unique language codes</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
            <CardBody>
              <Stat>
                <StatLabel>Unique Words</StatLabel>
                <StatNumber color={accentColor}>{statistics.overall.uniqueDictionaryWords}</StatNumber>
                <StatHelpText>Distinct word forms</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Divider />

        {/* Language-Specific Statistics */}
        <Box>
          <Heading size="lg" mb={4}>Statistics by Language</Heading>
          
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList flexWrap="wrap">
              {statistics.byLanguage.map((lang) => (
                <Tab key={lang.languageCode} onClick={() => setSelectedLanguage(lang)}>
                  <Badge colorScheme="purple" mr={2}>{lang.languageCode}</Badge>
                  {lang.totalDictionaryWords} words
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              {statistics.byLanguage.map((lang) => (
                <TabPanel key={lang.languageCode}>
                  <VStack spacing={6} align="stretch">
                    {/* Language Overview */}
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                      <Card variant="outline">
                        <CardBody>
                          <Stat size="sm">
                            <StatLabel>Dictionary Words</StatLabel>
                            <StatNumber>{lang.totalDictionaryWords}</StatNumber>
                            <StatHelpText>{lang.uniqueDictionaryWordsInExamples} used in examples</StatHelpText>
                          </Stat>
                        </CardBody>
                      </Card>

                      <Card variant="outline">
                        <CardBody>
                          <Stat size="sm">
                            <StatLabel>Words Without Examples</StatLabel>
                            <StatNumber color="orange.500">{lang.wordsWithoutExamples}</StatNumber>
                            <StatHelpText>{((lang.wordsWithoutExamples / lang.totalDictionaryWords) * 100).toFixed(1)}% of dictionary</StatHelpText>
                          </Stat>
                        </CardBody>
                      </Card>

                      <Card variant="outline">
                        <CardBody>
                          <Stat size="sm">
                            <StatLabel>Words in Examples</StatLabel>
                            <StatNumber>{lang.uniqueWordsInExamples}</StatNumber>
                            <StatHelpText>Unique words found</StatHelpText>
                          </Stat>
                        </CardBody>
                      </Card>

                      <Card variant="outline">
                        <CardBody>
                          <Stat size="sm">
                            <StatLabel>Missing Words</StatLabel>
                            <StatNumber color="orange.500">{lang.wordsInExamplesNotInDictionary}</StatNumber>
                            <StatHelpText>In examples, not in dictionary</StatHelpText>
                          </Stat>
                        </CardBody>
                      </Card>
                    </SimpleGrid>

                    {/* Coverage Progress Bar */}
                    <Box>
                      <Text fontSize="sm" mb={2}>Dictionary Coverage of Example Words</Text>
                      <Progress 
                        value={parseFloat(calculateCoverage(lang))} 
                        colorScheme={parseFloat(calculateCoverage(lang)) > 80 ? "green" : parseFloat(calculateCoverage(lang)) > 50 ? "yellow" : "red"}
                        size="lg"
                        hasStripe
                      />
                    </Box>

                    {/* Statistics Sections */}
                    <Accordion allowMultiple defaultIndex={[0]}>
                      {/* Top Dictionary Words */}
                      <AccordionItem>
                        <h2>
                          <AccordionButton>
                            <Box flex="1" textAlign="left">
                              <HStack>
                                <Text fontWeight="bold">Top Dictionary Words in Examples</Text>
                                <Badge colorScheme="blue">{lang.topDictionaryWords.length}</Badge>
                              </HStack>
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <Text fontSize="sm" color="gray.600" mb={4}>
                            Dictionary words ranked by how often they appear in examples (total occurrences across all examples).
                          </Text>
                          <Table size="sm" variant="striped">
                            <Thead>
                              <Tr>
                                <Th>Rank</Th>
                                <Th>Word</Th>
                                <Th isNumeric>Occurrences in Examples</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {lang.topDictionaryWords.map((item, idx) => (
                                <Tr key={idx}>
                                  <Td>{idx + 1}</Td>
                                  <Td fontWeight="medium">{item.word}</Td>
                                  <Td isNumeric>
                                    <Badge colorScheme="blue">{item.count}</Badge>
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </AccordionPanel>
                      </AccordionItem>

                      {/* Top Words in Examples */}
                      <AccordionItem>
                        <h2>
                          <AccordionButton>
                            <Box flex="1" textAlign="left">
                              <HStack>
                                <Text fontWeight="bold">Most Frequent Words in Examples</Text>
                                <Badge colorScheme="green">{lang.topExampleWords.length}</Badge>
                              </HStack>
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <Table size="sm" variant="striped">
                            <Thead>
                              <Tr>
                                <Th>Rank</Th>
                                <Th>Word</Th>
                                <Th isNumeric>Occurrences</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {lang.topExampleWords.map((item, idx) => (
                                <Tr key={idx}>
                                  <Td>{idx + 1}</Td>
                                  <Td fontWeight="medium">{item.word}</Td>
                                  <Td isNumeric>
                                    <Badge colorScheme="green">{item.count}</Badge>
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </AccordionPanel>
                      </AccordionItem>

                      {/* Missing Words */}
                      {lang.topMissingWords.length > 0 && (
                        <AccordionItem>
                          <h2>
                            <AccordionButton>
                              <Box flex="1" textAlign="left">
                                <HStack>
                                  <Text fontWeight="bold">Words in Examples Not in Dictionary</Text>
                                  <Badge colorScheme="orange">{lang.topMissingWords.length}</Badge>
                                </HStack>
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={4}>
                            <VStack align="stretch" spacing={4}>
                              <HStack>
                                <Text fontSize="sm" color="gray.600">
                                  These words appear in examples but don't have their own dictionary entries yet.
                                </Text>
                                <Button 
                                  size="sm" 
                                  colorScheme="orange"
                                  onClick={() => exportMissingWords(lang.languageCode, lang.allMissingWords)}
                                >
                                  Export All ({lang.allMissingWords.length})
                                </Button>
                              </HStack>
                              <Table size="sm" variant="striped">
                                <Thead>
                                  <Tr>
                                    <Th>Rank</Th>
                                    <Th>Word</Th>
                                    <Th isNumeric>Occurrences</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {lang.topMissingWords.map((item, idx) => (
                                    <Tr key={idx}>
                                      <Td>{idx + 1}</Td>
                                      <Td fontWeight="medium" color="orange.500">{item.word}</Td>
                                      <Td isNumeric>
                                        <Badge colorScheme="orange">{item.count}</Badge>
                                      </Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            </VStack>
                          </AccordionPanel>
                        </AccordionItem>
                      )}
                    </Accordion>
                  </VStack>
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>
    </Container>
  );
};

export default StatisticsPage;
