const request = require('supertest');
const app = require('../src/app');
const { resetStudents } = require('../src/data');

// On réinitialise les données avant CHAQUE test
beforeEach(() => {
    resetStudents();
});

describe('API Students', () => {

    // --- Tests GET (Lecture) ---
    describe('GET /students', () => {
        test('1. Doit renvoyer 200 et un tableau', async () => {
            const res = await request(app).get('/students');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
        });

        test('2. Doit renvoyer tous les étudiants initiaux (5)', async () => {
            const res = await request(app).get('/students');
            expect(res.body.length).toBe(5);
        });

        test('3. GET /students/:id valide doit renvoyer l\'étudiant', async () => {
            const res = await request(app).get('/students/1');
            expect(res.statusCode).toBe(200);
            expect(res.body.id).toBe(1);
            expect(res.body.firstName).toBe("Alice");
        });

        test('4. GET /students/:id inexistant doit renvoyer 404', async () => {
            const res = await request(app).get('/students/999');
            expect(res.statusCode).toBe(404);
        });

        test('5. GET /students/:id invalide (lettres) doit renvoyer 400', async () => {
            const res = await request(app).get('/students/abc');
            expect(res.statusCode).toBe(400);
        });
    });

    // --- Tests POST (Création) ---
    describe('POST /students', () => {
        test('6. POST avec données valides doit renvoyer 201', async () => {
            const newStudent = {
                firstName: "Jean", lastName: "Valjean", email: "jean@example.com", grade: 15, field: "mathématiques"
            };
            const res = await request(app).post('/students').send(newStudent);
            expect(res.statusCode).toBe(201);
            expect(res.body.id).toBeDefined(); // L'ID doit être auto-généré
        });

        test('7. POST sans champ obligatoire doit renvoyer 400', async () => {
            const res = await request(app).post('/students').send({ firstName: "Jean" }); // Il manque des champs
            expect(res.statusCode).toBe(400);
        });

        test('8. POST avec note invalide (> 20) doit renvoyer 400', async () => {
            const res = await request(app).post('/students').send({
                firstName: "Jean", lastName: "Valjean", email: "jean2@example.com", grade: 25, field: "informatique"
            });
            expect(res.statusCode).toBe(400);
        });

        test('9. POST avec email déjà existant doit renvoyer 409', async () => {
            const res = await request(app).post('/students').send({
                firstName: "Copieur", lastName: "Test", email: "alice@example.com", grade: 10, field: "chimie"
            });
            expect(res.statusCode).toBe(409);
        });
    });

    // --- Tests PUT (Modification) ---
    describe('PUT /students/:id', () => {
        test('10. PUT avec données valides doit renvoyer 200', async () => {
            const updateData = {
                firstName: "AliceModifiée", lastName: "Dupont", email: "alice@example.com", grade: 16, field: "informatique"
            };
            const res = await request(app).put('/students/1').send(updateData);
            expect(res.statusCode).toBe(200);
            expect(res.body.firstName).toBe("AliceModifiée");
        });

        test('11. PUT avec ID inexistant doit renvoyer 404', async () => {
            const updateData = {
                firstName: "Test", lastName: "Test", email: "test@test.com", grade: 10, field: "informatique"
            };
            const res = await request(app).put('/students/999').send(updateData);
            expect(res.statusCode).toBe(404);
        });
    });

    // --- Tests DELETE (Suppression) ---
    describe('DELETE /students/:id', () => {
        test('12. DELETE avec ID valide doit renvoyer 200', async () => {
            const res = await request(app).delete('/students/1');
            expect(res.statusCode).toBe(200);
        });

        test('13. DELETE avec ID inexistant doit renvoyer 404', async () => {
            const res = await request(app).delete('/students/999');
            expect(res.statusCode).toBe(404);
        });
    });

    // --- Tests Stats & Search ---
    describe('Stats & Search', () => {
        test('14. GET /students/stats doit renvoyer les statistiques', async () => {
            const res = await request(app).get('/students/stats');
            expect(res.statusCode).toBe(200);
            expect(res.body.totalStudents).toBe(5);
            expect(res.body.bestStudent).toBeDefined();
        });

        test('15. GET /students/search?q=... doit renvoyer les résultats', async () => {
            const res = await request(app).get('/students/search?q=alice');
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0].firstName.toLowerCase()).toBe("alice");
        });
    });
});