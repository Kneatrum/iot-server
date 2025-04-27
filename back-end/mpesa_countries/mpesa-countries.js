


// This file contains a list of countries in Africa where MPESA is operational.
mpesa_countries = {
    Kenya: {
        countryCode: 'KE',
        countryName: 'Kenya',
        currencyCode: 'KES',
        currencyName: 'Kenyan Shilling',
        currencySymbol: 'KSh'
    },
    Uganda: {
        countryCode: 'UG',
        countryName: 'Uganda',
        currencyCode: 'UGX',
        currencyName: 'Ugandan Shilling',
        currencySymbol: 'USh'
    },
    Tanzania: {
        countryCode: 'TZ',
        countryName: 'Tanzania',
        currencyCode: 'TZS',
        currencyName: 'Tanzanian Shilling',
        currencySymbol: 'TSh'
    },
    Ethiopia: {
        countryCode: 'ET',
        countryName: 'Ethiopia',
        currencyCode: 'ETB',
        currencyName: 'Ethiopian Birr',
        currencySymbol: 'Br'
    },
    Ghana: {
        countryCode: 'GH',
        countryName: 'Ghana',
        currencyCode: 'GHS',
        currencyName: 'Ghanaian Cedi',
        currencySymbol: 'GH₵'
    },
    Mozambique: {
        countryCode: 'MZ',
        countryName: 'Mozambique',
        currencyCode: 'MZN',
        currencyName: 'Mozambican Metical',
        currencySymbol: 'MT'
    },
    SouthAfrica: {
        countryCode: 'ZA',
        countryName: 'South Africa',
        currencyCode: 'ZAR',
        currencyName: 'South African Rand',
        currencySymbol: 'R'
    },
    DemocraticRepublicOfCongo: {
        countryCode: 'CD',
        countryName: 'Democratic Republic of the Congo',
        currencyCode: 'CDF',
        currencyName: 'Congolese Franc',
        currencySymbol: 'FC'
    },
    Egypt: {
        countryCode: 'EG',
        countryName: 'Egypt',
        currencyCode: 'EGP',
        currencyName: 'Egyptian Pound',
        currencySymbol: 'E£'
    },
    Lesotho: {
        countryCode: 'LS',
        countryName: 'Lesotho',
        currencyCode: 'LSL',
        currencyName: 'Lesotho Loti',
        currencySymbol: 'L'
    }
    
}


function retrieveCurrencyCodes(countries) {
    let currencyCodes = "";
    for (let country in countries) {
        if (countries.hasOwnProperty(country)) {
            currencyCodes += countries[country].currencyCode + ",";
        }
    }
    // Remove the trailing comma
    currencyCodes = currencyCodes.slice(0, -1);
    return currencyCodes;
}

function getCurrencyCodes() {
    // Retrieve the currency codes from the mpesa_countries object
    const currencyCodes = retrieveCurrencyCodes(mpesa_countries);
    return currencyCodes;
}




module.exports = { getCurrencyCodes, mpesa_countries };