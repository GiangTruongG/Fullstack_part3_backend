const mongoose = require('mongoose');

if (process.argv.length < 3) {
    console.log('give password as argument');
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person);
        })
    });
    process.exit(1);
};

const password = process.argv[2];

const url = `mongodb+srv://truonggiang66866:${password}@cluster0.i2in4zu.mongodb.net/PhoneBook?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);

mongoose.connect(url);

const personSchema = new mongoose.Schema({
    name: String,
    number: String
});

const Person = mongoose.model('Person', personSchema);

let person;

if (process.argv.length < 4) {
    Person.find({}).then(persons => {
        console.log(`Phonebook:`);
        persons.forEach(person => {
            console.log(`${person.name} ${person.number}`);
        })
        mongoose.connection.close();
    });
} else {
    person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    });

    person.save().then(result => {
        console.log(`Added ${process.argv[3]} number ${process.argv[4]} to phonebook!`);
        mongoose.connection.close();
    });
};
