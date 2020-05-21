const fs = require('fs')

const writeJsonTofile = async (jsonContent, fileName) => {
    fs.writeFileSync(fileName, jsonContent, 'utf8', function (err) {
        if (err) {
            console.log('An error occured while writing JSON Object to File.');
            return console.log(err);
        }

        console.log("JSON file has been saved.");
    });
}

const inArray = async (array, obj) => {
    if (array.indexOf(obj) === -1) {
        return false;
    }

    return true;
}


const readFileToJson = async (fileName) => {
    try {
        const data = fs.readFileSync(fileName, 'utf8')

        if (data)
            return JSON.parse(data);

    } catch (error) {
        return false;
    }
}

const sleep = async (miliseconds) => {
    return new Promise(resolve => {
        setTimeout(resolve, miliseconds);
    })
}

module.exports = {
    writeJsonTofile,
    readFileToJson,
    inArray,
    sleep
}