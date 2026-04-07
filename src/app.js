const express = require('express');
const { students } = require('./data');

const app = express();

// Middleware obligatoire pour lire le JSON dans le corps des requêtes (POST/PUT)
app.use(express.json());


// 1. GET /students/stats
app.get('/students/stats', (req, res) => {
    if (students.length === 0) return res.status(200).json({ message: "Aucun étudiant" });

    const totalStudents = students.length;
    const averageGrade = (students.reduce((acc, s) => acc + s.grade, 0) / totalStudents).toFixed(2);
    const bestStudent = Math.max(...students.map(s => s.grade));
    
    const studentsByField = students.reduce((acc, s) => {
        acc[s.field] = (acc[s.field] || 0) + 1;
        return acc;
    }, {});

    res.status(200).json({ totalStudents, averageGrade: parseFloat(averageGrade), studentsByField, bestStudent });
});

// 2. GET /students/search?q=...
app.get('/students/search', (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: "Le paramètre 'q' est requis" });
    }
    const lowerQuery = query.toLowerCase();
    const results = students.filter(s => 
        s.firstName.toLowerCase().includes(lowerQuery) || 
        s.lastName.toLowerCase().includes(lowerQuery)
    );
    res.status(200).json(results);
});

// --- ROUTES CRUD CLASSIQUES ---

// 3. GET /students
app.get('/students', (req, res) => {
    res.status(200).json(students);
});

// 4. GET /students/:id
app.get('/students/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "L'ID doit être un nombre" });

    const student = students.find(s => s.id === id);
    if (!student) return res.status(404).json({ error: "Étudiant introuvable" });

    res.status(200).json(student);
});

// Fonction utilitaire pour valider les données d'un étudiant (pour POST et PUT)
const validateStudentData = (data) => {
    const { firstName, lastName, email, grade, field } = data;
    const allowedFields = ["informatique", "mathématiques", "physique", "chimie"];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstName || !lastName || !email || grade === undefined || !field) return "Tous les champs sont obligatoires";
    if (firstName.length < 2 || lastName.length < 2) return "Le nom et prénom doivent faire au moins 2 caractères";
    if (!emailRegex.test(email)) return "Format d'email invalide";
    if (grade < 0 || grade > 20) return "La note doit être entre 0 et 20";
    if (!allowedFields.includes(field)) return "Filière non autorisée";

    return null; // Null signifie aucune erreur
};

// 5. POST /students
app.post('/students', (req, res) => {
    const error = validateStudentData(req.body);
    if (error) return res.status(400).json({ error });

    if (students.find(s => s.email === req.body.email)) {
        return res.status(409).json({ error: "Cet email existe déjà" });
    }

    const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    const newStudent = { id: newId, ...req.body };
    students.push(newStudent);

    res.status(201).json(newStudent);
});

// 6. PUT /students/:id
app.put('/students/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "L'ID doit être un nombre" });

    const index = students.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ error: "Étudiant introuvable" });

    const error = validateStudentData(req.body);
    if (error) return res.status(400).json({ error });

    // Vérifier l'unicité de l'email (en ignorant l'étudiant actuel)
    if (students.find(s => s.email === req.body.email && s.id !== id)) {
        return res.status(409).json({ error: "Cet email est déjà pris par un autre étudiant" });
    }

    students[index] = { id, ...req.body };
    res.status(200).json(students[index]);
});

// 7. DELETE /students/:id
app.delete('/students/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "L'ID doit être un nombre" });

    const index = students.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ error: "Étudiant introuvable" });

    students.splice(index, 1);
    res.status(200).json({ message: "Étudiant supprimé avec succès" });
});

// On exporte l'app sans faire "app.listen" !
module.exports = app;