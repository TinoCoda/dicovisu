import React, { useState, useEffect } from 'react'
import { Box, Container, Text, VStack, Heading, useColorModeValue, Input, Button, useToast, Textarea, Radio, RadioGroup, Stack, Select as ChakraSelect } from "@chakra-ui/react"
import Select from 'react-select'
import { useLanguageStore } from '../store/languages'

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

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? 'gray.700' : 'gray.800',
    color: 'white',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'gray.800',
    color: 'white',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? 'gray.600' : 'gray.800',
    color: 'white',
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: 'gray.700',
    color: 'white',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: 'white',
  }),
};

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

    console.log(newLanguage);
  }

  return (
    <>
      <Container maxW={"container.sm"}>
        <VStack spacing={8}>
          <Heading as="h1" size="2xl" textAlign={"center"} mb={8}>
            {mode === 'update' ? "Edit Language" : "Add a New Language"}
          </Heading>
          <RadioGroup onChange={setMode} value={mode}>
            <Stack direction="row" spacing={5}>
              <Radio value="add">Add Language</Radio>
              <Radio value="update">Update Language</Radio>
            </Stack>
          </RadioGroup>
          {mode === 'update' && (
            <ChakraSelect
              placeholder="Select Language to Edit"
              onChange={(e) => setSelectedLanguageId(e.target.value)}
            >
              {languages.map((language) => (
                <option key={language._id} value={language._id}>
                  {language.name}
                </option>
              ))}
            </ChakraSelect>
          )}
          <Box w={"full"} bg={useColorModeValue("white", "gray.800")} p={6} rounded={"lg"} shadow={"md"}>
            <Text fontSize="xl">{mode === 'update' ? "Editing Language" : "Creating a New Entry"}</Text>
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
                styles={customStyles}
              />
              <Button
                colorScheme="teal"
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