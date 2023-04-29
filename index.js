const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');

let persons = [
    { 
    id: 1,
    name: "Arto Hellas", 
    number: '040-123456'
    },
    { 
    id: 2,
    name: 'Ada Lovelace', 
    number: '39-44-5323523'
    },
    { 
    id: 3,
    name: 'Dan Abramov', 
    number: '12-43-234345'
    },
    { 
    id: 4,
    name: 'Mary Poppendieck', 
    number: '39-23-6423122'
    }
];

app.use(cors());

app.use(express.static('build'))

const morganLogFunction = morgan((tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        req.body.name ? JSON.stringify(req.body) : ''
      ].join(' ')
})

app.use(morganLogFunction);

app.use(express.json());

app.get('/api/persons', (request, response) => {
    response.json(persons);
});

app.get('/info', (request, response) => {
    const date = new Date();

    const responseToClient = `
        <div>
            <br>
            <p>Phonebook has info for ${persons.length}</p>
            <br>
            <p>${date}</p>
        </div>
    `;
    response.send(responseToClient);
});

app.get('/api/persons/:id', (request, response) => {
    const personId = request.params.id;

    const person = persons.find(person => person.id === Number(personId));

    if (person) {
        response.send(person);
    } else {
        response.status(404).send('The person does not exsist in the phonebook!');
    } 
});

app.delete('/api/persons/:id', (request, response) => {
    const personId = Number(request.params.id);

    console.log(personId);

    persons = persons.filter(person => person.id !== personId);

    response.status(204).end();
});

const generateId = () => {
    const maxId = persons.length > 0 ? Math.max(...persons.map(person => person.id)) : 0;

    return maxId + 1
};

app.post('/api/persons', (request, response) => {
    const body = request.body;

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing'
        })
    };

    const exsistedPerson = persons.find(person => person.name.toLocaleLowerCase() === body.name.toLocaleLowerCase());
    
    if (exsistedPerson) {
        return response.status(400).json({
            error: 'Person exsisted!'
        });
    };

    const person = {
        ...body,
        id: generateId()
    };

    persons = persons.concat(person);

    response.json(persons);
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});