const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const url = process.env.MONGODB_URI;

mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB', result);
    })
    .catch(error => {
        console.log('error connecting to MongoDB', error.message);
    });

const validator = (val) => {
    let numberPattern = /^[0-9]+$/;

    if (numberPattern.test(val.substring(0, 3))) {
        if (val.charAt(3) === '-') {
            if (numberPattern.test(val.substring(4))) {
                return true;
            }
        }
    } else if (numberPattern.test(val.substring(0, 2))) {
        if (val.charAt(2) === '-') {
            if (numberPattern.test(val.substring(3))) {
                return true;
            }
        }
    }

    return false;
};

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        minLength: 8,
        validate: [validator, 'Phone number invalid!']
    }
});

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

module.exports = mongoose.model('Person', personSchema);
