const Matcher = require('./RegexMatcher')
const Tester = require('./RegexTester')

const zipcodeRegex = {
  regex: '[-\\s]?[A-Z]?[-\\s]?([0-9]{5})[\\s]+',
  group: 1,
  positive: {
    'ienstr. 68/III.OG, 30171 Hannover': '30171',
    'Deutschland GmbH, Musterstraße  7 - 9,  12055  Berlin': '12055',
    '05.10.1954, Sachsenwaldau 8, D 21465 Reinbek': '21465',
    '05.10.1954, Sachsenwaldau 8, D21465 Reinbek': '21465',
    '8, D\r\n-21465\nReinbek': '21465',
  },
  negative: [
    // 'AG Charlottenburg, HRB 116588 vertr',
  ],
}

const houseNumber = {
  regex: '([A-Z]{1,2} [0-9]+|[0-9][0-9A-z\\s-]*)([\\s]*[,\\/][\\s]*[A-z0-9. ]*)?',
  group: {
    number: 1,
    appartment: 2,
  },
  positive: {
    'Irgendeine Straße 7': { number: '7' },
    'Irgendeine Straße 7-9': { number: '7-9' },
    'Irgendeine Straße 7 - 9': { number: '7 - 9' },
    'Irgendeine Straße 7 -\n9': { number: '7 -\n9' },
    'Irgendeine Straße 7s': { number: '7s' },
    'Irgendeine Straße 7\ns': { number: '7\ns' },
    'Irgendeine Straße 7S': { number: '7S' },
    'K 4': { number: 'K 4' }, // For Mannheim addresses
    'Irgendeine Straße 7 a': { number: '7 a' },
    'Irgendeine Straße 7/III.OG': { number: '7', appartment: '/III.OG' }, // Regex also must cover III.OG
    'Irgendeine Straße 7, III.OG': { number: '7', appartment: ', III.OG' }, // Regex also must cover III.OG

    // Regex also must cover III.OG
    // Irgendeine Straße 7 3. Stock': { number: '7', appartment: '3. Stock' },
  },
  negative: [
    'AG Charlottenburg, HRB vertr',
  ],
}

const streetName = {
  regex: '([A-ZÖÄÜ]([\\s][0-9]*|[A-z öüäÖÜÄß. -]*))',
  group: 1,
  positive: {
    'Irgendeine Straße 7': 'Irgendeine Straße ',
    'wohnhaft Irgeneine Str. 7-9': 'Irgeneine Str. ',
    'Völlig-egal-Allee 7': 'Völlig-egal-Allee ',
    'H 3': 'H 3', // Mannheim has some sort of grid, so some street names have numbers
    'Test Street\r\nGartenstraße 99\r\n88212 Ravensburg': 'Test Street', // Should not match street name accross multiple lines ()
  },
  negative: [
    '1312 2312 1-2 3123- kleine straße',
  ],
}

const zipcodeAndCityRegex = {
  regex: `${zipcodeRegex.regex}([A-ZÖÄÜ][\\wßÖÜÄöüä. -]+)`,
  group: zipcodeRegex.group + 1,
  positive: {
    'ienstr. 68/III.OG, 30171 Hannover': 'Hannover',
    'Deutschland GmbH, Musterstraße  7 - 9,  12055  Berlin-mit-Bindestrich': 'Berlin-mit-Bindestrich',
    '05.10.1954, Sachsenwaldau 8, D 21465 Frankfurt am Main shouldnotmatch': 'Frankfurt am Main shouldnotmatch', // With no limiting character this will happen
    '05.10.1954, Sachsenwaldau 8, D 21465 Frankfurt am Main, shouldnotmatch': 'Frankfurt am Main',
    '05.10.1954, Sachsenwaldau 8, D 21465 Frankfurt a. Main': 'Frankfurt a. Main',
    'Pilotystraße 68, 90408 Nürnberg': 'Nürnberg', // test umlauts
    '12345 Aßlar': 'Aßlar',
  },
  negative: [
    'AG Charlottenburg, HRB 116588 vertr',
  ],
}

const addressRegex = {
  regex: `${streetName.regex}[\\s]*${houseNumber.regex}[,\\s]+${zipcodeAndCityRegex.regex}`,
  group: {
    street: 1,
    houseNumber: 3,
    // appartment: 3,
    zipcode: 5,
    city: 6,
  },
  positive: {
    'Deutschland GmbH, Musterstraße 7,  12055  Berlin-mit-Bindestrich': { street: 'Musterstraße ', houseNumber: '7', zipcode: '12055', city: 'Berlin-mit-Bindestrich' },
    'Bierstr. 68/III.OG,\n\r30171\n\rHannover': { street: 'Bierstr. ', houseNumber: '68', zipcode: '30171' },
    'Deutschland GmbH, Musterstraße  7 - 9,  12055  Berlin-mit-Bindestrich': { street: 'Musterstraße  ', houseNumber: '7 - 9' },
    '05.10.1954, Sachsenwaldau 8, D 21465 Frankfurt am Main': { street: 'Sachsenwaldau ', houseNumber: '8' },
    'Pilötstraße 99, 90408 Nürnberg': { street: 'Pilötstraße ', houseNumber: '99', zipcode: '90408', city: 'Nürnberg' }, // test unlauts
    'Company Name\r\nGartenstraße 99\r\n88212 Ravensburg': { street: 'Gartenstraße ', houseNumber: '99\r', zipcode: '88212', city: 'Ravensburg' }, // newlines instead of commata
    'Liebigstraße 99\na, 65193 Wiesbaden': { street: 'Liebigstraße ', houseNumber: '99\na', zipcode: '65193', city: 'Wiesbaden' },
    'Liebigstr.99, 65193 Wiesbaden': { street: 'Liebigstr.', houseNumber: '99', zipcode: '65193', city: 'Wiesbaden' },
    'Liebigstr. 99 -\n100, 65193 Wiesbaden,': { street: 'Liebigstr. ', houseNumber: '99 -\n100', zipcode: '65193', city: 'Wiesbaden' },
    'Liebigstr. 29,15370 Petershagen': { street: 'Liebigstr. ', houseNumber: '29', zipcode: '15370', city: 'Petershagen' },
    'Liebigstr.\r\n29, 15370 Petershagen': { street: 'Liebigstr.', houseNumber: '29', zipcode: '15370', city: 'Petershagen' },
    'Liebigstr. 29, EG, 15370\nPetershagen': { street: 'Liebigstr. ', houseNumber: '29', zipcode: '15370', city: 'Petershagen' },
    'Am Katzenrain 1, 35614\r\nAßlar': { street: 'Am Katzenrain ', houseNumber: '1', zipcode: '35614', city: 'Aßlar' },
    // 'H 3, 8a, 12345 Mannheim'
    // ' Am Katzenrain 1, 35614\nAßlar'
    //Braschenstr.\r\n18 a, 295258 Uelzen
    // Hüttenweg 4 (früher: Liethstr. 4), 37603 Holzminden
    // Glindwiese 58, EG, 22177 Hamburg
    // Bermerst. 23  3. Stock, 23121 Stadt
  },
  negative: [
    'AG Charlottenburg, HRB 116588 vertr',
  ],
}

const addressReverseRegex = {
  regex: `([0-9]{5})[,\\s]+([^,]+)[,\\s]+${streetName.regex}[\\s]*${houseNumber.regex}`,
  group: {
    street: 3,
    houseNumber: 5,
    // appartment: 3,
    zipcode: 1,
    city: 2,
  },
  positive: {
    '65193 Wiesbaden, Liebigstr.99': { street: 'Liebigstr.', houseNumber: '99', zipcode: '65193', city: 'Wiesbaden' },
    // 'H 3, 8a, 12345 Mannheim'
    // ' Am Katzenrain 1, 35614\nAßlar'

    // Glindwiese 58, EG, 22177 Hamburg
    // Bermerst. 23  3. Stock, 23121 Stadt
  },
  negative: [
    'AG Charlottenburg, HRB 116588 vertr',
  ],
}


const expressions = [
  zipcodeRegex,
  zipcodeAndCityRegex,
  streetName,
  houseNumber,
  addressRegex,
  addressReverseRegex,
]

expressions.forEach(r => Tester.testRegex(r))

module.exports = {
  regex: new RegExp(addressRegex.regex),
  matcher: new Matcher(addressRegex),
}
