const countries=[
    'Gabon',
    'Gambia',
    'Germany',
    'Kenya',
    'Kiribati',
    'Uganda',
    'Tanzania',
    'Togo',
    'Seychelles',
    'Sierra Leone',
    'Somalia',
    'South Sudan'
]

export const getCountries = (req, res) => {
    try {
        res.status(200).json({ success: true, data: countries });
    } catch (error) {
        console.error(`Error while fetching countries: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const addCountry = (req, res) => {
    const { country } = req.body;
    if (!country || typeof country !== 'string') {
        return res.status(400).json({ success: false, message: 'Invalid country name' });
    }

    if (countries.includes(country)) {
        return res.status(400).json({ success: false, message: 'Country already exists' });
    }

    countries.push(country);
    res.status(201).json({ success: true, message: 'Country added successfully', data: countries });
}