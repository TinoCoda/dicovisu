import React from 'react'
import { useState } from 'react'

function AddNewEntry() {
  const [word, setWord] = useState({
    word: "",
    meaning: "",
    language:"",
    description: "",
    example: "",

  }); 
  return (
    <div>AddNewEntry</div>
  )
}

export default AddNewEntry