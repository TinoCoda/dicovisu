import React, { useState, useEffect } from 'react'
import { Box, Container, Text, VStack, Heading, Input, Button, useToast, Textarea, Radio, RadioGroup, Stack, Select as ChakraSelect } from "@chakra-ui/react"
import Select from 'react-select'
import { useLanguageStore } from '../store/languages'
import { useReactSelectStyles } from '../utils/reactSelectTheme'

const africanCountries = [
  { value: 'KE', label: 'Kenya 🇰🇪' },
  { value: 'TZ', label: 'Tanzania 🇹🇿' },
  { value: 'UG', label: 'Uganda 🇺🇬' },
  { value: 'CG', label: 'Congo 🇨🇬' },
  { value: 'CD', label: 'DRC 🇨🇩' },
  { value: 'GA', label: 'Gabon 🇬🇦' },
  { value: 'AO', label: 'Angola 🇦🇴' },
  { value: 'NG', label: 'Nigeria 🇳🇬' },
];

function AddNewLANG({ languageToEdit }) {
  const [mode, setMode] = useState(languageToEdit ? 'update' : 'add');
  const [newLanguage, setNewLanguage] = useState({
    name: "",
    code: "",
    description: "",
    countries: [],
  });
  const [selectedLanguageId, setSelectedLanguageId] = useState(null);

  const toast = useToast();
  const { addLanguage, updateLanguage, fetchLanguages, languages, fetchLanguageById } = useLanguageStore();

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  useEffect(() => {
    if (languageToEdit) {
      setNewLanguage(languageToEdit);
    }
  }, [languageToEdit]);

  useEffect(() => {
    if (selectedLanguageId) {
      fetchLanguageById(selectedLanguageId).then(({ success, data }) => {
        if (success) {
          setNewLanguage({
            ...data,
            countries: data.countries.map(code => africanCountries.find(country => country.value === code))
          });
        }
      });
    }
  }, [selectedLanguageId, fetchLanguageById]);

  const handleSaveLanguage = async () => {
    const languageData = {
      ...newLanguage,
      countries: newLanguage.countries.map(country => country.value)
    };

    let result;
    if (mode === 'update') {
      result = await updateLanguage(languageData);
    } else {
      result = await addLanguage(languageData);
    }

    const { success, message } = result;

    if (success) {
      setNewLanguage({
        name: "",
        code: "",
        description: "",
        countries: [],
      });
      toast({
        title: mode === 'update' ? "Language updated successfully" : "Language added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: mode === 'update' ? "Failed to update language" : "Failed to add language",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  const selectStyles = useReactSelectStyles();

  return (
    <>
      <Container maxW={"container.sm"} py={{ base: 4, md: 8 }}>
        <VStack spacing={6}>
          <VStack spacing={1}>
            <Heading
              as="h1"
              fontFamily="heading"
              fontStyle="italic"
              fontWeight="500"
              size={{ base: 'lg', md: 'xl' }}
              textAlign="center"
              color="text-primary"
            >
              {mode === 'update' ? "Sôba Mbembu" : "Mbembu yampa"}
            </Heading>
            <Text fontSize="sm" color="text-muted">
              {mode === 'update' ? "Edit an existing language" : "Add a new language"}
            </Text>
          </VStack>
          <RadioGroup onChange={setMode} value={mode} colorScheme="blue">
            <Stack direction="row" spacing={5}>
              <Radio value="add">Add Language</Radio>
              <Radio value="update">Update Language</Radio>
            </Stack>
          </RadioGroup>
          {mode === 'update' && (
            <ChakraSelect
              placeholder="Select Language to Edit"
              onChange={(e) => setSelectedLanguageId(e.target.value)}
              bg="bg-surface"
              borderColor="border-default"
            >
              {languages.map((language) => (
                <option key={language._id} value={language._id}>
                  {language.name}
                </option>
              ))}
            </ChakraSelect>
          )}
          <Box w={"full"} bg="bg-surface" border="1px solid" borderColor="border-default" p={6} rounded={"lg"}>
            <Text fontSize="sm" fontWeight="bold" color="text-muted" textTransform="uppercase" letterSpacing="wide" mb={4}>
              {mode === 'update' ? "Editing Language" : "Creating a New Entry"}
            </Text>
            <VStack spacing={4}>
              <Input
                placeholder="Language Name"
                name="name"
                value={newLanguage.name}
                onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
              />
              <Input
                placeholder="Language Code"
                name="code"
                value={newLanguage.code}
                onChange={(e) => setNewLanguage({ ...newLanguage, code: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                name="description"
                value={newLanguage.description}
                onChange={(e) => setNewLanguage({ ...newLanguage, description: e.target.value })}
              />
              <Select
                isMulti
                options={africanCountries}
                value={newLanguage.countries}
                onChange={(selectedOptions) => setNewLanguage({ ...newLanguage, countries: selectedOptions })}
                placeholder="Select Countries"
                styles={selectStyles}
              />
              <Button
                colorScheme="blue"
                onClick={handleSaveLanguage}
                w={"full"}
              >
                {mode === 'update' ? "Update Language" : "Add Language"}
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </>
  )
}

export default AddNewLANG