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