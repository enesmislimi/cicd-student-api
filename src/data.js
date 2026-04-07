const initialStudents = [
    { id: 1, firstName: "Alice", lastName: "Dupont", email: "alice@example.com", grade: 14, field: "informatique" },
    { id: 2, firstName: "Bob", lastName: "Martin", email: "bob@example.com", grade: 12, field: "mathématiques" },
    { id: 3, firstName: "Charlie", lastName: "Durand", email: "charlie@example.com", grade: 18, field: "physique" },
    { id: 4, firstName: "Diana", lastName: "Bernard", email: "diana@example.com", grade: 9, field: "chimie" },
    { id: 5, firstName: "Enes", lastName: "Mislimi", email: "enes@example.com", grade: 16, field: "informatique" }
];

// Tableau dynamique 
const students = JSON.parse(JSON.stringify(initialStudents));

// Fonction pour les tests automatisés : remet le tableau à zéro
const resetStudents = () => {
    students.length = 0; // Vide le tableau actuel sans casser la référence
    const copy = JSON.parse(JSON.stringify(initialStudents));
    copy.forEach(student => students.push(student));
};

// Export le tableau et la fonction pour pouvoir les utiliser dans app.js
module.exports = {
    students,
    resetStudents
};